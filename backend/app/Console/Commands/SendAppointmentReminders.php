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
        $targetTime = $now->copy()->addHour();
        
        // DEBUG: Shkruajmë në log-e orën e serverit
        $this->warn("SERVER TIME: " . $now->toDateTimeString());
        $this->warn("LOOKING FOR: " . $targetTime->copy()->startOfMinute() . " - " . $targetTime->copy()->endOfMinute());

        $appointments = \App\Models\Appointments::where('is_notified', false)
            ->where('status', 'confirmed')
            ->get(); // I marrim të gjitha fillimisht për test

        $this->info("TOTAL CONFIRMED & NOT NOTIFIED: " . $appointments->count());

        $toNotify = $appointments->filter(function($app) use ($targetTime) {
            $startTime = \Carbon\Carbon::parse($app->start_time);
            return $startTime->between(
                $targetTime->copy()->startOfMinute(),
                $targetTime->copy()->endOfMinute()
            );
        });

        if ($toNotify->count() > 0) {
            foreach ($toNotify as $appointment) {
                $this->info("Found appointment for: " . $appointment->client_email);
                
                \Resend\Laravel\Facades\Resend::emails()->send([
                    'from'    => 'Planora <support@planorabook.com>',
                    'to'      => [$appointment->client_email],
                    'subject' => 'Reminder pas 1 ore',
                    'html'    => "Përshëndetje, keni takim në " . $appointment->start_time,
                ]);

                $appointment->update(['is_notified' => true]);
                $this->info("✅ Email sent!");
            }
        } else {
            $this->error("❌ ZERO matches found for this specific minute.");
        }

    } catch (\Exception $e) {
        $this->error("FATAL ERROR: " . $e->getMessage());
        \Illuminate\Support\Facades\Log::error("REMINDER_FAIL: " . $e->getMessage());
    }
}
}
