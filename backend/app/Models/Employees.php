<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletes; // <-- 1. SHTO KËTË

class Employees extends Model
{
    use HasFactory, SoftDeletes; // <-- 2. SHTO KËTË

    protected $fillable = [
        'user_id',
        'business_id',
    ];

    public function scopeActive(Builder $query): Builder
    {
        return $query->whereHas('user', function($q) {
            $q->where('status', 'active');
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function schedules()
    {
        return $this->hasMany(\App\Models\Schedules::class, 'employee_id');
    }
}