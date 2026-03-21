<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;  
use App\Models\User;
use App\Models\Employees;
use App\Models\Business;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\QueryException;
use Symfony\Component\HttpFoundation\Response;


class AdminEmployeeController extends Controller
{
    public function createEmployee(Request $request)
{
    $isAddingSelf = $request->boolean('is_self');
    $isReadding   = $request->boolean('is_readd');

    try {
        $rules = [
            'business_id' => 'required|exists:businesses,id',
            'is_self'     => 'boolean',
            'is_readd'    => 'boolean',
        ];

        if (!$isAddingSelf) {
            if ($isReadding) {
                $rules['email'] = 'required|email|exists:users,email';
            } else {
                $rules = array_merge($rules, [
                    'name'         => 'required|string|max:255',
                    'surname'      => 'required|string|max:255',
                    'email'        => 'required|email|unique:users,email',
                    'phone_number' => 'required|string|max:20|unique:users,phone_number',
                    'password'     => 'required|string|min:8|confirmed',
                ]);
            }
        }

        $validated = $request->validate($rules);

    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'status' => 'validation_error',
            'errors' => $e->errors(),
        ], Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    DB::beginTransaction();

    try {
        if ($isAddingSelf) {
            $user = Auth::user();
            $ownsBusiness = Business::where('id', $validated['business_id'])
                ->where('user_id', $user->id)
                ->exists();

            if (!$ownsBusiness) {
                return response()->json(['message' => 'Nuk keni autorizim për këtë biznes.'], 403);
            }

            $targetUserId = $user->id;

        } elseif ($isReadding) {
            $user = User::where('email', $request->email)->first();
            $user->status = 'active';
            // Only change role if user is not a business_owner
            if ($user->role !== 'business_owner') {
                $user->role = 'employee';
            }
            $user->save();
            $targetUserId = $user->id;
        }else {
            $business    = Business::find($validated['business_id']);
            $ownerStatus = User::find($business->user_id)->status ?? 'pending';

            $user = User::create([
                'name'         => $validated['name'],
                'surname'      => $validated['surname'],
                'email'        => $validated['email'],
                'phone_number' => $validated['phone_number'],
                'password'     => Hash::make($validated['password']),
                'role'         => 'employee',
                'status'       => $ownerStatus,
            ]);

            $targetUserId = $user->id;
        }

        $employee = Employees::updateOrCreate(
            ['user_id' => $targetUserId, 'business_id' => $validated['business_id']],
            ['user_id' => $targetUserId, 'business_id' => $validated['business_id']]
        );

        DB::commit();

        return response()->json([
            'status'  => 'success',
            'message' => $isAddingSelf ? 'U shtuat me sukses' : 'Employee created successfully',
            'data'    => [
                'user'     => $user,
                'employee' => $employee,
            ]
        ], Response::HTTP_CREATED);

    } catch (QueryException $e) {
        DB::rollBack();
        if ($e->errorInfo[1] === 1062) {
            return response()->json([
                'status'  => 'conflict',
                'message' => 'Email or phone number already exists.',
            ], Response::HTTP_CONFLICT);
        }
        return response()->json([
            'status'  => 'server_error',
            'message' => 'Database error occurred.',
            'debug'   => config('app.debug') ? $e->getMessage() : null
        ], Response::HTTP_INTERNAL_SERVER_ERROR);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'status'  => 'server_error',
            'message' => $e->getMessage(),
        ], 500);
    }
}

    public function registerOwnerAsEmployee(Request $request)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Pa autorizim.'], 403);
        }

        $request->validate(['business_id' => 'required|exists:businesses,id']);
        $business = Business::find($request->business_id);
        $ownerId = $business->user_id;

        $exists = Employees::where('user_id', $ownerId)
            ->where('business_id', $business->id)
            ->exists();

        if ($exists) return response()->json(['message' => 'Pronari është regjistruar tashmë si punonjës.'], 400);

        Employees::create([
            'user_id' => $ownerId,
            'business_id' => $business->id,
        ]);

        return response()->json(['status' => 'success', 'message' => 'Pronari u shtua si punonjës me sukses!'], 201);
    }

    public function getBusinessEmployees($businessId)
    {
        try {
            $business = Business::find($businessId);
            
            if (!$business) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Business not found'
                ], 404);
            }

            $employees = Employees::where('business_id', $businessId)
                ->with(['user:id,name,surname,email,phone_number,status'])
                ->get();

            $formattedEmployees = $employees->map(function ($employee) {
                return [
                    'id' => $employee->id,
                    'user_id' => $employee->user_id,
                    'business_id' => $employee->business_id,
                    'name' => $employee->user->name ?? 'N/A',
                    'surname' => $employee->user->surname ?? 'N/A',
                    'email' => $employee->user->email ?? 'N/A',
                    'phone_number' => $employee->user->phone_number ?? 'N/A',
                    'status' => $employee->user->status ?? 'unknown',
                    'created_at' => $employee->created_at,
                ];
            });

            return response()->json([
                'status' => 'success',
                'business' => [
                    'id' => $business->id,
                    'name' => $business->name,
                    'shop_name' => $business->shop_name,
                ],
                'employees' => $formattedEmployees,
                'total' => $formattedEmployees->count()
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch employees',
                'error' => $e->getMessage()
            ], 500);
        }
    }
