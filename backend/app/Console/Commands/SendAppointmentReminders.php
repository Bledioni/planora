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
        $now = \Carbon\Carbon::now(); // Përdor Carbon ashtu si te komanda që punon
        
        $this->info("Checking for reminders at: " . $now->toDateTimeString());

        // Kapim terminet që janë 1 deri 65 minuta larg
        $appointments = \App\Models\Appointments::where('is_notified', false)
            ->where('status', 'confirmed') // Shtoje edhe këtë për siguri
            ->where('start_time', '<=', $now->copy()->addMinutes(65))
            ->where('start_time', '>', $now)
            ->get();

        if ($appointments->count() > 0) {
            foreach ($appointments as $appointment) {
                \Illuminate\Support\Facades\Mail::to($appointment->client_email)
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
        $this->error("❌ Error: " . $e->getMessage());
        return 1;
    }
}
}
