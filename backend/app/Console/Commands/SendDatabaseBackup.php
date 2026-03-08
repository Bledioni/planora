<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendDatabaseBackup extends Command
{
    protected $signature = 'backup:send-email';
    protected $description = 'Krijon një backup të databazës dhe e dërgon në email.';

    public function handle()
{
    $filename = "planora-backup-" . now()->format('Y-m-d') . ".sql";
    
    // Tentojmë ta ruajmë direkt në storage, që është më e sigurt për leje
    $path = storage_path($filename); 

    $mysqldumpPath = '/opt/homebrew/opt/mysql-client/bin/mysqldump';
    if (!file_exists($mysqldumpPath)) {
        $mysqldumpPath = 'mysqldump';
    }

    // DEBUG: Shiko nëse variablat e databazës po vijnë saktë
    if (!config('database.connections.mysql.database')) {
        $this->error("Gabim: Nuk u gjetën konfigurimet e DB në .env");
        return;
    }

    // Komanda
    $command = sprintf(
    '%s --user=%s --password=%s --host=%s --port=%s %s > %s 2>&1',
    $mysqldumpPath,
    escapeshellarg(config('database.connections.mysql.username')),
    escapeshellarg(config('database.connections.mysql.password')),
    escapeshellarg(config('database.connections.mysql.host')),
    escapeshellarg(config('database.connections.mysql.port')),
    escapeshellarg(config('database.connections.mysql.database')),
    escapeshellarg($path)
);

    // ... pjesa tjetër e kodit (exec, etj)

        $output = [];
        $resultCode = null;
        exec($command, $output, $resultCode);

        // 3. Kontrollo nëse file-i u krijua dhe nuk është bosh
        if ($resultCode !== 0 || !file_exists($path) || filesize($path) == 0) {
            $this->error("Gabim: mysqldump dështoi. Mesazhi: " . implode("\n", $output));
            return;
        }

        // 4. Dërgimi me Resend/Laravel Mail
        try {
            Mail::raw("Backup i PlanoraBook për datën " . now()->toDateTimeString(), function ($message) use ($path, $filename) {
                $message->to('bledionmehmeti4@gmail.com')
                        ->subject('PlanoraBook Backup Success ✅')
                        ->attach($path, ['as' => $filename]);
            });
            
            $this->info('Backup u dërgua me sukses!');
            
            // Fshijmë file-in lokal pas dërgimit që të mos zërë vend në server
            unlink($path); 
        } catch (\Exception $e) {
            $this->error("Resend dështoi: " . $e->getMessage());
        }
    }
}