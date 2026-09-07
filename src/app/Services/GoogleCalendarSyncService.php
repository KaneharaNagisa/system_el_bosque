<?php

namespace App\Services;

use App\Models\Availability;
use Carbon\CarbonImmutable;
use Carbon\CarbonPeriod;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class GoogleCalendarSyncService
{
    private const SOURCE = 'google_calendar';

    public function sync(CarbonImmutable $start, CarbonImmutable $end): int
    {
        if ($end->isBefore($start)) {
            throw new RuntimeException('同期終了日は開始日以降にしてください。');
        }

        $blockedDates = $this->blockedDates($start, $end);

        DB::transaction(function () use ($start, $end, $blockedDates) {
            Availability::query()
                ->where('source', self::SOURCE)
                ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
                ->delete();

            foreach ($blockedDates as $date) {
                $availability = Availability::query()->whereDate('date', $date)->first()
                    ?? new Availability(['date' => $date]);

                if ($availability->exists && $availability->status !== 'available') {
                    continue;
                }

                $availability->fill([
                    'status' => 'closed',
                    'note' => 'Googleカレンダーの予定により予約不可',
                    'source' => self::SOURCE,
                ])->save();
            }
        });

        return count($blockedDates);
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
            ->reject(fn(array $event) => ($event['status'] ?? null) === 'cancelled' || ($event['transparency'] ?? null) === 'transparent')
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

    private function calendarId(): string
    {
        $calendarId = config('services.google_calendar.calendar_id');

        if (!$calendarId) {
            throw new RuntimeException('Google Calendar IDが設定されていません。');
        }

        return $calendarId;
    }
}
