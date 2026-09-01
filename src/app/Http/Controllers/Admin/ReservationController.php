<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Billing;
use App\Models\PriceAdjustment;
use App\Models\Reservation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReservationController extends Controller
{
    public function index(): Response
    {
        $reservations = Reservation::with(['user', 'billing'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($r) => [
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
                'breakdown'    => $r->billing?->breakdown ?? [],
                'status'       => $r->status,
                'payment'      => $r->billing?->status ?? 'unpaid',
                'totalAmount'  => $r->billing?->amount ?? 0,
                'note'         => $r->note,
                'createdAt'    => $r->created_at->format('Y-m-d'),
            ]);

        $priceAdjustmentRules = PriceAdjustment::where('status', 'active')
            ->orderBy('created_at')
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

        return Inertia::render('Admin/Reservations', compact('reservations', 'priceAdjustmentRules'));
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $request->validate([
            'status' => ['required', 'in:pending,confirmed,cancelled'],
        ]);

        Reservation::findOrFail($id)->update(['status' => $request->status]);

        return back()->with('message', '予約を更新しました');
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
