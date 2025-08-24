<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HabitController;
use App\Http\Controllers\UserController;

// 認証が必要なルート
Route::middleware('auth:web')->group(function () {
  // Habits routes
  Route::post('/habits', [HabitController::class, 'store']);
  Route::get('/habits/detail/{id}', [HabitController::class, 'show']);
  Route::get('/habits/{userId}', [HabitController::class, 'index']);
  Route::put('/habits/{id}', [HabitController::class, 'update']);
  Route::delete('/habits/{id}', [HabitController::class, 'destroy']);

  // Habit records routes
  Route::post('/habits/{habitId}/records', [HabitController::class, 'storeRecord']);
  Route::get('/habits/{habitId}/records', [HabitController::class, 'getRecordByDate']);
  Route::delete('/habits/{habitId}/records/{recordId}', [HabitController::class, 'destroyRecord']);

  // User routes
  Route::get('/auth/me', [UserController::class, 'me']);
  Route::post('/auth/logout', [UserController::class, 'logout']);
});

Route::post('/auth/login', [UserController::class, 'login']);
Route::post('/auth/register', [UserController::class, 'store']);
