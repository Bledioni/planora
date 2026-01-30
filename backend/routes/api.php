<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthenticationController;
use App\Http\Controllers\WishListController;
use App\Http\Controllers\BusinessesController;
use App\Http\Controllers\EmployeesController;
use App\Http\Controllers\Admin\InsertController;
use App\Http\Controllers\AppointmentsController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});


Route::post('/register', [AuthenticationController::class, 'Register']);
Route::post('/login', [AuthenticationController::class, 'login']);
Route::middleware('auth:sanctum')->post('/logout', [AuthenticationController::class, 'logout']);

//Apply for wishlist
Route::post('/wishlistRegister' , [WishListController::class , 'WishListRegister']);

//bussiness functions
Route::middleware(['auth:sanctum', 'role:business_owner'])->group(function () {
    Route::post('/storeBusiness', [BusinessesController::class, 'StoreBusiness']);
});

Route::middleware(['auth:sanctum', 'role:business_owner'])->group(function () {
    Route::post('/insertServices', [BusinessesController::class, 'InsertServices']);
});

Route::middleware(['auth:sanctum', 'role:business_owner'])->group(function () {
    Route::post('/insertEmployee', [EmployeesController::class, 'InsertEmployee']);
});


//admin page

Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::post('/admin/insertCategories', [InsertController::class, 'InsertCategory']);
});


//user page

Route::post('/makeAppointment' , [AppointmentsController::class , 'MakeAppointment']);

Route::get('/available-slots', [AppointmentsController::class, 'getAvailableSlots']);

use App\Http\Controllers\ScheduleController;

// This must match exactly what you type in Postman
Route::post('/schedule/set', [ScheduleController::class, 'setSchedule']);
Route::get('/schedule/business/{id}', [ScheduleController::class, 'getBusinessSchedule']);


// --- User Discovery & Booking Flow ---
// Step 1: Browse shops
Route::get('/businesses', [BusinessesController::class, 'index']);

Route::get('/businesses/slug/{slug}', [BusinessesController::class, 'getDetailsBySlug']);

// Step 2 & 3: See Barbers and Services for the chosen shop
Route::get('/businesses/{id}/details', [BusinessesController::class, 'getDetails']);

Route::post('/makeAppointment' , [AppointmentsController::class , 'MakeAppointment']);
Route::get('/available-slots', [AppointmentsController::class, 'getAvailableSlots']);