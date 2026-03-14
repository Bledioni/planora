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
    $appointments = \App\Models\Appointments::where('is_notified', false)
        ->where('start_time', '<=', now()->addHours(1))
        ->where('start_time', '>', now())
        ->get();

    foreach ($appointments as $appointment) {
        \Illuminate\Support\Facades\Mail::to($appointment->client_email)
            ->send(new \App\Mail\AppointmentReminder($appointment));

        $appointment->update(['is_notified' => true]);
    }

    $this->info('Emailet u dërguan me sukses!');
}
}
