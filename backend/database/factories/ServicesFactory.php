<?php

namespace Database\Factories;

use App\Models\Services;
use App\Models\Business;
use Illuminate\Database\Eloquent\Factories\Factory;

class ServicesFactory extends Factory
{
    protected $model = Services::class;

    public function definition(): array
    {
        return [
            'business_id'      => Business::factory(),
            'service_name'     => $this->faker->word(),
            'service_duration' => '30',
            'service_price'    => $this->faker->numberBetween(5, 100),
        ];
    }
}