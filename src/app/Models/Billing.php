<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Billing extends Model
{
    protected $fillable = [
        'billing_code',
        'reservation_id',
        'amount',
        'breakdown',
        'status',
        'due_date',
        'paid_at',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'breakdown' => 'array',
            'due_date'  => 'date',
            'paid_at'   => 'datetime',
        ];
    }

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }
}
