<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FacilityGalleryItem extends Model
{
    protected $fillable = ['title', 'fallback_key', 'image_path', 'variants', 'sort_order'];

    protected $casts = [
        'variants' => 'array',
        'sort_order' => 'integer',
    ];
}
