<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Description is optional in the create/update forms (validated as nullable),
     * but the column was created NOT NULL, causing a 500 when it is left empty.
     */
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE businesses MODIFY description VARCHAR(255) NULL');
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("UPDATE businesses SET description = '' WHERE description IS NULL");
            DB::statement('ALTER TABLE businesses MODIFY description VARCHAR(255) NOT NULL');
        }
    }
};
