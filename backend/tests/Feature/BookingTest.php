<?php

use App\Models\User;
use App\Models\Business;
use App\Models\Employees;
use App\Models\Services;
use App\Models\Schedules;
use App\Models\Appointments;
use Carbon\Carbon;

test('client can get available slots', function () {
    $owner    = User::factory()->create(['role' => 'business_owner', 'status' => 'active']);
    $business = Business::factory()->create(['user_id' => $owner->id]);
    $empUser  = User::factory()->create(['role' => 'employee', 'status' => 'active']);
    $employee = Employees::factory()->create(['business_id' => $business->id, 'user_id' => $empUser->id]);
    $service  = Services::factory()->create(['business_id' => $business->id, 'service_duration' => '30']);

    $date      = Carbon::now()->addDays(1);
    $dayOfWeek = $date->dayOfWeek;

    Schedules::factory()->create([
        'business_id' => $business->id,
        'employee_id' => $employee->id,
        'day_of_week' => $dayOfWeek,
        'open_at'     => '09:00',
        'close_at'    => '18:00',
        'is_off'      => false,
    ]);

    $response = $this->postJson('/api/public/available-slots', [
        'employee_id' => $employee->id,
        'service_ids' => [$service->id],
        'date'        => $date->toDateString(),
    ]);

    $response->assertStatus(200)
             ->assertJsonIsArray();

    expect(count($response->json()))->toBeGreaterThan(0);
});

test('no slots returned for day off', function () {
    $owner    = User::factory()->create(['role' => 'business_owner', 'status' => 'active']);
    $business = Business::factory()->create(['user_id' => $owner->id]);
    $empUser  = User::factory()->create(['role' => 'employee', 'status' => 'active']);
    $employee = Employees::factory()->create(['business_id' => $business->id, 'user_id' => $empUser->id]);
    $service  = Services::factory()->create(['business_id' => $business->id, 'service_duration' => '30']);

    $date      = Carbon::now()->addDays(1);
    $dayOfWeek = $date->dayOfWeek;

    Schedules::factory()->create([
        'business_id' => $business->id,
        'employee_id' => $employee->id,
        'day_of_week' => $dayOfWeek,
        'is_off'      => true,
    ]);

    $response = $this->postJson('/api/public/available-slots', [
        'employee_id' => $employee->id,
        'service_ids' => [$service->id],
        'date'        => $date->toDateString(),
    ]);

    $response->assertStatus(200)
             ->assertExactJson([]);
});

test('no slots returned for blocked date', function () {
    $owner    = User::factory()->create(['role' => 'business_owner', 'status' => 'active']);
    $business = Business::factory()->create(['user_id' => $owner->id]);
    $empUser  = User::factory()->create(['role' => 'employee', 'status' => 'active']);
    $employee = Employees::factory()->create(['business_id' => $business->id, 'user_id' => $empUser->id]);
    $service  = Services::factory()->create(['business_id' => $business->id, 'service_duration' => '30']);

    $date      = Carbon::now()->addDays(3);
    $dayOfWeek = $date->dayOfWeek;

    Schedules::factory()->create([
        'business_id' => $business->id,
        'employee_id' => $employee->id,
        'day_of_week' => $dayOfWeek,
        'open_at'     => '09:00',
        'close_at'    => '18:00',
        'is_off'      => false,
    ]);

    \App\Models\ScheduleException::create([
        'business_id' => $business->id,
        'employee_id' => $employee->id,
        'date'        => $date->toDateString(),
    ]);

    $response = $this->postJson('/api/public/available-slots', [
        'employee_id' => $employee->id,
        'service_ids' => [$service->id],
        'date'        => $date->toDateString(),
    ]);

    $response->assertStatus(200)
             ->assertExactJson([]);
});

