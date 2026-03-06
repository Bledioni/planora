<?php

namespace App\Mail;

use App\Models\Appointments;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AppointmentCancelledMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Appointments $appointment) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Termini juaj u anulua');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.appointment-cancelled');
    }
}