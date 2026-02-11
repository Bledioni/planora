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
    Schema::table('users', function (Blueprint $table) {
        // Statusi (E kive)
        $table->string('status')->default('pending'); // pending, active, suspended
        
        // KJO MUNGON DHE ËSHTË THELBËSORE
        $table->unsignedBigInteger('business_id')->nullable();
        
        // Opcionale: Shto një foreign key që të jetë database "fucking" solid
        $table->foreign('business_id')->references('id')->on('businesses')->onDelete('set null');
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            //
        });
    }
};
