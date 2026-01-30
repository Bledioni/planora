<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Schedules extends Model
{
    use HasFactory;

   
protected $fillable = [
    'business_id', 'employee_id', 'day_of_week', 
    'open_at', 'close_at', 'break_start', 'break_end', 'is_off'
];
}
