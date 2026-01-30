<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AppointmentConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Define the public variables so they are accessible in your Blade view.
     */
    public $appointment;
    public $url;

    /**
     * Pass the appointment object and the signed URL from the Controller.
     */
    public function __construct($appointment, $url)
    {
        $this->appointment = $appointment;
        $this->url = $url;
    }

    /**
     * Set the Subject line of the email.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Konfirmo terminin tuaj - Planora',
        );
    }

    /**
     * Define which Blade template to use.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.confirm-appointment', // Make sure this file exists in resources/views/emails/
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