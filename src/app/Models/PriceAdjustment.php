<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PriceAdjustment extends Model
{
    protected $fillable = [
        'name',
        'discount_percent',
        'has_period',
        'period_start',
        'period_end',
        'has_guest_range',
        'guest_min',
        'guest_max',
        'no_experience_options',
        'no_support_plan',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'has_period'            => 'boolean',
            'has_guest_range'       => 'boolean',
            'no_experience_options' => 'boolean',
            'no_support_plan'       => 'boolean',
            'period_start'          => 'date',
            'period_end'            => 'date',
        ];
    }
}
