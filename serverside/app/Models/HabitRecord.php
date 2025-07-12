<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HabitRecord extends Model
{
  use SoftDeletes;

  protected $fillable = [
    'habit_id',
    'date',
    'achievement_level'
  ];

  protected $casts = [
    'date' => 'date',
    'achievement_level' => 'integer'
  ];

  /**
   * この記録が属する習慣を取得
   */
  public function habit(): BelongsTo
  {
    return $this->belongsTo(Habit::class);
  }
}
