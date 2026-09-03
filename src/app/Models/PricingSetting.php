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

        if ($date->isWeekend() || Yasumi::create('Japan', $date->year, 'ja_JP')->isHoliday($date)) {
            return $this->holiday_rate;
        }

        if ($date->isWeekday()) {
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

    public function priceBreakdown(Reservation $reservation, array $breakdown): array
    {
        $nights = $reservation->check_in->diffInDays($reservation->check_out);
        $breakdown['baseAmount'] = $this->amountForStay($reservation->check_in, $nights);
        $breakdown['guestExtra'] = max(0, $reservation->guests - 5)
            * $this->additional_guest_rate
            * $nights;

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
            'periodRates' => $this->period_rates ?? [],
            'holidayDates' => $holidayDates,
        ];
    }
}
