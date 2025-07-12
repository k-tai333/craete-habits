<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Habit extends Model
{
  use SoftDeletes;

  protected $fillable = [
    'user_id',
    'title',
    'to_do',
  ];
}
