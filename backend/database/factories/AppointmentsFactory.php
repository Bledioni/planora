<?php

namespace Database\Factories;

use App\Models\Appointments;
use App\Models\Business;
use App\Models\Employees;
use App\Models\Services;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class AppointmentsFactory extends Factory
{
    protected $model = Appointments::class;

    public function definition(): array
    {
        return [
            'business_id'  => Business::factory(),
            'employee_id'  => Employees::factory(),
            'service_id'   => Services::factory(),
            'start_time'   => now()->addHour(),
            'finish_time'  => now()->addHours(2),
            'client_name'  => $this->faker->name(),
            'client_phone' => '+3834400' . $this->faker->numerify('####'),
            'client_email' => $this->faker->unique()->safeEmail(),
            'status'       => 'confirmed',
            'booking_id'   => (string) Str::uuid(),
            'is_notified'  => false,
        ];
    }
}