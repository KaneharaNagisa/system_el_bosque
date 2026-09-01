<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Billing;
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
            ->map(fn($b) => [
                'id'           => 'BIL-' . str_pad($b->id, 3, '0', STR_PAD_LEFT),
                'dbId'         => $b->id,
                'reservationId' => 'RSV-' . str_pad($b->reservation_id, 3, '0', STR_PAD_LEFT),
                'memberName'   => $b->reservation->user->name ?? '−',
                'memberEmail'  => $b->reservation->user->email ?? '−',
                'memberPhone'  => $b->reservation->user->phone ?? '−',
                'checkIn'      => $b->reservation->check_in->format('Y-m-d'),
                'checkOut'     => $b->reservation->check_out->format('Y-m-d'),
                'nights'       => $b->reservation->check_in->diffInDays($b->reservation->check_out),
                'guests'       => $b->reservation->guests,
                'hasPet'       => $b->reservation->has_pet,
                'petBreed'     => $b->reservation->pet_breed,
                'supportFee'   => $b->reservation->support_fee,
                'experiences'  => $b->reservation->experiences ?? [],
                'breakdown'    => $b->breakdown,
                'amount'       => $b->amount,
                'status'       => $b->status,
                'paidAt'       => $b->paid_at?->format('Y-m-d'),
                'dueDate'      => $b->due_date->format('Y-m-d'),
                'note'         => $b->note,
                'createdAt'    => $b->created_at->format('Y-m-d'),
            ]);

        return Inertia::render('Admin/Billing', compact('billings'));
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $request->validate([
            'status' => ['required', 'in:paid,unpaid,refunded,partial'],
        ]);

        $billing = Billing::findOrFail($id);
        $billing->update([
            'status'  => $request->status,
            'paid_at' => $request->status === 'paid' ? now() : null,
        ]);

        return back()->with('message', '請求情報を更新しました');
    }
}
