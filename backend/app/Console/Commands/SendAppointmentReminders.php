<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class SendAppointmentReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
   public function handle()
{
    // 1. Marrim VETËM NJË termin, cilindo që nuk është njoftuar ende
    $appointment = \App\Models\Appointments::where('is_notified', false)->first();

    if (!$appointment) {
        $this->error("Nuk u gjet asnjë termin me is_notified = false në të gjithë databazën!");
        return;
    }

    $this->info("Duke provuar dërgimin te: " . $appointment->client_email);

    try {
        \Illuminate\Support\Facades\Mail::to($appointment->client_email)
            ->send(new \App\Mail\AppointmentReminder($appointment));

        $appointment->update(['is_notified' => true]);
        $this->info("SUKSES: Emaili u dërgua dhe is_notified u bë true.");
    } catch (\Exception $e) {
        $this->error("GABIM: " . $e->getMessage());
    }
}
}
