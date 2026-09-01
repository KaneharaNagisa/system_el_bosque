<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Availability extends Model
{
    protected $fillable = ['date', 'status', 'note'];

    protected function casts(): array
    {
        return [
            'date' => 'date',
        ];
    }
}
