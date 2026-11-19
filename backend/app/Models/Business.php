<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes; // <-- 1. SHTO KËTË

class Business extends Model
{
    use HasFactory, SoftDeletes; // <-- 2. SHTO KËTË

    protected $fillable = [
        'user_id',
        'slug',
        'category_id',
        'shop_name',
        'address',
        'location_link',
        'description',
    ];

    /**
     * Scope to get only active businesses (with active owners)
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->whereHas('user', function($q) {
            $q->where('status', 'active');
        });
    }

    public function subscription()
    {
        return $this->hasOne(\App\Models\Subscription::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Categories::class, 'category_id');
    }

    public function categories(): BelongsTo
    {
        return $this->belongsTo(Categories::class, 'category_id');
    }

    public function employees(): HasMany
    {
        return $this->hasMany(Employees::class, 'business_id');
    }

    public function activeEmployees(): HasMany
    {
        return $this->employees()->whereHas('user', function($query) {
            $query->where('status', 'active');
        });
    }

    public function services(): HasMany
    {
        return $this->hasMany(Services::class, 'business_id');
    }

    public function getRouteKeyName()
    {
        return 'slug';
    }
}