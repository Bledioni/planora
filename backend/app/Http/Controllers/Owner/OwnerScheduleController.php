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
    $validated = $request->validate([
        'business_id' => 'required|exists:businesses,id',
        'employee_id' => 'required|exists:employees,id', 
        'day_of_week' => 'required|integer|between:0,6', 
        'open_at'     => 'nullable|string',  // Changed
        'close_at'    => 'nullable|string',  // Changed
        'break_start' => 'nullable|string',  // Changed
        'break_end'   => 'nullable|string',  // Changed
        'is_off'      => 'required|boolean', // Changed
    ]);

    // Additional validation: if not off, require times
    if (!$validated['is_off'] && (empty($validated['open_at']) || empty($validated['close_at']))) {
        return response()->json([
            'message' => 'Duhet të vendosni orarin e hapjes dhe mbylljes.',
            'errors' => [
                'open_at' => ['Ora e hapjes është e detyrueshme'],
                'close_at' => ['Ora e mbylljes është e detyrueshme']
            ]
        ], 422);
    }

    $schedule = Schedules::updateOrCreate(
        [
            'business_id' => $validated['business_id'],
            'employee_id' => $validated['employee_id'], 
            'day_of_week' => $validated['day_of_week'],
        ],
        [
            'open_at'     => $validated['is_off'] ? null : $validated['open_at'],
            'close_at'    => $validated['is_off'] ? null : $validated['close_at'],
            'break_start' => $validated['is_off'] ? null : ($validated['break_start'] ?: null),
            'break_end'   => $validated['is_off'] ? null : ($validated['break_end'] ?: null),
            'is_off'      => $validated['is_off'],
        ]
    );

    return response()->json([
        'status' => 'success',
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