public function deleteEmployee($employeeId)
{
    try {
        $employee = Employees::with('user')->find($employeeId);
        
        if (!$employee) {
            return response()->json([
                'status' => 'error',
                'message' => 'Punonjësi nuk u gjet.'
            ], 404);
        }

        $employeeName = $employee->user->name ?? 'Unknown';
        $employeeSurname = $employee->user->surname ?? '';

        // Cancel upcoming appointments and notify clients
        $appointments = \App\Models\Appointments::where('employee_id', $employeeId)
            ->whereIn('status', ['confirmed', 'pending'])
            ->where('start_time', '>=', now())
            ->get();

        $appointmentCount = $appointments->count();

        foreach ($appointments as $appointment) {
            $appointment->status = 'cancelled';
            $appointment->save();

            if ($appointment->client_email) {
                try {
                    \Illuminate\Support\Facades\Mail::send(
                        [], [],
                        function ($message) use ($appointment, $employeeName, $employeeSurname) {
                            $date = \Carbon\Carbon::parse($appointment->start_time)->format('d/m/Y');
                            $time = \Carbon\Carbon::parse($appointment->start_time)->format('H:i');
                            $message->to($appointment->client_email)
                                ->subject('Termini juaj u anulua')
                                ->html("
                                    <div style='font-family: sans-serif; padding: 20px; max-width: 600px;'>
                                        <h2 style='color: #ef4444;'>Termini juaj u anulua</h2>
                                        <p>Përshëndetje <strong>{$appointment->client_name}</strong>,</p>
                                        <p>Na vjen keq t'ju njoftojmë se termini juaj me 
                                        <strong>{$employeeName} {$employeeSurname}</strong> 
                                        më datë <strong>{$date}</strong> 
                                        në orën <strong>{$time}</strong> 
                                        u anulua.</p>
                                        <p>Ju lutemi kontaktoni biznesin për të bërë një rezervim të ri.</p>
                                        <p style='color: #6b7280; font-size: 14px;'>Me respekt,<br>Ekipi i Planora Book</p>
                                    </div>
                                ");
                        }
                    );
                } catch (\Exception $mailError) {
                    \Illuminate\Support\Facades\Log::error('Mail failed: ' . $mailError->getMessage());
                }
            }
        }

        // Revoke all tokens — forces re-login
        $user = \App\Models\User::find($employee->user_id);
        if ($user) {
            $user->tokens()->delete();
        }

        // Delete the employee record
        $employee->delete();

        return response()->json([
            'status' => 'success',
            'message' => "Punonjësi $employeeName $employeeSurname u fshi me sukses.",
            'cancelled_appointments' => $appointmentCount
        ], 200);

    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
            'line' => $e->getLine(),
            'file' => basename($e->getFile())
        ], 500);
    }
}
    public function getEmployeeAppointmentCount($employeeId)
    {
        $employee = Employees::with('user')->find($employeeId);
        if (!$employee) {
            return response()->json(['count' => 0, 'name' => '']);
        }

        $count = \App\Models\Appointments::where('employee_id', $employeeId)
            ->whereIn('status', ['confirmed', 'pending'])
            ->where('start_time', '>=', now())
            ->count();

        return response()->json([
            'count' => $count,
            'name' => $employee->user->name . ' ' . $employee->user->surname
        ]);
    }

    public function updateEmployee(Request $request, $employeeId)
    {
        try {
            $employee = Employees::findOrFail($employeeId);
            $user = User::findOrFail($employee->user_id);

            $validated = $request->validate([
                'name'         => 'required|string|max:255',
                'surname'      => 'required|string|max:255',
                'email'        => 'required|email|unique:users,email,' . $user->id,
                'phone_number' => 'required|string|max:20|unique:users,phone_number,' . $user->id,
                'status'       => 'required|in:active,pending,inactive,suspended',
            ]);

            $user->update($validated);

            return response()->json([
                'status'  => 'success',
                'message' => 'Punonjësi u përditësua me sukses.',
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['status' => 'validation_error', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
}