<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Business extends Model
{
    protected $fillable = [
        'user_id',
        'slug',
        'category_id',
        'shop_name',
        'address',
        'business_type',
        'description',
    ];

    /**
     * The Owner of the business
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relationship: Get all Barbers for this shop
     */
    public function employees(): HasMany
    {
        return $this->hasMany(Employees::class, 'business_id');
    }

    /**
     * Relationship: Get all Services (Haircut, Beard, etc.)
     */
    public function services(): HasMany
    {
        return $this->hasMany(Services::class, 'business_id');
    }

    public function getRouteKeyName()
        {
            return 'slug'; // Tells Laravel to look up by slug instead of ID
        }

        public function business()
{
    return $this->hasOne(Business::class, 'user_id');
}
}