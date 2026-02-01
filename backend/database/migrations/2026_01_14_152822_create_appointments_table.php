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
            
            // Koha e takimit
            $table->timestamp('start_time');
            $table->timestamp('finish_time');
            
            // Fushat e klientit (Këto mungonin!)
            $table->string('client_name', 50);
            $table->string('client_phone');
            $table->string('client_email');
            
            // Statusi dhe Timestamps
            $table->enum('status', ['pending', 'confirmed', 'canceled'])->default('pending');
            $table->timestamps(); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};