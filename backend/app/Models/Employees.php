<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class Employees extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'business_id',
    ];

    /**
     * Scope to get only active employees
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->whereHas('user', function($q) {
            $q->where('status', 'active');
        });
    }

    /**
     * Link to User table
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Link to Business
     */
    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }
}