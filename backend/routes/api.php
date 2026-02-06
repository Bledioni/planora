<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthenticationController;
use App\Http\Controllers\WishListController;
use App\Http\Controllers\BusinessesController;
use App\Http\Controllers\EmployeesController;
use App\Http\Controllers\Admin\InsertController;
use App\Http\Controllers\Admin\StoreBusinessController;
use App\Http\Controllers\AppointmentsController;
use App\Http\Controllers\ScheduleController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Authentication
Route::post('/register', [AuthenticationController::class, 'Register']);
Route::post('/login', [AuthenticationController::class, 'login']);

// Business Discovery & Browsing
Route::get('/businesses', [BusinessesController::class, 'index']);
Route::get('/businesses/slug/{slug}', [BusinessesController::class, 'getDetailsBySlug']);
Route::get('/businesses/{id}/details', [BusinessesController::class, 'getDetails']);

// Appointments & Schedules (Public View)
Route::get('/available-slots', [AppointmentsController::class, 'getAvailableSlots']);
Route::get('/schedule/business/{id}', [ScheduleController::class, 'getBusinessSchedule']);

// Wishlist
Route::post('/wishlistRegister' , [WishListController::class , 'WishListRegister']);

Route::post('/makeAppointment' , [AppointmentsController::class , 'MakeAppointment']);

/*
|--------------------------------------------------------------------------
| Protected Routes (Requires Auth)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    
    // User Profile
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Logout
    Route::post('/logout', [AuthenticationController::class, 'logout']);


    /*
    |-- Admin Only Routes
    */
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::post('/StoreBusiness', [StoreBusinessController::class, 'StoreBusiness']);
        Route::post('/insertCategories', [InsertController::class, 'InsertCategory']);
    });

    /*
    |-- Business Owner Routes
    */
    Route::middleware('role:business_owner')->group(function () {
        Route::post('/insertServices', [BusinessesController::class, 'InsertServices']);
        Route::post('/insertEmployee', [EmployeesController::class, 'InsertEmployee']);
        Route::post('/schedule/set', [ScheduleController::class, 'setSchedule']);
    });

});