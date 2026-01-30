<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointments extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_id',
        'employee_id',
        'service_id',
        'start_time',
        'finish_time',
        'client_name',
        'client_phone',
        'client_email',
        'status',       
    ];
    
    protected $casts = [
        'start_time' => 'datetime',
        'finish_time' => 'datetime',
    ];
}