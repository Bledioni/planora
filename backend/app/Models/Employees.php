<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Employees extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'business_id',
        // Note: name, email, phone usually live in the 'users' table. 
        // Only keep them here if you want them to be different from the login info.
    ];

    /**
     * This is the "Bridge" to the Users table you showed me.
     * It allows us to get the phone number of 'lindi' or 'rrem'.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Link to the Business
     */
    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }
}