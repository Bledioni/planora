<?php

use App\Models\User;
use Laravel\Sanctum\Sanctum;

test('user can register as business owner', function () {
    $response = $this->postJson('/api/auth/register', [
        'name'                  => 'Bledion',
        'surname'               => 'Mehmeti',
        'email'                 => 'bledion@test.com',
        'phone_number'          => '+38344000001',
        'password'              => 'password123',
        'password_confirmation' => 'password123',
        'role'                  => 'business_owner',
    ]);

    $response->assertStatus(201)
             ->assertJsonPath('status', 'success');

    $this->assertDatabaseHas('users', ['email' => 'bledion@test.com']);
});

test('register fails with duplicate email', function () {
    User::factory()->create(['email' => 'taken@test.com']);

    $response = $this->postJson('/api/auth/register', [
        'name'                  => 'Test',
        'surname'               => 'User',
        'email'                 => 'taken@test.com',
        'phone_number'          => '+38344000002',
        'password'              => 'password123',
        'password_confirmation' => 'password123',
        'role'                  => 'business_owner',
    ]);

    $response->assertStatus(422);
});

test('register fails with duplicate phone', function () {
    User::factory()->create(['phone_number' => '+38344000003']);

    $response = $this->postJson('/api/auth/register', [
        'name'                  => 'Test',
        'surname'               => 'User',
        'email'                 => 'unique@test.com',
        'phone_number'          => '+38344000003',
        'password'              => 'password123',
        'password_confirmation' => 'password123',
        'role'                  => 'business_owner',
    ]);

    $response->assertStatus(422);
});

test('user can login with correct credentials', function () {
    User::factory()->create([
        'email'    => 'login@test.com',
        'password' => 'password123',
        'status'   => 'active',
        'role'     => 'business_owner',
    ]);

    $response = $this->postJson('/api/auth/login', [
        'email'    => 'login@test.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(200)
             ->assertJsonPath('status', 'success');
});

test('login fails with wrong password', function () {
    User::factory()->create([
        'email'    => 'wrong@test.com',
        'password' => 'password123',
        'status'   => 'active',
    ]);

    $response = $this->postJson('/api/auth/login', [
        'email'    => 'wrong@test.com',
        'password' => 'wrongpassword',
    ]);

    $response->assertStatus(401);
});

test('pending user cannot login', function () {
    User::factory()->create([
        'email'    => 'pending@test.com',
        'password' => 'password123',
        'status'   => 'pending',
    ]);

    $response = $this->postJson('/api/auth/login', [
        'email'    => 'pending@test.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(403)
             ->assertJsonPath('status', 'awaiting_approval');
});

test('suspended user cannot login', function () {
    User::factory()->create([
        'email'    => 'suspended@test.com',
        'password' => 'password123',
        'status'   => 'suspended',
    ]);

    $response = $this->postJson('/api/auth/login', [
        'email'    => 'suspended@test.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(403);
});

test('authenticated user can get profile', function () {
    $user = User::factory()->create(['status' => 'active', 'role' => 'business_owner']);

    Sanctum::actingAs($user, ['*']);

    $response = $this->getJson('/api/auth/profile');

    $response->assertStatus(200)
             ->assertJsonPath('status', 'success')
             ->assertJsonPath('email', $user->email);
});

test('unauthenticated user cannot get profile', function () {
    $response = $this->getJson('/api/auth/profile');
    $response->assertStatus(401);
});

test('authenticated user can logout', function () {
    $user = User::factory()->create(['status' => 'active']);

    Sanctum::actingAs($user, ['*']);

    $response = $this->postJson('/api/auth/logout');

    $response->assertStatus(200)
             ->assertJsonPath('status', 'success');
});