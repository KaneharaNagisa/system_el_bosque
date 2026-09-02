<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RegistrationConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $registrationUrl,
        public string $recipientEmail,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '【System El Bosque】本会員登録のご案内',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.registration-confirmation',
            with: [
                'registrationUrl' => $this->registrationUrl,
                'recipientEmail' => $this->recipientEmail,
            ],
        );
    }
}
