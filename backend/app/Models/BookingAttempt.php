<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookingAttempt extends Model
{
    use HasFactory;

    protected $fillable = ['client_ip', 'client_phone', 'fingerprint'];
}
