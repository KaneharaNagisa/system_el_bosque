<?php

namespace App\Services;

use App\Models\Availability;
use App\Models\Admin;
use App\Models\Reservation;
use App\Mail\GoogleCalendarReservationConflictMail;
use Carbon\CarbonImmutable;
use Carbon\CarbonPeriod;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class GoogleCalendarSyncService
{
    private const SOURCE = 'google_calendar';

    private array $lastConflictDates = [];

    public function sync(CarbonImmutable $start, CarbonImmutable $end): int
    {
        if ($end->isBefore($start)) {
            throw new RuntimeException('同期終了日は開始日以降にしてください。');
        }

        $blockedDates = $this->blockedDates($start, $end);
        $this->lastConflictDates = $this->conflictedReservationDates($blockedDates);
        $conflictedDates = $this->lastConflictDates;

        DB::transaction(function () use ($start, $end, $blockedDates) {
            Availability::query()
                ->where('source', self::SOURCE)
                ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
                ->delete();

            foreach ($blockedDates as $date) {
                $availability = Availability::query()
                    ->whereDate('date', $date)
                    ->first();

                if ($availability?->status === 'manual_blocked' && $availability->source !== self::SOURCE) {
                    continue;
                }

                $values = [
                    'status' => 'manual_blocked',
                    'note' => 'Googleカレンダーの予定により予約不可',
                    'source' => self::SOURCE,
                ];

                if ($availability) {
                    $availability->update($values);
                } else {
                    Availability::create(['date' => $date] + $values);
                }
            }
        });

        if (!empty($conflictedDates)) {
            $adminEmails = Admin::query()
                ->whereNotNull('email')
                ->pluck('email')
                ->filter()
                ->unique()
                ->values()
                ->all();

            if (!empty($adminEmails)) {
                Mail::to($adminEmails)->send(new GoogleCalendarReservationConflictMail($conflictedDates));
            }
        }

        return count($blockedDates);
    }

    /**
     * @return array<int, string>
     */
    public function lastConflictDates(): array
    {
        return $this->lastConflictDates;
    }

    public function createReservationEvent(Reservation $reservation): void
    {
        if ($reservation->google_calendar_event_id || $reservation->status === 'cancelled') {
            return;
        }

        $reservation->loadMissing('user');
        $timezone = config('services.google_calendar.timezone') ?: 'Asia/Tokyo';
        $guestName = $reservation->user?->name ?: $reservation->user?->email ?: '会員';
        $event = $this->calendarRequest()->post($this->eventsUrl(), [
            'summary' => 'エルボスケ予約',
            'description' => "予約番号: {$reservation->reservation_code}\n利用者: {$guestName}",
            'start' => [
                'date' => $reservation->check_in->toDateString(),
                'timeZone' => $timezone,
            ],
            'end' => [
                'date' => $reservation->check_out->toDateString(),
                'timeZone' => $timezone,
            ],
            'extendedProperties' => [
                'private' => ['reservation_code' => $reservation->reservation_code],
            ],
        ])->throw()->json();

        if (empty($event['id'])) {
            throw new RuntimeException('Google Calendarの予約予定IDを取得できませんでした。');
        }

        $reservation->update(['google_calendar_event_id' => $event['id']]);
    }

    public function deleteReservationEvent(Reservation $reservation): void
    {
        if (!$reservation->google_calendar_event_id) {
            return;
        }

        $response = $this->calendarRequest()->delete(
            $this->eventsUrl() . '/' . rawurlencode($reservation->google_calendar_event_id),
        );

        if (!$response->successful() && $response->status() !== 404) {
            $response->throw();
        }

        $reservation->update(['google_calendar_event_id' => null]);
    }

    /**
     * @param  array<int, string>  $blockedDates
     * @return array<int, string>
     */
    private function conflictedReservationDates(array $blockedDates): array
    {
        if (empty($blockedDates)) {
            return [];
        }

        $calendarDates = collect($blockedDates)->unique()->values();
        $confirmedReservations = Reservation::query()
            ->where('status', 'confirmed')
            ->get();

        $conflicts = $calendarDates
            ->filter(function (string $date) use ($confirmedReservations) {
                return $confirmedReservations->contains(
                    fn(Reservation $reservation): bool => $reservation->check_in->lte($date)
                        && $reservation->check_out->gt($date)
                );
            })
            ->unique()
            ->sort()
            ->values()
            ->all();

        return $conflicts;
    }

    private function blockedDates(CarbonImmutable $start, CarbonImmutable $end): array
    {
        $events = [];
        $pageToken = null;

        do {
            $response = $this->calendarRequest()->get(
                'https://www.googleapis.com/calendar/v3/calendars/' . rawurlencode($this->calendarId()) . '/events',
                array_filter([
                    'timeMin' => $start->startOfDay()->toIso8601String(),
                    'timeMax' => $end->addDay()->startOfDay()->toIso8601String(),
                    'singleEvents' => 'true',
                    'orderBy' => 'startTime',
                    'pageToken' => $pageToken,
                ]),
            )->throw()->json();

            $events = array_merge($events, $response['items'] ?? []);
            $pageToken = $response['nextPageToken'] ?? null;
        } while ($pageToken);

        return collect($events)
            ->reject(fn(array $event) => ($event['status'] ?? null) === 'cancelled')
            ->flatMap(fn(array $event) => $this->eventDates($event, $start, $end))
            ->unique()
            ->sort()
            ->values()
            ->all();
    }

    private function eventDates(array $event, CarbonImmutable $rangeStart, CarbonImmutable $rangeEnd): array
    {
        $timezone = config('services.google_calendar.timezone') ?: 'Asia/Tokyo';
        $isAllDay = isset($event['start']['date']);
        $eventStart = CarbonImmutable::parse($event['start']['date'] ?? $event['start']['dateTime'])->setTimezone($timezone);
        $eventEnd = CarbonImmutable::parse($event['end']['date'] ?? $event['end']['dateTime'])->setTimezone($timezone);
        $lastDate = $isAllDay || $eventEnd->isStartOfDay() ? $eventEnd->subDay() : $eventEnd;
        $start = $eventStart->startOfDay()->max($rangeStart->startOfDay());
        $end = $lastDate->startOfDay()->min($rangeEnd->startOfDay());

        if ($end->isBefore($start)) {
            return [];
        }

        return collect(CarbonPeriod::create($start, $end))
            ->map(fn($date) => $date->format('Y-m-d'))
            ->all();
    }

    private function calendarRequest(): PendingRequest
    {
        $tokenResponse = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'client_id' => config('services.google_calendar.client_id'),
            'client_secret' => config('services.google_calendar.client_secret'),
            'refresh_token' => config('services.google_calendar.refresh_token'),
            'grant_type' => 'refresh_token',
        ])->throw()->json();

        if (empty($tokenResponse['access_token'])) {
            throw new RuntimeException('Google Calendarのアクセストークンを取得できませんでした。');
        }

        return Http::withToken($tokenResponse['access_token'])->acceptJson();
    }

    private function eventsUrl(): string
    {
        return 'https://www.googleapis.com/calendar/v3/calendars/'
            . rawurlencode($this->calendarId()) . '/events';
    }

    private function calendarId(): string
    {
        $calendarId = config('services.google_calendar.calendar_id');

        if (!$calendarId) {
            throw new RuntimeException('Google Calendar IDが設定されていません。');
        }

        return $calendarId;
    }
}
