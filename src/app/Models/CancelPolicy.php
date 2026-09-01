<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CancelPolicy extends Model
{
    protected $fillable = ['days_before', 'label', 'charge_rate', 'description'];
}
