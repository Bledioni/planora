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
        $now = \Carbon\Carbon::now();
        $this->info("Checking for reminders at: " . $now->toDateTimeString());

        $appointments = \App\Models\Appointments::where('is_notified', false)
            ->where('status', 'confirmed')
            ->where('start_time', '<=', $now->copy()->addMinutes(65))
            ->where('start_time', '>', $now)
            ->get();

        if ($appointments->count() > 0) {
            foreach ($appointments as $appointment) {
                // FORCE: Përdorim mailer('resend') që të anashkalojmë portën 587
                \Illuminate\Support\Facades\Mail::mailer('resend')
                    ->to($appointment->client_email)
                    ->send(new \App\Mail\AppointmentReminder($appointment));

                $appointment->is_notified = true;
                $appointment->save();
                
                $this->info("✅ Reminder sent to: {$appointment->client_email}");
            }
        } else {
            $this->info("ℹ️ No reminders to send right now.");
        }

        return 0;
    } catch (\Exception $e) {
        // Kjo do të na tregojë error-in fiks në Railway Logs
        $this->error("❌ Error: " . $e->getMessage());
        \Illuminate\Support\Facades\Log::error("Reminder Error: " . $e->getMessage());
        return 1;
    }
}
}
