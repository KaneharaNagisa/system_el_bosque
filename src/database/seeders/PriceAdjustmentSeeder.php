<?php

namespace Database\Seeders;

use App\Models\PriceAdjustment;
use Illuminate\Database\Seeder;

class PriceAdjustmentSeeder extends Seeder
{
    public function run(): void
    {
        $adjustments = [
            [
                'name' => '連泊割引',
                'discount_percent' => 10,
                'has_period' => false,
                'period_start' => null,
                'period_end' => null,
                'has_guest_range' => true,
                'guest_min' => 1,
                'guest_max' => 3,
                'no_experience_options' => false,
                'no_support_plan' => false,
                'status' => 'active',
            ],
            [
                'name' => '移住割引',
                'discount_percent' => 50,
                'has_period' => false,
                'period_start' => null,
                'period_end' => null,
                'has_guest_range' => false,
                'guest_min' => null,
                'guest_max' => null,
                'no_experience_options' => true,
                'no_support_plan' => false,
                'status' => 'active',
            ],
            [
                'name' => '仮住まい割引',
                'discount_percent' => 95,
                'has_period' => false,
                'period_start' => null,
                'period_end' => null,
                'has_guest_range' => false,
                'guest_min' => null,
                'guest_max' => null,
                'no_experience_options' => true,
                'no_support_plan' => true,
                'status' => 'active',
            ],
            [
                'name' => '親戚利用',
                'discount_percent' => 100,
                'has_period' => false,
                'period_start' => null,
                'period_end' => null,
                'has_guest_range' => false,
                'guest_min' => null,
                'guest_max' => null,
                'no_experience_options' => true,
                'no_support_plan' => true,
                'status' => 'active',
            ],
        ];

        foreach ($adjustments as $adjustment) {
            PriceAdjustment::firstOrCreate(['name' => $adjustment['name']], $adjustment);
        }
    }
}
