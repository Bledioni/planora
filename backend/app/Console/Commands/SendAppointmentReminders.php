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
    $now = now(); 
    $this->info("1. Koha aktuale e serverit: " . $now->toDateTimeString());

    // Marrim të gjitha terminet që nuk janë njoftuar, pa asnjë kusht kohe
    $allPending = \App\Models\Appointments::where('is_notified', false)->get();
    
    $this->info("2. Në DB u gjetën " . $allPending->count() . " termine me is_notified = false.");

    foreach ($allPending as $appointment) {
        $startTime = \Carbon\Carbon::parse($appointment->start_time);
        $diff = $now->diffInMinutes($startTime, false); // Diferenca në minuta

        $this->info("---");
        $this->info("Termini ID: " . $appointment->id);
        $this->info("Email: " . $appointment->client_email);
        $this->info("Start Time në DB: " . $appointment->start_time);
        $this->info("Diferenca (minuta): " . $diff);

        // Kushti yt
        if ($diff > 0 && $diff <= 65) {
            $this->info("STATUS: Brenda dritares! Duke dërguar...");
            \Illuminate\Support\Facades\Mail::to($appointment->client_email)
                ->send(new \App\Mail\AppointmentReminder($appointment));
            $appointment->update(['is_notified' => true]);
        } else {
            $this->info("STATUS: Jashtë dritares (Duhet të jetë mes 1 dhe 65).");
        }
    }
}
}
