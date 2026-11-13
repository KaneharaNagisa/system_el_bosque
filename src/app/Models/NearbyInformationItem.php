<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NearbyInformationItem extends Model
{
    protected $fillable = [
        'type',
        'name',
        'subtitle',
        'category',
        'distance',
        'description',
        'operating_hours',
        'price',
        'closed_days',
        'website_url',
        'icon',
        'image_path',
        'variants',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'variants' => 'array',
            'sort_order' => 'integer',
        ];
    }
}
