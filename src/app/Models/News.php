<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class News extends Model
{
    protected $fillable = [
        'title',
        'content',
        'target',
        'status',
        'publish_date',
    ];

    protected function casts(): array
    {
        return [
            'publish_date' => 'date',
        ];
    }
}
