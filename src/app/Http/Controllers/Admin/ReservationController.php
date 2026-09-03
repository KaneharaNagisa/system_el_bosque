<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Availability;
use App\Models\Billing;
use App\Models\PriceAdjustment;
use App\Models\PricingSetting;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ReservationController extends Controller
{
    public function index(): Response
    {
        $pricingSetting = PricingSetting::current();
        $reservations = Reservation::with(['user', 'billing'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($r) {
                $breakdown = $r->billing?->breakdown ?? [];

                return [
                    'id'           => 'RSV-' . str_pad($r->id, 3, '0', STR_PAD_LEFT),
                    'dbId'         => $r->id,
                    'memberId'     => 'MBR-' . str_pad($r->user_id, 3, '0', STR_PAD_LEFT),
                    'memberName'   => $this->fullName($r->user),
                    'memberEmail'  => $r->user->email ?? '−',
                    'memberPhone'  => $r->user->phone ?? '−',
                    'checkIn'      => $r->check_in->format('Y-m-d'),
                    'checkOut'     => $r->check_out->format('Y-m-d'),
                    'nights'       => $r->check_in->diffInDays($r->check_out),
                    'guests'       => $r->guests,
                    'hasPet'       => $r->has_pet,
                    'petBreed'     => $r->pet_breed,
                    'supportFee'   => $r->support_fee,
                    'experiences'  => $r->experiences ?? [],
                    'breakdown'    => $breakdown,
                    'status'       => $r->status,
                    'payment'      => $r->billing?->status ?? 'unpaid',
                    'totalAmount'  => $r->billing?->amount ?? 0,
                    'note'         => $r->note,
                    'createdAt'    => $r->created_at->format('Y-m-d'),
                ];
            });

        $priceAdjustmentRules = PriceAdjustment::orderBy('created_at')
            ->get()
            ->map(fn($r) => [
                'id'                  => 'ADJ-' . str_pad($r->id, 3, '0', STR_PAD_LEFT),
                'dbId'                => $r->id,
                'name'                => $r->name,
                'discountPercent'     => $r->discount_percent,
                'hasPeriod'           => $r->has_period,
                'periodStart'         => $r->period_start?->format('Y-m-d') ?? '',
                'periodEnd'           => $r->period_end?->format('Y-m-d') ?? '',
                'hasGuestRange'       => $r->has_guest_range,
                'guestMin'            => $r->guest_min,
                'guestMax'            => $r->guest_max,
                'noExperienceOptions' => $r->no_experience_options,
                'noSupportPlan'       => $r->no_support_plan,
                'status'              => $r->status,
            ]);

        $members = User::orderBy('last_name')->orderBy('first_name')
            ->get()
            ->map(fn($u) => [
                'id'            => 'MBR-' . str_pad($u->id, 3, '0', STR_PAD_LEFT),
                'dbId'          => $u->id,
                'lastName'      => $u->last_name ?? '',
                'firstName'     => $u->first_name ?? '',
                'lastNameKana'  => $u->last_name_kana ?? '',
                'firstNameKana' => $u->first_name_kana ?? '',
                'email'         => $u->email,
                'phone'         => $u->phone ?? '',
                'joinedAt'      => $u->created_at->format('Y-m-d'),
                'totalStays'    => $u->reservations()->count(),
            ]);

        $availabilities = Availability::orderBy('date')
            ->get()
            ->mapWithKeys(fn($a) => [
                $a->date->format('Y-m-d') => $a->status,
            ]);

        $bookedDates = Reservation::where('status', 'confirmed')
            ->get()
            ->flatMap(
                fn($r) => collect(range(0, $r->check_in->diffInDays($r->check_out) - 1))
                    ->map(fn($i) => $r->check_in->copy()->addDays($i)->format('Y-m-d'))
            )
            ->unique()
            ->values()
            ->all();

        $experiences = \App\Models\Experience::where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->map(fn($e) => [
                'label'       => $e->name,
                'seasonTag'   => $e->season_tag ?? '通年',
                'periodStart' => $e->period_start,
                'periodEnd'   => $e->period_end,
                'price'       => $e->price,
                'priceNote'   => $e->price_note,
                'pricingType' => $e->pricing_type ?? 'per_group',
                'period'      => $e->period,
            ]);

        $pricingSetting = $pricingSetting->toFrontend();

        return Inertia::render('Admin/Reservations', compact('reservations', 'priceAdjustmentRules', 'members', 'availabilities', 'bookedDates', 'experiences', 'pricingSetting'));
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'member_db_id'     => ['required', 'integer', 'exists:users,id'],
            'check_in'         => ['required', 'date'],
            'check_out'        => ['required', 'date', 'after:check_in'],
            'guests'           => ['required', 'integer', 'min:1', 'max:10'],
            'has_pet'          => ['required', 'in:none,small1,small2,large1,large2'],
            'pet_breed'        => ['nullable', 'string', 'max:100'],
            'support_fee'      => ['required', 'boolean'],
            'experiences'      => ['nullable', 'array'],
            'status'           => ['required', 'in:confirmed,cancelled,noshow'],
            'payment'          => ['required', 'in:paid,unpaid,refunded'],
            'note'             => ['nullable', 'string', 'max:1000'],
            'adjustment'       => ['nullable', 'integer'],
            'adjustment_note'  => ['nullable', 'string', 'max:255'],
            'adjustment_rule_id' => ['nullable', 'string', 'max:20'],
            'pet_fee'          => ['required', 'integer'],
            'support_fee_amount' => ['required', 'integer'],
            'transfer_surcharge' => ['required', 'integer'],
            'experiences_total' => ['required', 'integer'],
            'deposit'          => ['required', 'integer'],
        ]);

        $code = 'RSV-' . strtoupper(Str::random(8));

        $reservation = Reservation::create([
            'reservation_code' => $code,
            'user_id'          => $request->member_db_id,
            'check_in'         => $request->check_in,
            'check_out'        => $request->check_out,
            'guests'           => $request->guests,
            'has_pet'          => $request->has_pet,
            'pet_breed'        => $request->pet_breed,
            'support_fee'      => $request->support_fee,
            'experiences'      => $request->experiences ?? [],
            'status'           => $request->status,
            'note'             => $request->note,
        ]);

        $pricingSetting = PricingSetting::current();
        $breakdown = $pricingSetting->priceBreakdown($reservation, [
            'petFee'            => $request->pet_fee,
            'supportFee'        => $request->support_fee_amount,
            'transferSurcharge' => $request->transfer_surcharge,
            'experiencesTotal'  => $request->experiences_total,
            'deposit'           => $request->deposit,
        ]);
        if ($request->adjustment) {
            $breakdown['adjustment']       = $request->adjustment;
            $breakdown['adjustmentNote']   = $request->adjustment_note ?? null;
            $breakdown['adjustmentRuleId'] = $request->adjustment_rule_id ?? null;
        }

        Billing::create([
            'billing_code'   => 'BIL-' . strtoupper(Str::random(8)),
            'reservation_id' => $reservation->id,
            'amount'         => max(0, $pricingSetting->totalForBreakdown($breakdown)),
            'breakdown'      => $breakdown,
            'status'         => $request->payment,
            'due_date'       => $request->check_in,
        ]);

        return back()->with('message', '予約を登録しました');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $request->validate([
            'status' => ['required', 'in:pending,confirmed,cancelled,noshow'],
        ]);

        Reservation::findOrFail($id)->update(['status' => $request->status]);

        return back()->with('message', '予約を更新しました');
    }

    public function updatePayment(Request $request, int $id): RedirectResponse
    {
        $request->validate([
            'payment' => ['required', 'in:paid,unpaid,refunded'],
        ]);

        $reservation = Reservation::with('billing')->findOrFail($id);
        if (!$reservation->billing) {
            return back()->with('error', '請求データが存在しません');
        }

        $reservation->billing->applyPaymentStatus($request->payment);

        return back()->with('message', '支払状況を更新しました');
    }

    public function updateExperiences(Request $request, int $id): RedirectResponse
    {
        $request->validate([
            'experiences' => ['nullable', 'array'],
        ]);

        Reservation::findOrFail($id)->update([
            'experiences' => $request->experiences ?? [],
        ]);

        return back()->with('message', '体験オプションを更新しました');
    }

    public function updateSupport(Request $request, int $id): RedirectResponse
    {
        $request->validate([
            'support_fee' => ['required', 'boolean'],
        ]);

        Reservation::findOrFail($id)->update([
            'support_fee' => $request->support_fee,
        ]);

        return back()->with('message', '滞在サポートを更新しました');
    }

    public function updateAdjustment(Request $request, int $id): RedirectResponse
    {
        $request->validate([
            'adjustment'         => ['required', 'integer'],
            'adjustment_note'    => ['nullable', 'string', 'max:255'],
            'adjustment_rule_id' => ['nullable', 'string', 'max:20'],
        ]);

        $reservation = Reservation::with('billing')->findOrFail($id);
        $billing     = $reservation->billing;
        if (!$billing) {
            return back()->with('error', '請求データが存在しません');
        }

        $breakdown = $billing->breakdown ?? [];
        $prevAdj   = $breakdown['adjustment'] ?? 0;
        $newAdj    = (int) $request->adjustment;

        $breakdown['adjustment']       = $newAdj !== 0 ? $newAdj : null;
        $breakdown['adjustmentNote']   = ($newAdj !== 0 && $request->adjustment_note) ? $request->adjustment_note : null;
        $breakdown['adjustmentRuleId'] = ($newAdj !== 0 && $request->adjustment_rule_id) ? $request->adjustment_rule_id : null;

        $billing->update([
            'breakdown' => $breakdown,
            'amount'    => max(0, $billing->amount - $prevAdj + $newAdj),
        ]);

        return back()->with('message', '料金調整を保存しました');
    }

    private function fullName($user): string
    {
        if (!$user) return '−';
        $last  = $user->last_name ?? $user->name ?? '';
        $first = $user->first_name ?? '';
        return trim("$last $first") ?: '−';
    }
}
