<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Experience extends Model
{
    protected $fillable = [
        'name',
        'description',
        'price',
        'price_note',
        'duration',
        'recommended_people',
        'season',
        'season_tag',
        'period',
        'period_start',
        'period_end',
        'requires_reservation',
        'points',
        'notes',
        'image',
        'popularity',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'requires_reservation' => 'boolean',
            'is_active'            => 'boolean',
            'points'               => 'array',
            'period_start'         => 'date',
            'period_end'           => 'date',
        ];
    }
}
