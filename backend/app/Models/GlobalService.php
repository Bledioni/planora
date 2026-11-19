<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GlobalService extends Model
{
    protected $fillable = ['name', 'description', 'price', 'duration', 'category_id'];

    public function category()
    {
        return $this->belongsTo(\App\Models\Categories::class, 'category_id');
    }
}