<?php

namespace Tests\Feature;

use App\Models\Availability;
use App\Models\Admin;
use App\Models\Reservation;
use App\Models\User;
use App\Mail\GoogleCalendarReservationConflictMail;
use App\Services\GoogleCalendarSyncService;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
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

        $this->assertSame(5, $count);

        $manualBlock = Availability::query()->whereDate('date', '2026-09-10')->firstOrFail();
        $this->assertSame('2026-09-10', $manualBlock->date->toDateString());
        $this->assertSame('manual_blocked', $manualBlock->status);
        $this->assertNull($manualBlock->source);
        $this->assertSame('Owner block', $manualBlock->note);

        foreach (['2026-09-11', '2026-09-13', '2026-09-14', '2026-09-16'] as $date) {
            $googleBlock = Availability::query()->whereDate('date', $date)->firstOrFail();
            $this->assertSame($date, $googleBlock->date->toDateString());
            $this->assertSame('manual_blocked', $googleBlock->status);
            $this->assertSame('google_calendar', $googleBlock->source);
        }

        $this->assertFalse(Availability::query()->whereDate('date', '2026-09-15')->exists());

        Http::assertSentCount(2);
    }

    public function test_it_sends_admin_email_when_google_event_conflicts_with_confirmed_reservation(): void
    {
        Mail::fake();

        Admin::create([
            'name' => '管理者',
            'email' => 'admin@elbosque.jp',
            'password' => 'secret',
            'role' => 'system_admin',
        ]);

        config()->set('services.google_calendar', [
            'client_id' => 'client-id',
            'client_secret' => 'client-secret',
            'refresh_token' => 'refresh-token',
            'calendar_id' => 'primary',
        ]);

        $user = User::factory()->create([
            'name' => 'テスト宿泊者',
            'email' => 'guest@example.com',
        ]);

        Reservation::create([
            'reservation_code' => 'RSV-001',
            'user_id' => $user->id,
            'check_in' => '2026-09-20',
            'check_out' => '2026-09-23',
            'guests' => 2,
            'status' => 'confirmed',
        ]);

        Http::fake([
            'oauth2.googleapis.com/token' => Http::response(['access_token' => 'access-token']),
            'www.googleapis.com/calendar/v3/*' => Http::response([
                'items' => [
                    [
                        'status' => 'confirmed',
                        'start' => ['date' => '2026-09-21'],
                        'end' => ['date' => '2026-09-22'],
                    ],
                ],
            ]),
        ]);

        app(GoogleCalendarSyncService::class)->sync(
            CarbonImmutable::parse('2026-09-01'),
            CarbonImmutable::parse('2026-09-30'),
        );

        Mail::assertSent(GoogleCalendarReservationConflictMail::class, function ($mail) {
            return $mail->dates === ['2026-09-21'];
        });
    }

    public function test_it_creates_a_reservation_event_and_stores_its_id(): void
    {
        config()->set('services.google_calendar', [
            'client_id' => 'client-id',
            'client_secret' => 'client-secret',
            'refresh_token' => 'refresh-token',
            'calendar_id' => 'primary',
            'timezone' => 'Asia/Tokyo',
        ]);

        $user = User::factory()->create(['name' => '予約者']);
        $reservation = Reservation::create([
            'reservation_code' => 'RSV-CREATE',
            'user_id' => $user->id,
            'check_in' => '2026-09-20',
            'check_out' => '2026-09-23',
            'guests' => 2,
            'status' => 'pending',
        ]);

        Http::fake([
            'oauth2.googleapis.com/token' => Http::response(['access_token' => 'access-token']),
            'www.googleapis.com/calendar/v3/calendars/*/events' => Http::response([
                'id' => 'google-event-1',
            ]),
        ]);

        app(GoogleCalendarSyncService::class)->createReservationEvent($reservation);

        $reservation->refresh();
        $this->assertSame('google-event-1', $reservation->google_calendar_event_id);
        Http::assertSent(fn($request) => $request->method() === 'POST'
            && str_contains($request->url(), '/calendar/v3/calendars/')
            && $request['summary'] === 'エルボスケ予約'
            && $request['start']['date'] === '2026-09-20'
            && $request['end']['date'] === '2026-09-23');
    }

    public function test_it_deletes_a_stored_reservation_event(): void
    {
        config()->set('services.google_calendar', [
            'client_id' => 'client-id',
            'client_secret' => 'client-secret',
            'refresh_token' => 'refresh-token',
            'calendar_id' => 'primary',
        ]);

        $user = User::factory()->create();
        $reservation = Reservation::create([
            'reservation_code' => 'RSV-DELETE',
            'user_id' => $user->id,
            'check_in' => '2026-09-20',
            'check_out' => '2026-09-23',
            'guests' => 2,
            'status' => 'confirmed',
            'google_calendar_event_id' => 'google-event-2',
        ]);

        Http::fake([
            'oauth2.googleapis.com/token' => Http::response(['access_token' => 'access-token']),
            'www.googleapis.com/calendar/v3/calendars/*/events/*' => Http::response([], 204),
        ]);

        app(GoogleCalendarSyncService::class)->deleteReservationEvent($reservation);

        $reservation->refresh();
        $this->assertNull($reservation->google_calendar_event_id);
        Http::assertSent(fn($request) => $request->method() === 'DELETE'
            && str_ends_with($request->url(), '/events/google-event-2'));
    }
}
