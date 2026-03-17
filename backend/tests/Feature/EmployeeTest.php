<?php

use App\Models\User;
use App\Models\Business;
use App\Models\Employees;
use App\Models\Appointments;
use App\Models\Services;
use Carbon\Carbon;
use Laravel\Sanctum\Sanctum;

test('employee can list their appointments', function () {
    $owner    = User::factory()->create(['role' => 'business_owner', 'status' => 'active']);
    $business = Business::factory()->create(['user_id' => $owner->id]);
    $empUser  = User::factory()->create(['role' => 'employee', 'status' => 'active']);
    $employee = Employees::factory()->create(['business_id' => $business->id, 'user_id' => $empUser->id]);
    $service  = Services::factory()->create(['business_id' => $business->id]);

    Appointments::factory()->count(2)->create([
        'employee_id' => $employee->id,
        'business_id' => $business->id,
        'service_id'  => $service->id,
        'start_time'  => Carbon::now()->addHour(),
        'finish_time' => Carbon::now()->addHours(2),
        'status'      => 'confirmed',
    ]);

    Sanctum::actingAs($empUser, ['*']);

    $response = $this->getJson('/api/employee/appointments/list');

    $response->assertStatus(200)
             ->assertJsonStructure(['appointments']);
});

test('employee can mark appointment as completed', function () {
    $owner       = User::factory()->create(['role' => 'business_owner', 'status' => 'active']);
    $business    = Business::factory()->create(['user_id' => $owner->id]);
    $empUser     = User::factory()->create(['role' => 'employee', 'status' => 'active']);
    $employee    = Employees::factory()->create(['business_id' => $business->id, 'user_id' => $empUser->id]);
    $service     = Services::factory()->create(['business_id' => $business->id]);
    $appointment = Appointments::factory()->create([
        'employee_id' => $employee->id,
        'business_id' => $business->id,
        'service_id'  => $service->id,
        'start_time'  => Carbon::now()->addHour(),
        'finish_time' => Carbon::now()->addHours(2),
        'status'      => 'confirmed',
    ]);

    Sanctum::actingAs($empUser, ['*']);

    $response = $this->putJson("/api/employee/appointments/update-status/{$appointment->id}", [
        'status' => 'completed',
    ]);

    $response->assertStatus(200);
    $this->assertDatabaseHas('appointments', ['id' => $appointment->id, 'status' => 'completed']);
});

test('employee can get stats', function () {
    $empUser  = User::factory()->create(['role' => 'employee', 'status' => 'active']);
    $owner    = User::factory()->create(['role' => 'business_owner', 'status' => 'active']);
    $business = Business::factory()->create(['user_id' => $owner->id]);
    Employees::factory()->create(['business_id' => $business->id, 'user_id' => $empUser->id]);
    Sanctum::actingAs($empUser, ['*']);

    $response = $this->getJson('/api/employee/stats');

    $response->assertStatus(200)
             ->assertJsonStructure(['stats']);
});

test('owner cannot access employee routes', function () {
    $owner = User::factory()->create(['role' => 'business_owner', 'status' => 'active']);
    Sanctum::actingAs($owner, ['*']);

    $response = $this->getJson('/api/employee/appointments/list');

    $response->assertStatus(403);
});