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
    Schema::create('appointments', function (Blueprint $table) {
        $table->id();
        $table->foreignId('business_id')->constrained('businesses')->onDelete('cascade');
        $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
        $table->foreignId('service_id')->constrained('services')->onDelete('cascade');
        $table->timestamp('start_time');
        $table->timestamp('finish_time');
        
        // Add these here so the later "Add" migrations don't fail
        $table->enum('status', ['pending', 'confirmed', 'canceled'])->default('pending');
        $table->timestamps(); // This adds created_at and updated_at
    });
}
};
