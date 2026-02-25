<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
/*
|--------------------------------------------------------------------------
| PUBLIC AUTH ROUTES - No authentication required
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('/register', [App\Http\Controllers\Auth\AuthController::class, 'register']);
    Route::post('/login', [App\Http\Controllers\Auth\AuthController::class, 'login']);
});

/*
|--------------------------------------------------------------------------
| PUBLIC BUSINESS BROWSING ROUTES - No authentication required
|--------------------------------------------------------------------------
*/
Route::prefix('public')->group(function () {
        
    // Categories
    Route::get('/categories/all', [App\Http\Controllers\Public\PublicCategoryController::class, 'getAllCategories']);
    
    // Booking & Appointments
    // Public appointment routes - CHECK IF BUSINESS IS ACTIVE
Route::middleware(['business.active'])->group(function () {
    Route::post('/appointments/create', [App\Http\Controllers\Public\BookingController::class, 'createAppointment']);
    Route::post('/available-slots', [App\Http\Controllers\Public\BookingController::class, 'getAvailableSlots']);
    Route::get('/business/{businessId}/{employeeId}/available-slots', [App\Http\Controllers\Public\BookingController::class, 'getAvailableSlots']);
    Route::get('/business/{businessId}/services', [App\Http\Controllers\Public\ServiceController::class, 'getBusinessServices']);
    Route::get('/businesses/all', [App\Http\Controllers\Public\PublicBusinessController::class, 'getAllBusinesses']);
    Route::get('/businesses/details/{slug}', [App\Http\Controllers\Public\PublicBusinessController::class, 'getBusinessBySlug']);
});
    
    // Wishlist
    Route::post('/waitlist/add', [App\Http\Controllers\Public\WaitlistController::class, 'addToWaitlist']);
});



