<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class GoogleCalendarReservationConflictMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param  array<int, string>  $dates
     */
    public function __construct(
        public array $dates,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '【System El Bosque】Googleカレンダー予定と予約の重複を検知しました',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.google-calendar-conflict',
            with: [
                'dates' => $this->dates,
            ],
        );
    }
}
