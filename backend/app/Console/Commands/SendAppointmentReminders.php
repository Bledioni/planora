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
            // Përdorim zonën tonë kohore që të përputhet me takimet në DB
            $timezone = 'Europe/Tirane';
            $now = Carbon::now($timezone);
            
            // Kërkojmë një dritare kohore (60 minuta para, me +- 5 minuta tolerancë për Cron-in e Railway)
            $targetStart = $now->copy()->addMinutes(55);
            $targetEnd = $now->copy()->addMinutes(65);
            
            $this->warn("Koha e Serverit (Kosovë): " . $now->toDateTimeString());
            $this->info("Duke kërkuar terminët që fillojnë mes: " . $targetStart->format('H:i') . " dhe " . $targetEnd->format('H:i'));

            // Marrim terminët e konfirmuar që nuk janë njoftuar ende
            $appointments = Appointments::where('is_notified', false)
                ->where('status', 'confirmed')
                ->whereBetween('start_time', [$targetStart, $targetEnd])
                ->get();

            $this->info("Gjeta " . $appointments->count() . " terminë për njoftim.");

            if ($appointments->count() > 0) {
                foreach ($appointments as $appointment) {
                    $this->info("Duke dërguar email te: " . $appointment->client_email);

                    // Përdorim direkt Resend API (Porta 443 - nuk bllokohet nga Railway)
                    Resend::emails()->send([
                        'from'    => 'Planora <support@planorabook.com>',
                        'to'      => [$appointment->client_email],
                        'subject' => 'Kujtesë: Termini juaj pas 1 ore ✅',
                        'html'    => "<h3>Përshëndetje!</h3><p>Kjo është një kujtesë për terminin tuaj që fillon në ora <strong>" . Carbon::parse($appointment->start_time)->format('H:i') . "</strong>.</p><p>Ju mirëpresim!</p>",
                    ]);

                    // Shënoje si të njoftuar që të mos dërgohet përsëri pas 5 minutave
                    $appointment->update(['is_notified' => true]);
                    
                    $this->info("✅ Email u dërgua me sukses!");
                }
            } else {
                $this->error("ℹ️ Nuk u gjet asnjë termin në këtë dritare kohore.");
            }

            return 0;

        } catch (\Exception $e) {
            $this->error("FATAL ERROR: " . $e->getMessage());
            Log::error("REMINDER_COMMAND_ERROR: " . $e->getMessage());
            return 1;
        }
    }
}