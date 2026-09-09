<?php

use App\Models\Reservation;
use App\Services\GoogleCalendarSyncService;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('calendar:sync-google', function (GoogleCalendarSyncService $calendar) {
    $start = CarbonImmutable::today();
    $end = $start->addDays(config('services.google_calendar.sync_days'));
    $count = $calendar->sync($start, $end);

    $this->info("Google Calendar synced: {$count} blocked dates found.");
})->purpose('Sync Google Calendar events to booking availability');

Artisan::command('reservations:purge-expired-pending', function (GoogleCalendarSyncService $calendar) {
    $expiredReservations = Reservation::query()
        ->where('status', 'pending')
        ->where('created_at', '<=', now()->subHour())
        ->get();

    $expiredReservations->each(function (Reservation $reservation) use ($calendar) {
        try {
            $calendar->deleteReservationEvent($reservation);
        } catch (\Throwable $exception) {
            report($exception);
        }

        $reservation->delete();
    });

    $this->info("Expired pending reservations deleted: {$expiredReservations->count()}");
})->purpose('Delete pending reservations older than one hour');

Schedule::command('calendar:sync-google')
    ->dailyAt('00:00')
    ->timezone(config('services.google_calendar.timezone'))
    ->withoutOverlapping();

Schedule::command('reservations:purge-expired-pending')
    ->everyMinute()
    ->withoutOverlapping();
