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
        // Adding it back fresh as an ENUM
        $table->enum('status', ['pending', 'confirmed', 'canceled'])
              ->default('pending')
              ->after('client_email'); 
    });
}

public function down(): void
{
    Schema::table('appointments', function (Blueprint $table) {
        $table->dropColumn('status');
    });
}
};
