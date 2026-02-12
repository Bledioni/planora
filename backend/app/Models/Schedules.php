<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Schedules extends Model
{
    use HasFactory;

    // Detyrojmë Laravelin të përdorë tabelën 'schedules' 
    // pasi emri i modelit është në shumës
    protected $table = 'schedules';

    protected $fillable = [
        'business_id', 
        'employee_id', 
        'day_of_week', 
        'open_at', 
        'close_at', 
        'break_start', 
        'break_end', 
        'is_off'
    ];

    /**
     * Lidhja me Biznesin
     */
    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    /**
     * Lidhja me Punonjësin (User)
     */
    public function employee()
    {
        return $this->belongsTo(User::class, 'employee_id');
    }
}