<?php

use App\Models\User;
use App\Models\Business;
use App\Models\Employees;
use App\Models\Services;
use Laravel\Sanctum\Sanctum;

test('owner can get their business', function () {
    $owner    = User::factory()->create(['role' => 'business_owner', 'status' => 'active']);
    $business = Business::factory()->create(['user_id' => $owner->id]);
    $owner->update(['business_id' => $business->id]);
    Sanctum::actingAs($owner, ['*']);

    $response = $this->getJson('/api/owner/business/my-business');
    $response->assertStatus(200);
});

test('owner can create a service', function () {
    $owner    = User::factory()->create(['role' => 'business_owner', 'status' => 'active']);
    $business = Business::factory()->create(['user_id' => $owner->id]);
    $owner->update(['business_id' => $business->id]);
    Sanctum::actingAs($owner, ['*']);

    $response = $this->postJson('/api/owner/services/create', [
        'business_id'      => $business->id,
        'service_name'     => 'Haircut',
        'service_duration' => '30',
        'service_price'    => 10,
    ]);

    $response->assertStatus(201);
    $this->assertDatabaseHas('services', ['service_name' => 'Haircut']);
});

test('owner can delete a service', function () {
    $owner    = User::factory()->create(['role' => 'business_owner', 'status' => 'active']);
    $business = Business::factory()->create(['user_id' => $owner->id]);
    $owner->update(['business_id' => $business->id]);
    $service  = Services::factory()->create(['business_id' => $business->id]);
    Sanctum::actingAs($owner, ['*']);

    $response = $this->deleteJson("/api/owner/services/delete/{$service->id}");
    $response->assertStatus(200);
    $this->assertDatabaseMissing('services', ['id' => $service->id]);
});

test('owner can set a schedule', function () {
    $owner    = User::factory()->create(['role' => 'business_owner', 'status' => 'active']);
    $business = Business::factory()->create(['user_id' => $owner->id]);
    $empUser  = User::factory()->create(['role' => 'employee', 'status' => 'active']);
    $employee = Employees::factory()->create(['business_id' => $business->id, 'user_id' => $empUser->id]);
    $owner->update(['business_id' => $business->id]);
    Sanctum::actingAs($owner, ['*']);

    $response = $this->postJson('/api/owner/schedules/set', [
        'business_id' => $business->id,
        'employee_id' => $employee->id,
        'day_of_week' => 1,
        'open_at'     => '09:00',
        'close_at'    => '18:00',
        'break_start' => null,
        'break_end'   => null,
        'is_off'      => false,
    ]);

    $response->assertStatus(200)->assertJsonPath('status', 'success');
});

test('owner can block a date', function () {
    $owner    = User::factory()->create(['role' => 'business_owner', 'status' => 'active']);
    $business = Business::factory()->create(['user_id' => $owner->id]);
    $empUser  = User::factory()->create(['role' => 'employee', 'status' => 'active']);
    $employee = Employees::factory()->create(['business_id' => $business->id, 'user_id' => $empUser->id]);
    $owner->update(['business_id' => $business->id]);
    Sanctum::actingAs($owner, ['*']);

    $response = $this->postJson('/api/owner/schedule-exceptions/block', [
        'business_id' => $business->id,
        'employee_id' => $employee->id,
        'date'        => now()->addDays(5)->toDateString(),
        'reason'      => 'Pushim personal',
    ]);

    $response->assertStatus(200)->assertJsonPath('status', 'success');
    $this->assertDatabaseHas('schedule_exceptions', [
        'employee_id' => $employee->id,
        'date'        => now()->addDays(5)->toDateString(),
    ]);
});

test('owner cannot block same date twice', function () {
    $owner    = User::factory()->create(['role' => 'business_owner', 'status' => 'active']);
    $business = Business::factory()->create(['user_id' => $owner->id]);
    $empUser  = User::factory()->create(['role' => 'employee', 'status' => 'active']);
    $employee = Employees::factory()->create(['business_id' => $business->id, 'user_id' => $empUser->id]);
    $owner->update(['business_id' => $business->id]);
    Sanctum::actingAs($owner, ['*']);

    $date = now()->addDays(5)->toDateString();

    $this->postJson('/api/owner/schedule-exceptions/block', [
        'business_id' => $business->id,
        'employee_id' => $employee->id,
        'date'        => $date,
    ]);

    $response = $this->postJson('/api/owner/schedule-exceptions/block', [
        'business_id' => $business->id,
        'employee_id' => $employee->id,
        'date'        => $date,
    ]);

    $response->assertStatus(422);
});

test('employee role cannot access owner routes', function () {
    $empUser = User::factory()->create(['role' => 'employee', 'status' => 'active']);
    Sanctum::actingAs($empUser, ['*']);

    $response = $this->getJson('/api/owner/business/my-business');
    $response->assertStatus(403);
});