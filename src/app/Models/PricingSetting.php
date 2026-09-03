<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Yasumi\Yasumi;

class PricingSetting extends Model
{
    protected $fillable = [
        'base_rate',
        'additional_guest_rate',
        'weekday_rate',
        'holiday_rate',
        'check_in_time',
        'check_out_time',
        'period_rates',
    ];

    protected function casts(): array
    {
        return [
            'period_rates' => 'array',
        ];
    }

    public static function current(): self
    {
        return static::firstOrCreate([], [
            'base_rate' => 20000,
            'additional_guest_rate' => 3000,
            'weekday_rate' => 20000,
            'holiday_rate' => 26000,
            'check_in_time' => '15:00',
            'check_out_time' => '11:00',
            'period_rates' => [],
        ]);
    }

    public function rateFor(CarbonInterface $date): int
    {
        $monthDay = $date->format('m-d');

        foreach ($this->period_rates ?? [] as $period) {
            $start = $period['start'] ?? '';
            $end = $period['end'] ?? '';
            $isInPeriod = $start <= $end
                ? $monthDay >= $start && $monthDay <= $end
                : $monthDay >= $start || $monthDay <= $end;

            if ($start && $end && $isInPeriod) {
                return (int) $period['rate'];
            }
        }

        if ($date->isFriday() || $date->isWeekend() || Yasumi::create('Japan', $date->year, 'ja_JP')->isHoliday($date)) {
            return $this->holiday_rate;
        }

        if ($date->isMonday() || $date->isTuesday() || $date->isWednesday() || $date->isThursday()) {
            return $this->weekday_rate;
        }

        return $this->base_rate;
    }

    public function amountForStay(CarbonInterface $checkIn, int $nights): int
    {
        if ($nights <= 0) {
            return 0;
        }

        return collect(range(0, $nights - 1))
            ->sum(fn(int $offset) => $this->rateFor($checkIn->copy()->addDays($offset)));
    }

    public function additionalGuestAmount(int $guests, int $nights): int
    {
        return max(0, $guests - 5) * (int) $this->additional_guest_rate * max(0, $nights);
    }

    public function priceBreakdown(Reservation $reservation, array $breakdown): array
    {
        $nights = (int) $reservation->check_in->diffInDays($reservation->check_out);
        $breakdown['baseAmount'] = $this->amountForStay($reservation->check_in, $nights);
        $breakdown['guestExtra'] = $this->additionalGuestAmount($reservation->guests, $nights);

        return $breakdown;
    }

    public function totalForBreakdown(array $breakdown): int
    {
        return collect([
            'baseAmount',
            'guestExtra',
            'petFee',
            'supportFee',
            'transferSurcharge',
            'experiencesTotal',
            'deposit',
            'adjustment',
        ])->sum(fn(string $key) => (int) ($breakdown[$key] ?? 0));
    }

    public function toFrontend(): array
    {
        $holidayDates = collect(range(now()->year, now()->year + 5))
            ->flatMap(fn(int $year) => array_values(
                Yasumi::create('Japan', $year, 'ja_JP')->getHolidayDates()
            ))
            ->values()
            ->all();

        return [
            'baseRate' => $this->base_rate,
            'additionalGuestRate' => $this->additional_guest_rate,
            'weekdayRate' => $this->weekday_rate,
            'holidayRate' => $this->holiday_rate,
            'checkInTime' => substr((string) $this->check_in_time, 0, 5),
            'checkOutTime' => substr((string) $this->check_out_time, 0, 5),
            'periodRates' => $this->period_rates ?? [],
            'holidayDates' => $holidayDates,
        ];
    }
}
