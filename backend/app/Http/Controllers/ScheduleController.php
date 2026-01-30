<?php

namespace App\Http\Controllers;

use App\Models\Schedules;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ScheduleController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'role:business_owner']);
    }

    public function setSchedule(Request $request): JsonResponse
    {
        $request->validate([
            'business_id'   => 'required|exists:businesses,id',
            'employee_id'   => 'nullable|exists:employees,id',
            'day_of_week'   => 'required|integer|between:0,6', 
            'open_at'       => 'required_unless:is_off,true|date_format:H:i',
            'close_at'      => 'required_unless:is_off,true|date_format:H:i|after:open_at',
            'break_start'   => 'nullable|date_format:H:i',
            'break_end'     => 'nullable|date_format:H:i|after:break_start',
            'is_off'        => 'required|boolean',
        ]);

        // Key Logic: We look for the unique combination of business, employee, and day.
        $schedule = Schedules::updateOrCreate(
            [
                'business_id' => $request->business_id,
                'employee_id' => $request->employee_id, // Can be NULL for business default
                'day_of_week' => $request->day_of_week,
            ],
            [
                'open_at'     => $request->open_at,
                'close_at'    => $request->close_at,
                'break_start' => $request->break_start,
                'break_end'   => $request->break_end,
                'is_off'      => $request->is_off,
            ]
        );

        $type = $request->employee_id ? 'për punonjësin' : 'për biznesin';

        return response()->json([
            'message' => "Orari $type u ruajt me sukses!",
            'data' => $schedule
        ]);
    }

    /**
     * Get the schedule for a business.
     * This shows the "Master Plan" (where employee_id is null).
     */
    public function getBusinessSchedule($businessId): JsonResponse
    {
        $schedule = Schedules::where('business_id', $businessId)
            ->whereNull('employee_id')
            ->orderBy('day_of_week', 'asc')
            ->get();

        return response()->json($schedule);
    }
}