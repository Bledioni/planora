<?php

namespace Database\Factories;

use App\Models\Schedules;
use App\Models\Business;
use App\Models\Employees;
use Illuminate\Database\Eloquent\Factories\Factory;

class SchedulesFactory extends Factory
{
    protected $model = Schedules::class;

    public function definition(): array
    {
        return [
            'business_id' => Business::factory(),
            'employee_id' => Employees::factory(),
            'day_of_week' => $this->faker->numberBetween(0, 6),
            'open_at'     => '09:00',
            'close_at'    => '18:00',
            'break_start' => null,
            'break_end'   => null,
            'is_off'      => false,
        ];
    }
}