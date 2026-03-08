<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; // 1. Importo këtë

class Services extends Model
{
    use HasFactory, SoftDeletes; // 2. Përdor SoftDeletes këtu

    protected $fillable = [
        'business_id', 
        'service_name', 
        'service_description', // Sigurohu që emri përputhet me migration (service_description ose description)
        'service_price', 
        'service_duration'
    ];

    // 3. Kjo i tregon Laravelit që kjo kolonë duhet trajtuar si datë
    protected $dates = ['deleted_at'];
}