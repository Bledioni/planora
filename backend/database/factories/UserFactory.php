<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            'name'              => $this->faker->firstName(),
            'surname'           => $this->faker->lastName(), // ✅ add this
            'email'             => $this->faker->unique()->safeEmail(),
            'phone_number'      => '+3834400' . $this->faker->unique()->numerify('####'), // ✅ add this
            'email_verified_at' => now(),
            'password'          => static::$password ??= Hash::make('password'),
            'remember_token'    => Str::random(10),
            'role'              => 'business_owner',
            'status'            => 'active',
            'business_id'       => null,
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}