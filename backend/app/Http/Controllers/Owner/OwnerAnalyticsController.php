<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Business;
use App\Models\Employees;
use App\Models\Appointments;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;

class OwnerAnalyticsController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'role:business_owner']);
    }

    /**
     * Get business dashboard stats with time filters
     */
    public function getBusinessStats(Request $request)
    {
        try {
            $user = $request->user();
            $business = Business::where('user_id', $user->id)->firstOrFail();

            // Time filter (month, year, all)
            $filter = $request->get('filter', 'month');
            $date = $request->get('date', now());

            $query = Appointments::where('business_id', $business->id);

            // Apply time filter
            if ($filter === 'month') {
                $query->whereYear('start_time', Carbon::parse($date)->year)
                      ->whereMonth('start_time', Carbon::parse($date)->month);
            } elseif ($filter === 'year') {
                $query->whereYear('start_time', Carbon::parse($date)->year);
            }

            // Stats - Exclude canceled appointments from total count
            $totalAppointments = (clone $query)->whereNotIn('status', ['canceled'])->count();
            $completedAppointments = (clone $query)->where('status', 'completed')->count();
            $confirmedAppointments = (clone $query)->where('status', 'confirmed')->count();
            $canceledAppointments = (clone $query)->where('status', 'canceled')->count();
            $pendingAppointments = (clone $query)->where('status', 'pending')->count();

            // Top services (excluding canceled appointments)
            $topServices = (clone $query)
                ->whereNotIn('status', ['canceled'])
                ->select('service_id', DB::raw('count(*) as total'))
                ->with('service:id,service_name')
                ->groupBy('service_id')
                ->orderBy('total', 'desc')
                ->limit(5)
                ->get()
                ->map(function($item) {
                    return [
                        'service_name' => $item->service->service_name ?? 'N/A',
                        'total' => $item->total
                    ];
                });

            return response()->json([
                'status' => 'success',
                'stats' => [
                    'total_appointments' => $totalAppointments,
                    'completed' => $completedAppointments,
                    'confirmed' => $confirmedAppointments,
                    'canceled' => $canceledAppointments,
                    'pending' => $pendingAppointments,
                    'top_services' => $topServices,
                    'filter' => $filter,
                    'date' => $date
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error fetching business stats: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gabim gjatë marrjes së statistikave',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get employee stats with time filters
     */
    public function getEmployeeStats(Request $request, $employeeId)
    {
        try {
            $user = $request->user();
            $business = Business::where('user_id', $user->id)->firstOrFail();

            // Verify employee belongs to this business
            $employee = Employees::where('id', $employeeId)
                ->where('business_id', $business->id)
                ->with('user:id,name,surname,email')
                ->firstOrFail();

            // Time filter
            $filter = $request->get('filter', 'month');
            $date = $request->get('date', now());

            $query = Appointments::where('business_id', $business->id)
                ->where('employee_id', $employeeId);

            // Apply time filter
            if ($filter === 'month') {
                $query->whereYear('start_time', Carbon::parse($date)->year)
                      ->whereMonth('start_time', Carbon::parse($date)->month);
            } elseif ($filter === 'year') {
                $query->whereYear('start_time', Carbon::parse($date)->year);
            }

            // Stats - Exclude canceled
            $totalAppointments = (clone $query)->whereNotIn('status', ['canceled'])->count();
            $completedAppointments = (clone $query)->where('status', 'completed')->count();
            $confirmedAppointments = (clone $query)->where('status', 'confirmed')->count();
            $canceledAppointments = (clone $query)->where('status', 'canceled')->count();
            $pendingAppointments = (clone $query)->where('status', 'pending')->count();

            // Most booked services (excluding canceled)
            $topServices = (clone $query)
                ->whereNotIn('status', ['canceled'])
                ->select('service_id', DB::raw('count(*) as total'))
                ->with('service:id,service_name')
                ->groupBy('service_id')
                ->orderBy('total', 'desc')
                ->limit(5)
                ->get()
                ->map(function($item) {
                    return [
                        'service_name' => $item->service->service_name ?? 'N/A',
                        'total' => $item->total
                    ];
                });

            return response()->json([
                'status' => 'success',
                'employee' => [
                    'id' => $employee->id,
                    'name' => $employee->user->name . ' ' . $employee->user->surname,
                    'email' => $employee->user->email
                ],
                'stats' => [
                    'total_appointments' => $totalAppointments,
                    'completed' => $completedAppointments,
                    'confirmed' => $confirmedAppointments,
                    'canceled' => $canceledAppointments,
                    'pending' => $pendingAppointments,
                    'top_services' => $topServices,
                    'filter' => $filter,
                    'date' => $date
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error fetching employee stats: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gabim gjatë marrjes së statistikave të punonjësit',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get owner's schedule (if owner is also registered as employee)
     */
    public function getOwnerSchedule(Request $request)
    {
        try {
            $user = $request->user();
            $business = Business::where('user_id', $user->id)->firstOrFail();

            // Check if owner is registered as employee
            $ownerEmployee = Employees::where('business_id', $business->id)
                ->where('user_id', $user->id)
                ->with('schedules')
                ->first();

            if (!$ownerEmployee) {
                return response()->json([
                    'status' => 'info',
                    'message' => 'Ju nuk jeni regjistruar si punonjës.',
                    'is_employee' => false
                ], 200);
            }

            return response()->json([
                'status' => 'success',
                'is_employee' => true,
                'employee_id' => $ownerEmployee->id,
                'schedules' => $ownerEmployee->schedules
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error fetching owner schedule: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gabim gjatë marrjes së orarit',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all employees with their schedules
     */
    public function getAllEmployeesWithSchedules(Request $request)
    {
        try {
            $user = $request->user();
            $business = Business::where('user_id', $user->id)->firstOrFail();

            $employees = Employees::where('business_id', $business->id)
                ->with(['user:id,name,surname,email,status', 'schedules'])
                ->get()
                ->map(function($employee) {
                    return [
                        'id' => $employee->id,
                        'name' => $employee->user->name . ' ' . $employee->user->surname,
                        'email' => $employee->user->email,
                        'status' => $employee->user->status,
                        'schedules' => $employee->schedules
                    ];
                });

            return response()->json([
                'status' => 'success',
                'employees' => $employees
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error fetching employees: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gabim gjatë marrjes së punonjësve',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update appointment status with validation
     */
    public function updateAppointmentStatus(Request $request, $appointmentId)
    {
        try {
            $request->validate([
                'status' => 'required|in:pending,confirmed,completed,canceled'
            ]);

            $user = $request->user();
            $business = Business::where('user_id', $user->id)->firstOrFail();

            $appointment = Appointments::where('id', $appointmentId)
                ->where('business_id', $business->id)
                ->firstOrFail();

            // Prevent canceled appointments from being marked as completed
            if ($appointment->status === 'canceled' && $request->status === 'completed') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Nuk mund të shënoni si të përfunduar një termin të anuluar.'
                ], 400);
            }

            // Prevent completed appointments from being marked as canceled
            if ($appointment->status === 'completed' && $request->status === 'canceled') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Nuk mund të anuloni një termin të përfunduar.'
                ], 400);
            }

            $appointment->update(['status' => $request->status]);

            if ($request->status === 'canceled') {
                Mail::to($appointment->client_email)
                    ->send(new \App\Mail\AppointmentCancelledMail($appointment));
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Statusi u përditësua me sukses',
                'appointment' => $appointment
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error updating appointment: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gabim gjatë përditësimit',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get appointments with filters
     */
    public function getAppointments(Request $request)
{
    try {
        $user = $request->user();
        $business = Business::where('user_id', $user->id)->firstOrFail();

        $date = $request->get('date');
        $employeeId = $request->get('employee_id');
        $status = $request->get('status');

        $query = Appointments::where('business_id', $business->id)
            ->with(['employee.user:id,name,surname', 'service:id,service_name,service_price,service_duration']);

        if ($date) {
            $query->whereDate('start_time', $date);
        }

        if ($employeeId) {
            $query->where('employee_id', $employeeId);
        }

        if ($status) {
            $query->where('status', $status);
        }

        $appointments = $query->orderBy('start_time', 'asc')
    ->get()
    ->map(function($apt) {
        $startTime = Carbon::parse($apt->start_time);
        return [
            'id'               => $apt->id,
            'booking_id'       => $apt->booking_id, // 👈 added
            'appointment_date' => $startTime->format('Y-m-d'),
            'appointment_time' => $startTime->format('H:i'),
            'client_name'      => $apt->client_name,
            'client_email'     => $apt->client_email,
            'client_phone'     => $apt->client_phone,
            'status'           => $apt->status,
            'employee' => [
                'id'   => $apt->employee->id,
                'name' => ($apt->employee->user->name ?? '') . ' ' . ($apt->employee->user->surname ?? '')
            ],
            'service' => [
                'id'       => $apt->service->id ?? null,
                'name'     => $apt->service->service_name ?? 'N/A',
                'price'    => $apt->service->service_price ?? 0,
                'duration' => $apt->service->service_duration ?? 0
            ]
        ];
    });

$grouped = $appointments->groupBy(fn($apt) => $apt['booking_id'] ?? $apt['id'])
    ->map(function($group) {
        $first = $group->first();
        return [
            'ids'              => $group->pluck('id')->toArray(),
            'booking_id'       => $first['booking_id'],
            'appointment_date' => $first['appointment_date'],
            'appointment_time' => $first['appointment_time'],
            'client_name'      => $first['client_name'],
            'client_email'     => $first['client_email'],
            'client_phone'     => $first['client_phone'],
            'status'           => $first['status'],
            'employee'         => $first['employee'],
            'services'         => $group->map(fn($a) => $a['service'])->values(),
            'total_price'      => $group->sum(fn($a) => $a['service']['price']),
        ];
    })->values();

        return response()->json([
            'status' => 'success',
            'appointments' => $grouped,
            'total' => $grouped->count()
        ], 200);

    } catch (\Exception $e) {
        Log::error('Error fetching appointments: ' . $e->getMessage());
        return response()->json([
            'status' => 'error',
            'message' => 'Gabim gjatë marrjes së termineve',
            'error' => $e->getMessage()
        ], 500);
    }
}
}