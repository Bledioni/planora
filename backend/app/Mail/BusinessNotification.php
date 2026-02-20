<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BusinessNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $subject;
    public $messageContent;
    public $businessName;

    public function __construct($subject, $messageContent, $businessName = null)
    {
        $this->subject = $subject;
        $this->messageContent = $messageContent;
        $this->businessName = $businessName;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.business-notification',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}