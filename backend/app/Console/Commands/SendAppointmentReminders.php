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
    try {
        // Ora aktuale
        $now = \Carbon\Carbon::now();
        
        // Ora fiks pas 60 minutave
        $targetTime = $now->copy()->addHour();

        $this->info("Checking for appointments starting at: " . $targetTime->toDateTimeString());

        // Kërkojmë terminët që fillojnë në këtë minutë (tolerancë 1 minutë)
        $appointments = \App\Models\Appointments::where('is_notified', false)
            ->where('status', 'confirmed')
            ->whereBetween('start_time', [
                $targetTime->copy()->startOfMinute(), 
                $targetTime->copy()->endOfMinute()
            ])
            ->get();

        if ($appointments->count() > 0) {
            foreach ($appointments as $appointment) {
                // Përdorim direkt Resend API (porta 443) për të shmangur bllokimin e Railway
                \Resend\Laravel\Facades\Resend::emails()->send([
                    'from'    => 'PlanoraBook <support@planorabook.com>',
                    'to'      => [$appointment->client_email],
                    'subject' => 'Kujtesë: Termini juaj pas 1 ore ✅',
                    'html'    => (new \App\Mail\AppointmentReminder($appointment))->render(),
                ]);

                $appointment->update(['is_notified' => true]);
                $this->info("✅ Reminder dërguar për: " . $appointment->client_email);
            }
        } else {
            $this->info("ℹ️ Nuk u gjet asnjë termin që fillon fiks pas 1 ore.");
        }

        return 0;
    } catch (\Exception $e) {
        $this->error("❌ Error: " . $e->getMessage());
        return 1;
    }
}
}
