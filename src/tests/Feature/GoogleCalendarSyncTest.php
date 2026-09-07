<?php

namespace Tests\Feature;

use App\Models\Availability;
use App\Services\GoogleCalendarSyncService;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class GoogleCalendarSyncTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_syncs_busy_dates_without_overwriting_manual_blocks(): void
    {
        config()->set('services.google_calendar', [
            'client_id' => 'client-id',
            'client_secret' => 'client-secret',
            'refresh_token' => 'refresh-token',
            'calendar_id' => 'primary',
        ]);

        Availability::create([
            'date' => '2026-09-10',
            'status' => 'manual_blocked',
            'note' => 'Owner block',
        ]);
        Availability::create([
            'date' => '2026-09-11',
            'status' => 'available',
        ]);
        Availability::create([
            'date' => '2026-09-15',
            'status' => 'closed',
            'source' => 'google_calendar',
        ]);

        Http::fake([
            'oauth2.googleapis.com/token' => Http::response(['access_token' => 'access-token']),
            'www.googleapis.com/calendar/v3/*' => Http::response([
                'items' => [
                    [
                        'status' => 'confirmed',
                        'start' => ['date' => '2026-09-10'],
                        'end' => ['date' => '2026-09-12'],
                    ],
                    [
                        'status' => 'confirmed',
                        'start' => ['dateTime' => '2026-09-13T22:00:00+09:00'],
                        'end' => ['dateTime' => '2026-09-14T01:00:00+09:00'],
                    ],
                    [
                        'status' => 'confirmed',
                        'transparency' => 'transparent',
                        'start' => ['date' => '2026-09-16'],
                        'end' => ['date' => '2026-09-17'],
                    ],
                ],
            ]),
        ]);

        $count = app(GoogleCalendarSyncService::class)->sync(
            CarbonImmutable::parse('2026-09-01'),
            CarbonImmutable::parse('2026-09-30'),
        );

        $this->assertSame(4, $count);
        $this->assertDatabaseHas('availabilities', [
            'date' => '2026-09-10',
            'status' => 'manual_blocked',
            'source' => null,
        ]);
        foreach (['2026-09-11', '2026-09-13', '2026-09-14'] as $date) {
            $this->assertDatabaseHas('availabilities', [
                'date' => $date,
                'status' => 'manual_blocked',
                'source' => 'google_calendar',
            ]);
        }
        $this->assertDatabaseMissing('availabilities', ['date' => '2026-09-15']);
        $this->assertDatabaseMissing('availabilities', ['date' => '2026-09-16']);

        Http::assertSentCount(2);
    }
}
