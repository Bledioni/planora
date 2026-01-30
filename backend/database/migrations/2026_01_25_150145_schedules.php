<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('schedules', function (Blueprint $table) {
        $table->id();
        $table->foreignId('business_id')->constrained()->onDelete('cascade');
        
        // Nullable for Business Default, Value for Employee Override
        $table->foreignId('employee_id')->nullable()->constrained()->onDelete('cascade');
        
        $table->unsignedTinyInteger('day_of_week'); // 0-6
        $table->time('open_at')->nullable();
        $table->time('close_at')->nullable();
        
        // MISSING COLUMNS ADDED HERE:
        $table->time('break_start')->nullable();
        $table->time('break_end')->nullable();
        
        $table->boolean('is_off')->default(false);
        $table->timestamps();

        // Important: ensures one business default per day OR one employee override per day
        $table->unique(['business_id', 'employee_id', 'day_of_week']);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