test('client can create an appointment', function () {
    $owner    = User::factory()->create(['role' => 'business_owner', 'status' => 'active']);
    $business = Business::factory()->create(['user_id' => $owner->id]);
    $empUser  = User::factory()->create(['role' => 'employee', 'status' => 'active']);
    $employee = Employees::factory()->create(['business_id' => $business->id, 'user_id' => $empUser->id]);
    $service  = Services::factory()->create(['business_id' => $business->id, 'service_duration' => '30']);

    $startTime = Carbon::now()->addDays(1)->setTime(10, 0);
    $dayOfWeek = $startTime->dayOfWeek;

    Schedules::factory()->create([
        'business_id' => $business->id,
        'employee_id' => $employee->id,
        'day_of_week' => $dayOfWeek,
        'open_at'     => '09:00',
        'close_at'    => '18:00',
        'is_off'      => false,
    ]);

    $response = $this->postJson('/api/public/appointments/create', [
        'business_id'  => $business->id,
        'employee_id'  => $employee->id,
        'service_ids'  => [$service->id],
        'start_time'   => $startTime->toDateTimeString(),
        'client_name'  => 'Bledion',
        'client_phone' => '+38344000001',
        'client_email' => 'client@test.com',
    ]);

    $response->assertStatus(201)
             ->assertJsonPath('status', 'success');

    $this->assertDatabaseHas('appointments', [
        'client_email' => 'client@test.com',
        'status'       => 'confirmed',
    ]);
});

test('cannot double book same slot', function () {
    $owner    = User::factory()->create(['role' => 'business_owner', 'status' => 'active']);
    $business = Business::factory()->create(['user_id' => $owner->id]);
    $empUser  = User::factory()->create(['role' => 'employee', 'status' => 'active']);
    $employee = Employees::factory()->create(['business_id' => $business->id, 'user_id' => $empUser->id]);
    $service  = Services::factory()->create(['business_id' => $business->id, 'service_duration' => '30']);

    $startTime = Carbon::now()->addDays(1)->setTime(10, 0);
    $dayOfWeek = $startTime->dayOfWeek;

    Schedules::factory()->create([
        'business_id' => $business->id,
        'employee_id' => $employee->id,
        'day_of_week' => $dayOfWeek,
        'open_at'     => '09:00',
        'close_at'    => '18:00',
        'is_off'      => false,
    ]);

    $payload = [
        'business_id'  => $business->id,
        'employee_id'  => $employee->id,
        'service_ids'  => [$service->id],
        'start_time'   => $startTime->toDateTimeString(),
        'client_name'  => 'Client One',
        'client_phone' => '+38344000001',
        'client_email' => 'client1@test.com',
    ];

    $this->postJson('/api/public/appointments/create', $payload);

    $response = $this->postJson('/api/public/appointments/create', array_merge($payload, [
        'client_name'  => 'Client Two',
        'client_phone' => '+38344000002',
        'client_email' => 'client2@test.com',
    ]));

    $response->assertStatus(409);
});

test('cannot book on blocked date', function () {
    $owner    = User::factory()->create(['role' => 'business_owner', 'status' => 'active']);
    $business = Business::factory()->create(['user_id' => $owner->id]);
    $empUser  = User::factory()->create(['role' => 'employee', 'status' => 'active']);
    $employee = Employees::factory()->create(['business_id' => $business->id, 'user_id' => $empUser->id]);
    $service  = Services::factory()->create(['business_id' => $business->id, 'service_duration' => '30']);

    $startTime = Carbon::now()->addDays(3)->setTime(10, 0);
    $dayOfWeek = $startTime->dayOfWeek;

    Schedules::factory()->create([
        'business_id' => $business->id,
        'employee_id' => $employee->id,
        'day_of_week' => $dayOfWeek,
        'open_at'     => '09:00',
        'close_at'    => '18:00',
        'is_off'      => false,
    ]);

    \App\Models\ScheduleException::create([
        'business_id' => $business->id,
        'employee_id' => $employee->id,
        'date'        => $startTime->toDateString(),
    ]);

    $response = $this->postJson('/api/public/appointments/create', [
        'business_id'  => $business->id,
        'employee_id'  => $employee->id,
        'service_ids'  => [$service->id],
        'start_time'   => $startTime->toDateTimeString(),
        'client_name'  => 'Bledion',
        'client_phone' => '+38344000001',
        'client_email' => 'client@test.com',
    ]);

    $response->assertStatus(422);
});