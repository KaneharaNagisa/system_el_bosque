<?php

namespace Tests\Unit;

use App\Models\PricingSetting;
use App\Models\Reservation;
use Carbon\Carbon;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class PricingSettingTest extends TestCase
{
    #[DataProvider('regularRateDates')]
    public function test_it_selects_the_rate_for_the_day_of_week(string $date, int $expected): void
    {
        $setting = new PricingSetting([
            'base_rate' => 10000,
            'weekday_rate' => 20000,
            'holiday_rate' => 30000,
            'period_rates' => [],
        ]);

        $this->assertSame($expected, $setting->rateFor(Carbon::parse($date)));
    }

    public static function regularRateDates(): array
    {
        return [
            'weekday Monday' => ['2026-09-07', 20000],
            'weekday Thursday' => ['2026-09-03', 20000],
            'weekday Friday' => ['2026-09-04', 20000],
            'holiday Monday' => ['2026-09-21', 30000],
            'holiday Saturday' => ['2026-09-05', 30000],
            'holiday Sunday' => ['2026-09-06', 30000],
        ];
    }

    public function test_period_rate_takes_priority_and_can_cross_the_year_boundary(): void
    {
        $setting = new PricingSetting([
            'base_rate' => 10000,
            'weekday_rate' => 20000,
            'holiday_rate' => 30000,
            'period_rates' => [
                ['name' => '年末年始', 'start' => '12-28', 'end' => '01-05', 'rate' => 40000],
            ],
        ]);

        $this->assertSame(40000, $setting->rateFor(Carbon::parse('2026-12-30')));
        $this->assertSame(40000, $setting->rateFor(Carbon::parse('2027-01-03')));
    }

    public function test_stay_amount_sums_the_rate_for_each_night(): void
    {
        $setting = new PricingSetting([
            'base_rate' => 10000,
            'weekday_rate' => 20000,
            'holiday_rate' => 30000,
            'period_rates' => [],
        ]);

        $this->assertSame(40000, $setting->amountForStay(Carbon::parse('2026-09-03'), 2));
        $this->assertSame(0, $setting->amountForStay(Carbon::parse('2026-09-03'), 0));
    }

    public function test_it_reprices_a_reservation_breakdown_from_the_current_setting(): void
    {
        $setting = new PricingSetting([
            'additional_guest_rate' => 4000,
            'weekday_rate' => 20000,
            'holiday_rate' => 30000,
            'period_rates' => [],
        ]);
        $reservation = new Reservation([
            'check_in' => '2026-09-04',
            'check_out' => '2026-09-06',
            'guests' => 6,
        ]);

        $breakdown = $setting->priceBreakdown($reservation, [
            'baseAmount' => 1,
            'guestExtra' => 1,
            'petFee' => 2500,
            'deposit' => 10000,
            'adjustment' => -5000,
        ]);

        $this->assertSame(50000, $breakdown['baseAmount']);
        $this->assertSame(8000, $breakdown['guestExtra']);
        $this->assertSame(65500, $setting->totalForBreakdown($breakdown));
    }

    public function test_frontend_data_contains_holiday_date_strings(): void
    {
        $setting = new PricingSetting([
            'base_rate' => 10000,
            'additional_guest_rate' => 3000,
            'weekday_rate' => 20000,
            'holiday_rate' => 30000,
            'period_rates' => [],
        ]);

        $holidayDates = $setting->toFrontend()['holidayDates'];

        $this->assertContains(now()->format('Y') . '-01-01', $holidayDates);
        $this->assertContainsOnly('string', $holidayDates);
    }
}
