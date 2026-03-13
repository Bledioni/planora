<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
{
    Schema::create('business_visits', function (Blueprint $table) {
        $table->id();
        $table->string('business_name');
        $table->string('address')->nullable();
        $table->string('maps_url')->nullable();
        $table->enum('status', ['visited', 'waiting'])->default('waiting');
        $table->text('notes')->nullable();
        $table->timestamps();
    });
}

    public function down(): void
    {
        Schema::dropIfExists('business_visits');
    }
};