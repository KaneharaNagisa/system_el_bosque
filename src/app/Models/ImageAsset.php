<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ImageAsset extends Model
{
    protected $fillable = ['key', 'label', 'path'];

    protected $casts = [
        'variants' => 'array',
    ];
}
