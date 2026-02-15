<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Schedules;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class OwnerScheduleController extends Controller
{
    public function setSchedule(Request $request): JsonResponse
    {
        // 1. Validimi i rreptë
        $validated = $request->validate([
    'business_id' => 'required|exists:businesses,id',
    // KUJDES: A është tabela 'users' apo 'employees'? 
    // Nëse po dërgon ID e punonjësit, duhet:
    'employee_id' => 'required|exists:employees,id', 
    'day_of_week' => 'required|integer|between:0,6', 
    
    // Përdorim 'regex' ose thjesht heqim formatin strikt nëse React dërgon sekonda
    'open_at'     => 'required_if:is_off,0,false|nullable',
    'close_at'    => 'required_if:is_off,0,false|nullable',
    
    'break_start' => 'nullable',
    'break_end'   => 'nullable',
    'is_off'      => 'required', 
]);

        // 2. UpdateOrCreate logjika
        $schedule = Schedules::updateOrCreate(
            [
                'business_id' => $validated['business_id'],
                'employee_id' => $validated['employee_id'], 
                'day_of_week' => $validated['day_of_week'],
            ],
            [
                'open_at'     => $validated['is_off'] ? null : $validated['open_at'],
                'close_at'    => $validated['is_off'] ? null : $validated['close_at'],
                'break_start' => $validated['is_off'] ? null : ($validated['break_start'] ?? null),
                'break_end'   => $validated['is_off'] ? null : ($validated['break_end'] ?? null),
                'is_off'      => $validated['is_off'],
            ]
        );

        return response()->json([
            'message' => "Orari u ruajt me sukses!",
            'data' => $schedule
        ], 200);
    }

    public function getBusinessSchedule($businessId): JsonResponse
    {
        $schedule = Schedules::where('business_id', $businessId)
            ->whereNull('employee_id')
            ->orderBy('day_of_week', 'asc')
            ->get();

        return response()->json($schedule);
    }

    public function getEmployeeSchedule($businessId, $employeeId): JsonResponse
    {
        $schedules = Schedules::where('business_id', $businessId)
                         ->where('employee_id', $employeeId)
                         ->orderBy('day_of_week', 'asc')
                         ->get();
                         
        return response()->json($schedules);
    }
}
