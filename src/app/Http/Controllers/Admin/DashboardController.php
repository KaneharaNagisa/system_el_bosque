<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $stats = [
            'totalMembers'         => User::count(),
            'newMembersThisMonth'  => User::whereMonth('created_at', now()->month)->count(),
            'activeMembers'        => User::where('status', 'active')->count(),
            'paidReservations'     => Reservation::whereHas('billing', fn($query) => $query->where('status', 'paid'))->count(),
            'reservationsThisMonth' => Reservation::whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])->count(),
        ];

        $recentReservations = Reservation::with('user')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($r) => [
                'id'         => 'RSV-' . str_pad($r->id, 3, '0', STR_PAD_LEFT),
                'memberName' => $r->user->nickname ?? '−',
                'checkIn'    => $r->check_in->format('Y-m-d'),
                'checkOut'   => $r->check_out->format('Y-m-d'),
                'guests'     => $r->guests,
                'status'     => $r->status,
                'payment'    => $r->billing?->status ?? 'unpaid',
            ]);

        return Inertia::render('Admin/Dashboard', compact('stats', 'recentReservations'));
    }
}
