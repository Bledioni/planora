<?php

use App\Models\User;
use App\Models\Business;
use App\Models\Categories;
use Laravel\Sanctum\Sanctum;

test('admin can list all businesses', function () {
    $admin = User::factory()->create(['role' => 'admin', 'status' => 'active']);
    Business::factory()->count(3)->create();
    Sanctum::actingAs($admin, ['*']);

    $response = $this->getJson('/api/admin/businesses/list');

    $response->assertStatus(200)
             ->assertJsonPath('status', 'success');
});

test('non-admin cannot access admin routes', function () {
    $owner = User::factory()->create(['role' => 'business_owner', 'status' => 'active']);
    Sanctum::actingAs($owner, ['*']);

    $response = $this->getJson('/api/admin/businesses/list');

    $response->assertStatus(403);
});

test('admin can create a business', function () {
    $admin    = User::factory()->create(['role' => 'admin', 'status' => 'active']);
    $owner    = User::factory()->create(['role' => 'business_owner', 'status' => 'pending']);
    $category = Categories::factory()->create();
    Sanctum::actingAs($admin, ['*']);

    $response = $this->postJson('/api/admin/businesses/create', [
        'user_id'     => $owner->id,
        'category_id' => $category->id,
        'shop_name'   => 'Test Barber',
        'address'     => 'Rr. Test 1',
        'description' => 'Test description',
    ]);

    $response->assertStatus(201)
             ->assertJsonPath('status', 'success');

    $this->assertDatabaseHas('businesses', ['shop_name' => 'Test Barber']);
});

test('admin can deactivate a business', function () {
    $admin    = User::factory()->create(['role' => 'admin', 'status' => 'active']);
    $owner    = User::factory()->create(['role' => 'business_owner', 'status' => 'active']);
    $business = Business::factory()->create(['user_id' => $owner->id]);
    Sanctum::actingAs($admin, ['*']);

    $response = $this->postJson("/api/admin/businesses/deactivate/{$business->id}");

    $response->assertStatus(200)
             ->assertJsonPath('status', 'success');
});

test('admin can list users without business', function () {
    $admin = User::factory()->create(['role' => 'admin', 'status' => 'active']);
    User::factory()->count(3)->create(['role' => 'business_owner', 'status' => 'pending']);
    Sanctum::actingAs($admin, ['*']);

    $response = $this->getJson('/api/admin/users/without-business');

    $response->assertStatus(200)
             ->assertJsonPath('status', 'success');
});

test('admin can create a category', function () {
    $admin = User::factory()->create(['role' => 'admin', 'status' => 'active']);
    Sanctum::actingAs($admin, ['*']);

    $response = $this->postJson('/api/admin/categories/create', [
        'name' => 'Barber',
    ]);

    $response->assertStatus(201);
    $this->assertDatabaseHas('categories', ['name' => 'Barber']);
});

test('admin can delete a category', function () {
    $admin    = User::factory()->create(['role' => 'admin', 'status' => 'active']);
    $category = Categories::factory()->create();
    Sanctum::actingAs($admin, ['*']);

    $response = $this->deleteJson("/api/admin/categories/{$category->id}");

    $response->assertStatus(200);
    $this->assertDatabaseMissing('categories', ['id' => $category->id]);
});