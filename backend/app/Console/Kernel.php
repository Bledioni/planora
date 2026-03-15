    <?php

    namespace App\Console;

    use Illuminate\Console\Scheduling\Schedule;
    use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

    class Kernel extends ConsoleKernel
    {
        /**
         * Define the application's command schedule.
         */
        protected function schedule(Schedule $schedule): void
        {
            $schedule->command('appointments:cleanup')->everyMinute();
            $schedule->command('backup:send-email')->dailyAt('3:00');
            $schedule->command('app:send-reminders')->everyMinute()->sendOutputTo(storage_path('logs/laravel.log'));


            // Add this line - runs every hour to auto-complete finished appointments
            $schedule->command('appointments:complete-finished')
                    ->hourly()
                    ->withoutOverlapping();
        }

        /**
         * Register the commands for the application.
         */
        protected function commands(): void
        {
            $this->load(__DIR__.'/Commands');

            require base_path('routes/console.php');
        }
    }