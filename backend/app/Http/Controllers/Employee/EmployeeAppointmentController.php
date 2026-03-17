<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Appointments;
use App\Models\Employees;
use Illuminate\Http\Request;
use Carbon\Carbon;

class EmployeeAppointmentController extends Controller
{
    private function getEmployee(Request $request)
    {
        return Employees::where('user_id', $request->user()->id)->first();
    }

    public function getAppointments(Request $request)
{
    $employee = $this->getEmployee($request);
    if (!$employee) {
        return response()->json(['message' => 'Employee profile not found.'], 404);
    }

    $filter = $request->query('filter', 'upcoming');
    $date   = $request->query('date');  // ✅ new param

    $query = Appointments::where('employee_id', $employee->id)->with(['service', 'business']);

    // ✅ If date is provided, filter by that specific date
    if ($date) {
        $query->whereDate('start_time', $date);
    } else {
        switch ($filter) {
            case 'today':
                $query->whereDate('start_time', Carbon::today());
                break;
            case 'past':
                $query->where('start_time', '<', Carbon::now());
                break;
            case 'all':
                break;
            case 'upcoming':
            default:
                $query->where('start_time', '>=', Carbon::now())
                      ->where('status', '!=', 'cancelled');
                break;
        }
    }

    $appointments = $query->orderBy('start_time', 'asc')->get();

    return response()->json([
        'employee_id'  => $employee->id,
        'filter'       => $filter,
        'total'        => $appointments->count(),
        'appointments' => $appointments,
    ]);
}
    
    public function updateStatus(Request $request, $appointmentId)
    {
        $employee = $this->getEmployee($request);
        if (!$employee) {
            return response()->json(['message' => 'Employee profile not found.'], 404);
        }

        $request->validate([
            'status' => 'required|in:completed,no_show,confirmed',
        ]);

        $appointment = Appointments::where('id', $appointmentId)
            ->where('employee_id', $employee->id)
            ->first();

        if (!$appointment) {
            return response()->json(['message' => 'Appointment not found.'], 404);
        }

        $appointment->status = $request->status;
        $appointment->save();

        return response()->json([
            'message'     => 'Status updated successfully.',
            'appointment' => $appointment->load(['service', 'business']),
        ]);
    }

    public function getStats(Request $request)
    {
        $employee = $this->getEmployee($request);
        if (!$employee) {
            return response()->json(['message' => 'Employee profile not found.'], 404);
        }

        $period = $request->query('period', 'week');

        switch ($period) {
            case 'month':
                $from = Carbon::now()->startOfMonth();
                $to   = Carbon::now()->endOfMonth();
                break;
            case 'year':
                $from = Carbon::now()->startOfYear();
                $to   = Carbon::now()->endOfYear();
                break;
            default:
                $from = Carbon::now()->startOfWeek();
                $to   = Carbon::now()->endOfWeek();
                break;
        }

        $appointments = Appointments::where('employee_id', $employee->id)
            ->whereBetween('start_time', [$from, $to])
            ->with('service')
            ->get();

        $byDay = $appointments->groupBy(function ($a) {
            return Carbon::parse($a->start_time)->format('Y-m-d');
        })->map->count();

        return response()->json([
            'employee_id' => $employee->id,
            'period'      => $period,
            'from'        => $from->toDateString(),
            'to'          => $to->toDateString(),
            'stats' => [
                'total'     => $appointments->count(),
                'completed' => $appointments->where('status', 'completed')->count(),
                'cancelled' => $appointments->where('status', 'cancelled')->count(),
                'no_show'   => $appointments->where('status', 'no_show')->count(),
                'upcoming'  => $appointments->where('status', 'confirmed')->count(),
            ],
            'chart' => $byDay,
        ]);
    }
}
