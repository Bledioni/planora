<?php

namespace Database\Factories;

use App\Models\Employees;
use App\Models\Business;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class EmployeesFactory extends Factory
{
    protected $model = Employees::class;

    public function definition(): array
    {
        return [
            'business_id' => Business::factory(),
            'user_id'     => User::factory(),
        ];
    }
}