<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Reservation extends Model
{
    protected $fillable = [
        'reservation_code',
        'user_id',
        'check_in',
        'check_out',
        'guests',
        'has_pet',
        'pet_breed',
        'support_fee',
        'experiences',
        'status',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'check_in'     => 'date',
            'check_out'    => 'date',
            'support_fee'  => 'boolean',
            'experiences'  => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function billing(): HasOne
    {
        return $this->hasOne(Billing::class);
    }
}
