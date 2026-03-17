<?php

namespace Database\Factories;

use App\Models\Business;
use App\Models\User;
use App\Models\Categories;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class BusinessFactory extends Factory
{
    protected $model = Business::class;

    public function definition(): array
    {
        $name = $this->faker->company();
        return [
            'user_id'      => User::factory(),
            'category_id'  => Categories::factory(),
            'shop_name'    => $name,
            'slug'         => Str::slug($name) . '-' . rand(100, 999),
            'address'      => $this->faker->address(),
            'location_link'=> null,
            'description'  => $this->faker->sentence(),
        ];
    }
}