<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DailyLogController;
use App\Http\Controllers\Api\VerificationController;
use App\Http\Controllers\Api\EmployeeController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Daily Logs CRUD
    Route::get('/daily-logs/statistics', [DailyLogController::class, 'statistics']);
    Route::apiResource('/daily-logs', DailyLogController::class);
    
    // Verification (for supervisors)
    Route::prefix('verification')->group(function () {
        Route::get('/subordinates', [VerificationController::class, 'subordinates']);
        Route::get('/pending-logs', [VerificationController::class, 'pendingLogs']);
        Route::get('/statistics', [VerificationController::class, 'statistics']);
        Route::post('/approve/{dailyLog}', [VerificationController::class, 'approve']);
        Route::post('/reject/{dailyLog}', [VerificationController::class, 'reject']);
        Route::post('/bulk-approve', [VerificationController::class, 'bulkApprove']);
    });
    
    // Employees & Organization
    Route::get('/employees', [EmployeeController::class, 'index']);
    Route::get('/employees/organization', [EmployeeController::class, 'organizationStructure']);
    Route::get('/employees/{user}', [EmployeeController::class, 'show']);
});
