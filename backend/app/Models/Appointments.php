<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; // 1. Shtohet kjo linjë

class Appointments extends Model
{
    use HasFactory, SoftDeletes; // 2. Shtohet SoftDeletes këtu

    protected $fillable = [
        'booking_id',
        'business_id',
        'employee_id',
        'service_id',
        'start_time',
        'finish_time',
        'client_name',
        'client_phone',
        'client_email',
        'status',  
        'is_notified',     
    ];
    
    protected $casts = [
        'start_time' => 'datetime',
        'finish_time' => 'datetime',
    ];

    // Lidhja me Punonjësin
    public function employee()
    {
        return $this->belongsTo(\App\Models\Employees::class, 'employee_id');
    }

    // Lidhja me Shërbimin
    public function service()
    {
        return $this->belongsTo(\App\Models\Services::class, 'service_id');
    }

    // Lidhja me Biznesin
    public function business()
    {
        return $this->belongsTo(\App\Models\Business::class, 'business_id');
    }
}