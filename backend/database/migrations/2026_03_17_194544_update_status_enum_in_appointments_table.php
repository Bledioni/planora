<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Clean up any invalid status values first
        DB::statement("UPDATE appointments SET status = 'confirmed' WHERE status NOT IN ('confirmed', 'completed', 'cancelled', 'no_show')");

        DB::statement("ALTER TABLE appointments MODIFY COLUMN status ENUM('confirmed', 'completed', 'cancelled', 'no_show') NOT NULL DEFAULT 'confirmed'");
    }

    public function down(): void
    {
        DB::statement("UPDATE appointments SET status = 'confirmed' WHERE status NOT IN ('confirmed', 'completed', 'cancelled')");

        DB::statement("ALTER TABLE appointments MODIFY COLUMN status ENUM('confirmed', 'completed', 'cancelled') NOT NULL DEFAULT 'confirmed'");
    }
};