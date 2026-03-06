<?php

use App\Models\Appointments;
use App\Models\Business;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('cannot double book same slot', function () {
    // 1. Create the dependencies first
    $business = Business::factory()->create();
    $employee = User::factory()->create();
    // Assuming you have a Service model for service_ids => [1]
    $service  = \App\Models\Service::factory()->create();

    $payload = [
        'business_id'  => $business->id,
        'employee_id'  => $employee->id,
        'service_ids'  => [$service->id],
        'start_time'   => '2026-12-01 10:00',
        'client_name'  => 'Test User',
        'client_phone' => '123456789',
        'client_email' => 'test@test.com',
    ];

    // First booking should succeed
    $this->postJson('/api/public/appointments/create', $payload)
         ->assertStatus(201);

    // Second booking with same payload should fail (409 Conflict)
    $this->postJson('/api/public/appointments/create', $payload)
         ->assertStatus(409);
});