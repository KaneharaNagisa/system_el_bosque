<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Billing extends Model
{
    private const DEPOSIT_REFUND_AMOUNT = 10000;

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

    public function applyPaymentStatus(string $status): void
    {
        $breakdown = $this->breakdown ?? [];
        $refundApplied = (bool) ($breakdown['depositRefunded'] ?? false);
        $refundAmount = (int) ($breakdown['depositRefundAmount'] ?? self::DEPOSIT_REFUND_AMOUNT);
        $amount = (int) $this->amount;

        if ($status === 'paid' && !$refundApplied) {
            $breakdown['depositRefunded'] = true;
            $breakdown['depositRefundAmount'] = self::DEPOSIT_REFUND_AMOUNT;
            $amount = max(0, $amount - self::DEPOSIT_REFUND_AMOUNT);
        }

        if ($status !== 'paid' && $refundApplied) {
            $breakdown['depositRefunded'] = null;
            $breakdown['depositRefundAmount'] = null;
            $amount += $refundAmount;
        }

        $this->update([
            'status' => $status,
            'paid_at' => $status === 'paid' ? now() : null,
            'breakdown' => $breakdown,
            'amount' => $amount,
        ]);
    }
}
