<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_id',
        'start_date',
        'end_date',
        'months',
        'status',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
    ];

    // Subscription belongs to a Business
    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    // Auto-check if subscription is expired
    public function isExpired(): bool
    {
        return $this->end_date->isPast();
    }
}