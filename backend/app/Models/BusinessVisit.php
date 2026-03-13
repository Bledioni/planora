<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BusinessVisit extends Model
{
    protected $fillable = [
        'business_name',
        'address',
        'maps_url',
        'status',
        'notes',
    ];
}