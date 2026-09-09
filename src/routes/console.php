<?php

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

Schedule::command('calendar:sync-google')
    ->dailyAt('00:00')
    ->timezone(config('services.google_calendar.timezone'))
    ->withoutOverlapping();
