<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Carbon\Carbon;
use Resend\Laravel\Facades\Resend;
use App\Models\Appointments;
use Illuminate\Support\Facades\Log;

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
    protected $description = 'Dërgon kujtesat për terminët fiks 1 orë para fillimit.';

    /**
     * Execute the console command.
     */
    public function handle()
{
    try {
        $now = Carbon::now('UTC');
        $targetStart = $now->copy()->addMinutes(55);
        $targetEnd = $now->copy()->addMinutes(65);

        $appointments = Appointments::where('is_notified', false)
            ->where('status', 'confirmed')
            ->whereBetween('start_time', [$targetStart, $targetEnd])
            ->get();

        foreach ($appointments as $appointment) {
            Resend::emails()->send([
                'from'    => 'Planora <support@planorabook.com>',
                'to'      => [$appointment->client_email],
                'subject' => 'Kujtesë: Termini juaj pas 1 ore ✅',
                'html'    => "<h3>Përshëndetje!</h3><p>Termini juaj fillon në <strong>" . Carbon::parse($appointment->start_time)->format('H:i') . "</strong>.</p>",
            ]);

            $appointment->update(['is_notified' => true]);
        }

        return 0;
    } catch (\Exception $e) {
        Log::error("REMINDER_COMMAND_ERROR: " . $e->getMessage());
        return 1;
    }
}
}