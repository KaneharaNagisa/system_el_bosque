<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Availability;
use App\Models\Reservation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AvailabilityController extends Controller
{
    public function index(): Response
    {
        $availabilities = Availability::orderBy('date')
            ->get()
            ->mapWithKeys(fn($a) => [
                $a->date->format('Y-m-d') => $a->status,
            ]);

        $bookedReservations = Reservation::with('user')
            ->where('status', 'confirmed')
            ->get()
            ->flatMap(
                fn($r) => collect(range(0, $r->check_in->diffInDays($r->check_out) - 1))
                    ->map(fn($i) => [
                        'date' => $r->check_in->addDays($i)->format('Y-m-d'),
                        'info' => [
                            'id'         => 'RSV-' . str_pad($r->id, 3, '0', STR_PAD_LEFT),
                            'guestName'  => $r->user->name,
                            'guestCount' => $r->guests,
                            'checkIn'    => $r->check_in->format('Y-m-d'),
                            'checkOut'   => $r->check_out->format('Y-m-d'),
                            'phone'      => $r->user->phone,
                            'status'     => $r->status,
                        ],
                    ])
            )
            ->mapWithKeys(fn($item) => [$item['date'] => $item['info']]);

        return Inertia::render('Admin/Availability', [
            'availabilities'     => $availabilities,
            'bookedReservations' => $bookedReservations,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $request->validate([
            'date'   => ['required', 'date'],
            'status' => ['required', 'in:available,booked,cleaning,closed,offseason,manual_blocked'],
        ]);

        Availability::updateOrCreate(
            ['date' => $request->date],
            ['status' => $request->status]
        );

        return back()->with('message', '予約枠を更新しました');
    }
}
