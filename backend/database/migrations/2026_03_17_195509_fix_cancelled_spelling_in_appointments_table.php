<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Fix any existing data first
        DB::statement("UPDATE appointments SET status = 'cancelled' WHERE status = 'canceled'");
        
        // Update the ENUM
        DB::statement("ALTER TABLE appointments MODIFY COLUMN status ENUM('confirmed', 'completed', 'cancelled', 'no_show', 'pending') NOT NULL DEFAULT 'confirmed'");
    }

    public function down(): void
    {
        DB::statement("UPDATE appointments SET status = 'canceled' WHERE status = 'cancelled'");
        DB::statement("ALTER TABLE appointments MODIFY COLUMN status ENUM('confirmed', 'completed', 'canceled', 'pending') NOT NULL DEFAULT 'confirmed'");
    }
};