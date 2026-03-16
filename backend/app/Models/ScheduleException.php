<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ScheduleException extends Model
{
    protected $fillable = ['business_id', 'employee_id', 'date', 'reason'];

    public function employee()
    {
        return $this->belongsTo(Employees::class, 'employee_id');
    }

    public function business()
    {
        return $this->belongsTo(Business::class, 'business_id');
    }
}