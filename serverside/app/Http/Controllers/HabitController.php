<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Habit;
use App\Models\HabitRecord;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

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

  /**
   * 新しい習慣を作成
   */
  public function store(Request $request)
  {
    $validatedData = $request->validate([
      'title' => 'required|string|max:255',
      'to_do' => 'required|string',
    ]);

    // 認証されたユーザーのIDを取得
    $userId = Auth::user()->id;

    $habit = Habit::create([
      'title' => $validatedData['title'],
      'to_do' => $validatedData['to_do'],
      'user_id' => $userId
    ]);

    return response()->json($habit, 201);
  }

  /**
   * 習慣の詳細情報を取得
   */
  public function show($id)
  {
    try {
      $habit = Habit::findOrFail($id);

      // 過去30日分の記録を取得
      $startDate = Carbon::now()->subDays(29)->startOfDay();

      $records = HabitRecord::where('habit_id', $id)
        ->where('date', '>=', $startDate)
        ->orderBy('date', 'asc')
        ->get();

      return response()->json([
        'habit' => $habit,
        'records' => $records
      ]);
    } catch (\Exception $e) {
      Log::error('Error in show method:', [
        'id' => $id,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);

      return response()->json([
        'message' => '習慣の取得に失敗しました',
        'error' => $e->getMessage()
      ], 500);
    }
  }

  /**
   * 習慣の記録を保存
   */
  public function storeRecord(Request $request, $habitId)
  {
    try {
      $validatedData = $request->validate([
        'date' => 'required|date',
        'achievement_level' => 'required|integer|between:1,3'
      ]);

      // 同じ日付の記録が既に存在するか確認
      $existingRecord = HabitRecord::where('habit_id', $habitId)
        ->where('date', $validatedData['date'])
        ->first();

      if ($existingRecord) {
        return response()->json([
          'message' => 'この日付の記録は既に存在します'
        ], 400);
      }

      $record = HabitRecord::create([
        'habit_id' => $habitId,
        'date' => $validatedData['date'],
        'achievement_level' => $validatedData['achievement_level']
      ]);

      return response()->json($record, 201);
    } catch (\Exception $e) {
      Log::error('Error in storeRecord method:', [
        'habitId' => $habitId,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);

      return response()->json([
        'message' => '記録の保存に失敗しました',
        'error' => $e->getMessage()
      ], 500);
    }
  }

  /**
   * 指定日の記録を取得
   */
  public function getRecordByDate(Request $request, $habitId)
  {
    try {
      $date = $request->query('date');
      if (!$date) {
        return response()->json([
          'message' => '日付が指定されていません'
        ], 400);
      }

      $record = HabitRecord::where('habit_id', $habitId)
        ->where('date', $date)
        ->first();

      return response()->json($record);
    } catch (\Exception $e) {
      Log::error('Error in getRecordByDate method:', [
        'habitId' => $habitId,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);

      return response()->json([
        'message' => '記録の取得に失敗しました',
        'error' => $e->getMessage()
      ], 500);
    }
  }

  /**
   * 習慣を更新
   */
  public function update(Request $request, $id)
  {
    try {
      $validatedData = $request->validate([
        'title' => 'required|string|max:255',
        'to_do' => 'required|string'
      ]);

      $habit = Habit::findOrFail($id);
      $habit->update($validatedData);

      return response()->json($habit);
    } catch (\Exception $e) {
      Log::error('Error in update method:', [
        'id' => $id,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);

      return response()->json([
        'message' => '習慣の更新に失敗しました',
        'error' => $e->getMessage()
      ], 500);
    }
  }

  /**
   * 習慣を削除（論理削除）
   */
  public function destroy($id)
  {
    try {
      $habit = Habit::findOrFail($id);

      // 習慣に関連する記録も論理削除
      HabitRecord::where('habit_id', $id)->delete();

      // 習慣を論理削除
      $habit->delete();

      return response()->json([
        'message' => '習慣を削除しました'
      ]);
    } catch (\Exception $e) {
      Log::error('Error in destroy method:', [
        'id' => $id,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);

      return response()->json([
        'message' => '習慣の削除に失敗しました',
        'error' => $e->getMessage()
      ], 500);
    }
  }

  /**
   * 習慣記録を削除（論理削除）
   */
  public function destroyRecord($habitId, $recordId)
  {
    try {
      $record = HabitRecord::where('habit_id', $habitId)
        ->where('id', $recordId)
        ->firstOrFail();

      $record->delete();

      return response()->json([
        'message' => '記録を削除しました'
      ]);
    } catch (\Exception $e) {
      Log::error('Error in destroyRecord method:', [
        'habitId' => $habitId,
        'recordId' => $recordId,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);

      return response()->json([
        'message' => '記録の削除に失敗しました',
        'error' => $e->getMessage()
      ], 500);
    }
  }
}
