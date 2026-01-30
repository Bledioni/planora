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
    Schema::table('appointments', function (Blueprint $table) {
        $table->string('client_name')->after('service_id');
        $table->string('client_phone')->after('client_name');
        $table->enum('status', ['pending', 'confirmed', 'cancelled'])
              ->default('pending')
              ->after('client_phone');
    });
}

public function down(): void
{
    Schema::table('appointments', function (Blueprint $table) {
        $table->dropColumn(['client_name', 'client_phone', 'status', 'created_at', 'updated_at']);
    });
}
};
