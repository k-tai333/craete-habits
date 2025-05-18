<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Habit;

class HabitController extends Controller
{
  /**
   * 指定ユーザーの習慣一覧を取得
   */
  public function index($userId)
  {
    $habits = Habit::where('user_id', $userId)->get();
    return response()->json($habits);
  }
}
