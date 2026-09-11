<?php

namespace Database\Seeders;

use App\Models\PricingSetting;
use Illuminate\Database\Seeder;

class PricingSettingSeeder extends Seeder
{
    public function run(): void
    {
        PricingSetting::firstOrCreate([], [
            'base_rate' => 20000,
            'additional_guest_rate' => 3000,
            'weekday_rate' => 20000,
            'holiday_rate' => 26000,
            'check_in_time' => '15:00',
            'check_out_time' => '10:00',
            'period_rates' => [
                ['name' => 'GW', 'start' => '04-29', 'end' => '05-05', 'rate' => 33000],
                ['name' => 'お盆', 'start' => '08-11', 'end' => '08-17', 'rate' => 33000],
                ['name' => '年末年始', 'start' => '12-30', 'end' => '01-03', 'rate' => 33000],
            ],
        ]);
    }
}
