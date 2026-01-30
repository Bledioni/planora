<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AppointmentConfirmedSuccess extends Mailable
{
    use Queueable, SerializesModels;

    // These properties must be public to be accessible in the Blade view
    public $appointment;
    public $cancelUrl;

    /**
     * Create a new message instance.
     * We pass the appointment data and the generated cancel link here.
     */
    public function __construct($appointment, $cancelUrl)
    {
        $this->appointment = $appointment;
        $this->cancelUrl = $cancelUrl;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Konfirmuar: Detajet e terminit tuaj ✅',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.appointment-success', // Points to resources/views/emails/appointment-success.blade.php
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [];
    }
}