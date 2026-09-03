<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Billing;
use App\Models\PriceAdjustment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    public function index(): Response
    {
        $billings = Billing::with(['reservation.user'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($b) {
                return [
                    'id'            => 'BIL-' . str_pad($b->id, 3, '0', STR_PAD_LEFT),
                    'dbId'          => $b->id,
                    'reservationId' => 'RSV-' . str_pad($b->reservation_id, 3, '0', STR_PAD_LEFT),
                    'reservationStatus' => $b->reservation->status,
                    'memberName'    => $this->fullName($b->reservation->user ?? null),
                    'memberEmail'   => $b->reservation->user->email ?? '−',
                    'memberPhone'   => $b->reservation->user->phone ?? '−',
                    'checkIn'       => $b->reservation->check_in->format('Y-m-d'),
                    'checkOut'      => $b->reservation->check_out->format('Y-m-d'),
                    'nights'        => $b->reservation->check_in->diffInDays($b->reservation->check_out),
                    'guests'        => $b->reservation->guests,
                    'hasPet'        => $b->reservation->has_pet,
                    'petBreed'      => $b->reservation->pet_breed,
                    'supportFee'    => $b->reservation->support_fee,
                    'experiences'   => $b->reservation->experiences ?? [],
                    'breakdown'     => $b->breakdown ?? [],
                    'amount'        => $b->amount,
                    'status'        => $b->status,
                    'paidAt'        => $b->paid_at?->format('Y-m-d'),
                    'dueDate'       => $b->due_date->format('Y-m-d'),
                    'note'          => $b->note,
                    'createdAt'     => $b->created_at->format('Y-m-d'),
                ];
            });

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

        return Inertia::render('Admin/Billing', compact('billings', 'priceAdjustmentRules'));
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $request->validate([
            'status' => ['required', 'in:paid,unpaid,refunded,partial'],
        ]);

        $billing = Billing::findOrFail($id);
        $billing->applyPaymentStatus($request->status);

        return back()->with('message', '請求情報を更新しました');
    }

    public function updateAdjustment(Request $request, int $id): RedirectResponse
    {
        $request->validate([
            'adjustment'         => ['required', 'integer'],
            'adjustment_note'    => ['nullable', 'string', 'max:255'],
            'adjustment_rule_id' => ['nullable', 'string', 'max:20'],
        ]);

        $billing = Billing::findOrFail($id);
        $breakdown = $billing->breakdown ?? [];
        $previousAdjustment = (int) ($breakdown['adjustment'] ?? 0);
        $newAdj = (int) $request->adjustment;

        $breakdown['adjustment']       = $newAdj !== 0 ? $newAdj : null;
        $breakdown['adjustmentNote']   = ($newAdj !== 0 && $request->adjustment_note) ? $request->adjustment_note : null;
        $breakdown['adjustmentRuleId'] = ($newAdj !== 0 && $request->adjustment_rule_id) ? $request->adjustment_rule_id : null;

        $billing->update([
            'breakdown' => $breakdown,
            'amount'    => max(0, $billing->amount - $previousAdjustment + $newAdj),
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