/*
|--------------------------------------------------------------------------
| AUTHENTICATED ROUTES - Require Bearer Token
|--------------------------------------------------------------------------
*/
Route::middleware(['cookie.auth', 'auth:sanctum'])->group(function () {
    
    // Logout & Profile (All authenticated users)
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [App\Http\Controllers\Auth\AuthController::class, 'logout']);
        Route::get('/profile', [App\Http\Controllers\Auth\AuthController::class, 'getUserProfile']);
        Route::post('/forgot-password', [App\Http\Controllers\Auth\AuthController::class, 'forgotPassword']);
        Route::post('/reset-password',  [App\Http\Controllers\Auth\AuthController::class, 'resetPassword']);
    });

    /*
    |--------------------------------------------------------------------------
    | ADMIN ROUTES - Only for admin role
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:admin')->prefix('admin')->group(function () {


        // Dashboard
        Route::get('/dashboard/stats', [App\Http\Controllers\Admin\AdminDashboardController::class, 'getDashboardStats']);
        
        // Business Management
        Route::prefix('businesses')->group(function () {
            Route::post('/create', [App\Http\Controllers\Admin\AdminBusinessController::class, 'createBusiness']);
            Route::get('/list', [App\Http\Controllers\Admin\AdminBusinessController::class, 'listAllBusinesses']);
            Route::post('/deactivate/{id}', [App\Http\Controllers\Admin\AdminBusinessController::class, 'deactivateBusiness']);
            Route::post('/activate/{id}', [App\Http\Controllers\Admin\AdminBusinessController::class, 'activateBusiness']);
            Route::post('/send-email', [App\Http\Controllers\Admin\AdminBusinessController::class, 'sendEmail']);

        });
        
        // Category Management
        Route::prefix('categories')->group(function () {
            Route::post('/create', [App\Http\Controllers\Admin\AdminCategoryController::class, 'createCategory']);
        });
        
        // User Management
        Route::prefix('users')->group(function () {
            Route::get('/without-business', [App\Http\Controllers\Admin\AdminUserController::class, 'getUsersWithoutBusiness']);
            Route::get('/business-owners', [App\Http\Controllers\Admin\AdminUserController::class, 'getBusinessOwners']);
            Route::post('/create', [App\Http\Controllers\Admin\AdminUserController::class, 'createUser']);
        });
        
        // Employee Management
        Route::prefix('employees')->group(function () {
            Route::post('/create', [App\Http\Controllers\Admin\AdminEmployeeController::class, 'createEmployee']);
            Route::post('/register-owner-as-employee', [App\Http\Controllers\Admin\AdminEmployeeController::class, 'registerOwnerAsEmployee']);
            Route::get('/{businessId}/employees', [App\Http\Controllers\Admin\AdminEmployeeController::class, 'getBusinessEmployees']);
            Route::delete('/delete/{employeeId}', [App\Http\Controllers\Admin\AdminEmployeeController::class, 'deleteEmployee']);

        });
    });

    /*
    |--------------------------------------------------------------------------
    | OWNER ROUTES - Only for business_owner role
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:business_owner')->prefix('owner')->group(function () {
        
        // Business Management
        Route::prefix('business')->group(function () {
            Route::get('/my-business', [App\Http\Controllers\Owner\OwnerBusinessController::class, 'getMyBusiness']);
            Route::get('/dashboard', [App\Http\Controllers\Owner\OwnerDashboardController::class, 'getDashboardStats']);

        });

        Route::prefix('services')->group(function () {
            Route::post('/create', [App\Http\Controllers\Owner\OwnerServiceController::class, 'createService']);
            Route::put('/update/{serviceId}', [App\Http\Controllers\Owner\OwnerServiceController::class, 'updateService']);
            Route::delete('/delete/{serviceId}', [App\Http\Controllers\Owner\OwnerServiceController::class, 'deleteService']);
        });
        
        // Staff Management
        Route::prefix('staff')->group(function () {
            Route::get('/list', [App\Http\Controllers\Owner\OwnerStaffController::class, 'getMyStaff']);
            // Route::post('/register-self-as-employee', [App\Http\Controllers\Owner\OwnerStaffController::class, 'registerOwnerAsEmployee']);
        });

        // Analytics & Stats
        Route::prefix('analytics')->group(function () {
            Route::get('/business-stats', [App\Http\Controllers\Owner\OwnerAnalyticsController::class, 'getBusinessStats']);
            Route::get('/employee-stats/{employeeId}', [App\Http\Controllers\Owner\OwnerAnalyticsController::class, 'getEmployeeStats']);
            Route::get('/owner-schedule', [App\Http\Controllers\Owner\OwnerAnalyticsController::class, 'getOwnerSchedule']);
            Route::get('/employees-schedules', [App\Http\Controllers\Owner\OwnerAnalyticsController::class, 'getAllEmployeesWithSchedules']);
        });
        
        // Service Management
        Route::prefix('services')->group(function () {
            Route::post('/create', [App\Http\Controllers\Owner\OwnerServiceController::class, 'createService']);
        });
        
        // Schedule Management
        Route::prefix('schedules')->group(function () {
            Route::post('/set', [App\Http\Controllers\Owner\OwnerScheduleController::class, 'setSchedule']);
            Route::get('/business/{businessId}', [App\Http\Controllers\Owner\OwnerScheduleController::class, 'getBusinessSchedule']);
            Route::get('/employee/{businessId}/{employeeId}', [App\Http\Controllers\Owner\OwnerScheduleController::class, 'getEmployeeSchedule']);
        });

        // Appointments Management
        Route::prefix('appointments')->group(function () {
            Route::get('/list', [App\Http\Controllers\Owner\OwnerAnalyticsController::class, 'getAppointments']);
            Route::put('/update-status/{appointmentId}', [App\Http\Controllers\Owner\OwnerAnalyticsController::class, 'updateAppointmentStatus']);
        });
    });

        /*
    |--------------------------------------------------------------------------
    | EMPLOYEE ROUTES - Only for employee role
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:employee')->prefix('employee')->group(function () {

        // Appointments
        Route::prefix('appointments')->group(function () {
            Route::get('/list', [App\Http\Controllers\Employee\EmployeeAppointmentController::class, 'getAppointments']);
            Route::put('/update-status/{appointmentId}', [App\Http\Controllers\Employee\EmployeeAppointmentController::class, 'updateStatus']);
        });

        // Stats
        Route::get('/stats', [App\Http\Controllers\Employee\EmployeeAppointmentController::class, 'getStats']);
    });
});