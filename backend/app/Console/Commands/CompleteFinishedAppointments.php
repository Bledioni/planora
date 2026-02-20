<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Appointments;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class CompleteFinishedAppointments extends Command
{
    protected $signature = 'appointments:complete-finished';
    protected $description = 'Automatically mark appointments as completed when finish_time has passed';

    public function handle()
    {
        try {
            $now = Carbon::now();
            
            // Find all confirmed appointments where finish_time has passed
            $appointments = Appointments::where('status', 'confirmed')
                ->where('finish_time', '<', $now)
                ->get();

            $count = $appointments->count();

            if ($count > 0) {
                // Update each appointment individually to ensure proper string handling
                foreach ($appointments as $appointment) {
                    $appointment->status = 'completed';
                    $appointment->save();
                }

                $this->info("✅ Marked {$count} appointments as completed.");
                Log::info("Auto-completed {$count} appointments.");
            } else {
                $this->info("ℹ️ No appointments to complete.");
            }

            return 0;
        } catch (\Exception $e) {
            $this->error("❌ Error: " . $e->getMessage());
            Log::error('Error auto-completing appointments: ' . $e->getMessage());
            return 1;
        }
    }
}