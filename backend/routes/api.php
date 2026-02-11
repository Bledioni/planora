<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthenticationController;
use App\Http\Controllers\BusinessesController;
use App\Http\Controllers\EmployeesController;
use App\Http\Controllers\Admin\InsertController;
use App\Http\Controllers\Admin\StoreBusinessController;
use App\Http\Controllers\AppointmentsController;
use App\Http\Controllers\Admin\AdminBusinessController;
use App\Http\Controllers\ScheduleController;

/*
|--------------------------------------------------------------------------
| Public Routes (Aksesueshme nga kushdo)
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthenticationController::class, 'Register']);
Route::post('/login', [AuthenticationController::class, 'login']);

// Rrugët për klientët (User Side)
Route::get('/businesses', [BusinessesController::class, 'index']); // Kjo tani është publike
Route::get('/businesses/slug/{slug}', [BusinessesController::class, 'getDetailsBySlug']);
Route::get('/categories', [BusinessesController::class, 'getCategories']);
Route::get('/available-slots', [AppointmentsController::class, 'getAvailableSlots']);
Route::post('/makeAppointment', [AppointmentsController::class, 'MakeAppointment']);

/*
|--------------------------------------------------------------------------
| Protected Routes (Kërkojnë Bearer Token)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    
    Route::post('/logout', [AuthenticationController::class, 'logout']);

    /* --- RRUGËT PËR ADMININ --- */
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::post('/StoreBusiness', [BusinessesController::class, 'StoreBusiness']);
        Route::post('/insertCategories', [InsertController::class, 'InsertCategory']);
        Route::get('/users-no-business', [InsertController::class, 'getUsersWithoutBusiness']);
        Route::post('/register-owner-as-employee', [BusinessesController::class, 'adminRegisterOwnerAsEmployee']);
        Route::post('/insertEmployee', [EmployeesController::class, 'InsertEmployee']);
        Route::get('/businesses', [AdminBusinessController::class, 'GetBusinesses']);
        Route::post('/deactivate-business/{id}', [BusinessesController::class, 'deactivateBusiness']);
        Route::post('/activate-business/{id}', [BusinessesController::class, 'activateBusiness']); // E REJA
        Route::get('/business-owners', [AdminBusinessController::class, 'GetBusinessOwners']);
        Route::middleware('role:admin')->post('/admin/create-user', [AuthenticationController::class, 'adminRegisterUser']);
    });

    /* --- RRUGËT PËR PRONARIN (Owner) --- */
    Route::middleware('role:business_owner')->prefix('owner')->group(function () {
        Route::get('/my-business', [BusinessesController::class, 'getMyBusiness']);
        Route::get('/dashboard', [BusinessesController::class, 'getOwnerDashboard']);
        Route::get('/my-staff', [BusinessesController::class, 'getBusinessStaff']);
        
        Route::post('/insertServices', [BusinessesController::class, 'InsertServices']);
        Route::post('/register-owner-employee', [BusinessesController::class, 'registerOwnerAsEmployee']);
        
        // Schedule System
        Route::post('/set-schedule', [ScheduleController::class, 'setSchedule']);       
        Route::get('/business-schedule/{businessId}', [ScheduleController::class, 'getBusinessSchedule']);
        Route::get('/employee-schedule/{businessId}/{employeeId}', [ScheduleController::class, 'getEmployeeSchedule']);
    });
});




Route::middleware('auth:sanctum')->get('/user-profile', function (Request $request) {
    return response()->json([
        'status' => 'success',
        'role'   => $request->user()->role, // Ky rol vjen nga DB, nuk mund të manipulohet
        'name'   => $request->user()->name,
        'email'  => $request->user()->email,
    ]);
});