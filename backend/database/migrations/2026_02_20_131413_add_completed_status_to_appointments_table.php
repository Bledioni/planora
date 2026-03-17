<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (config('database.default') !== 'sqlite') {
            DB::statement("ALTER TABLE `appointments` MODIFY COLUMN `status` ENUM('pending', 'confirmed', 'completed', 'canceled') NOT NULL DEFAULT 'pending'");
        }
    }

    public function down(): void
    {
        if (config('database.default') !== 'sqlite') {
            DB::statement("ALTER TABLE `appointments` MODIFY COLUMN `status` ENUM('pending', 'confirmed', 'canceled') NOT NULL DEFAULT 'pending'");
        }
    }
};