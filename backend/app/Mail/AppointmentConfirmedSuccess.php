<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\URL; // Shto këtë

class AppointmentConfirmedSuccess extends Mailable
{
    use Queueable, SerializesModels;

    public $appointment;
    public $cancelUrl;

    /**
     * Tani pranojmë vetëm $appointment.
     * $cancelUrl e gjenerojmë automatikisht këtu.
     */
    public function __construct($appointment)
    {
        $this->appointment = $appointment;
        
        // Gjenerojmë linkun e anulimit direkt këtu që Controller-i të jetë i pastër
        $this->cancelUrl = URL::signedRoute('appointment.cancel', ['id' => $appointment->id]);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Konfirmuar: Detajet e terminit tuaj ✅',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.appointment-success',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}