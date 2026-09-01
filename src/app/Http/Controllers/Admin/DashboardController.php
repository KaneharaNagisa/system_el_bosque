<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Contact;
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
            'totalReservations'    => Reservation::count(),
            'pendingReservations'  => Reservation::where('status', 'pending')->count(),
            'unansweredContacts'   => Contact::where('status', 'unread')->count(),
        ];

        $recentReservations = Reservation::with('user')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($r) => [
                'id'         => 'RSV-' . str_pad($r->id, 3, '0', STR_PAD_LEFT),
                'memberName' => $r->user->name ?? '−',
                'checkIn'    => $r->check_in->format('Y-m-d'),
                'checkOut'   => $r->check_out->format('Y-m-d'),
                'guests'     => $r->guests,
                'status'     => $r->status,
                'payment'    => $r->billing?->status ?? 'unpaid',
            ]);

        $recentContacts = Contact::latest()
            ->take(4)
            ->get()
            ->map(fn($c) => [
                'id'      => 'CNT-' . str_pad($c->id, 3, '0', STR_PAD_LEFT),
                'name'    => $c->name,
                'subject' => $c->subject,
                'date'    => $c->created_at->format('Y-m-d'),
                'status'  => $c->status,
            ]);

        return Inertia::render('Admin/Dashboard', compact('stats', 'recentReservations', 'recentContacts'));
    }
}
