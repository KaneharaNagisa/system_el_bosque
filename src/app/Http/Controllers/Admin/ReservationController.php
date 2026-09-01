<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
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
                'id'         => 'RSV-' . str_pad($r->id, 3, '0', STR_PAD_LEFT),
                'dbId'       => $r->id,
                'memberId'   => 'MBR-' . str_pad($r->user_id, 3, '0', STR_PAD_LEFT),
                'memberName' => $r->user->name ?? '−',
                'memberEmail' => $r->user->email ?? '−',
                'memberPhone' => $r->user->phone ?? '−',
                'checkIn'    => $r->check_in->format('Y-m-d'),
                'checkOut'   => $r->check_out->format('Y-m-d'),
                'nights'     => $r->check_in->diffInDays($r->check_out),
                'guests'     => $r->guests,
                'hasPet'     => $r->has_pet,
                'petBreed'   => $r->pet_breed,
                'supportFee' => $r->support_fee,
                'experiences' => $r->experiences ?? [],
                'status'     => $r->status,
                'payment'    => $r->billing?->status ?? 'unpaid',
                'amount'     => $r->billing?->amount ?? 0,
                'note'       => $r->note,
                'createdAt'  => $r->created_at->format('Y-m-d'),
            ]);

        return Inertia::render('Admin/Reservations', compact('reservations'));
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $request->validate([
            'status' => ['required', 'in:pending,confirmed,cancelled'],
        ]);

        Reservation::findOrFail($id)->update(['status' => $request->status]);

        return back()->with('message', '予約を更新しました');
    }
}
