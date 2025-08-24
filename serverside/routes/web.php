<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\UserController;

Route::get('/', function () {
    return view('welcome');
});

// テスト用ルート
Route::post('/test', function (Request $request) {
    return response()->json(['ok' => true, 'session' => session()->all()]);
});

Route::middleware('web')->group(function () {
    Route::post('/auth/login', [UserController::class, 'login']);
    Route::post('/auth/register', [UserController::class, 'store']);
    Route::middleware('auth:web')->group(function () {
        Route::get('/auth/me', [UserController::class, 'me']);
        Route::post('/auth/logout', [UserController::class, 'logout']);
    });
});
