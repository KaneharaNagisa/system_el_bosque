<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Availability;
use App\Models\Reservation;
use App\Services\GoogleCalendarSyncService;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

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
            [
                'status' => $request->status,
                'source' => null,
            ]
        );

        return back()->with('message', '予約枠を更新しました');
    }

    public function syncGoogleCalendar(Request $request, GoogleCalendarSyncService $calendar): RedirectResponse
    {
        $validated = $request->validate([
            'start' => ['required', 'date'],
            'end' => ['required', 'date', 'after_or_equal:start'],
        ]);

        try {
            $count = $calendar->sync(
                CarbonImmutable::parse($validated['start']),
                CarbonImmutable::parse($validated['end']),
            );

            $conflictedDates = $calendar->lastConflictDates();
            if (!empty($conflictedDates)) {
                return back()->with('warning', 'Googleカレンダーの予定が既存予約と重複しています: ' . implode(', ', $conflictedDates) . '。管理者へ通知しました。')->with('message', "Googleカレンダーを同期し、{$count}日を確認しました");
            }
        } catch (Throwable $exception) {
            Log::error('Google Calendar sync failed', ['exception' => $exception]);

            return back()->withErrors([
                'googleCalendar' => 'Googleカレンダーを同期できませんでした。連携設定と通信状況を確認してください。',
            ]);
        }

        return back()->with('message', "Googleカレンダーを同期し、{$count}日を確認しました");
    }
}
