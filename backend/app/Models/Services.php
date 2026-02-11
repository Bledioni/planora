<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Services extends Model
{
    use HasFactory;

    protected $fillable = [
    'business_id', 
    'service_name', 
    'service_description', // Duhet të jetë fiks si në Database
    'service_price', 
    'service_duration'
];
}
