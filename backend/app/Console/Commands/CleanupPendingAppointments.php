<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Appointments;
use Carbon\Carbon;

class CleanupPendingAppointments extends Command
{
    /**
     * The name and signature of the console command.
     * This is what you type in the terminal to run it manually.
     */
    protected $signature = 'appointments:cleanup';

    /**
     * The console command description.
     */
    protected $description = 'Anulon terminet që nuk janë konfirmuar brenda 5 minutave';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // 1. Find pending appointments older than 5 minutes
        $expiryTime = Carbon::now()->subMinutes(5);

        $expiredAppointments = Appointments::where('status', 'pending')
            ->where('created_at', '<', $expiryTime);

        $count = $expiredAppointments->count();

        if ($count > 0) {
            // 2. Update them to 'canceled' to free up the slot
            $expiredAppointments->update(['status' => 'canceled']);
            $this->info("Sukses: {$count} termine të vjetra u anuluan.");
        } else {
            $this->info("Nuk u gjet asnjë termin i vjetër për t'u anuluar.");
        }
    }
}