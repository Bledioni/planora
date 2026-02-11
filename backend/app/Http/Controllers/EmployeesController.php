<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Employees;
use App\Models\Business;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\QueryException;
use Symfony\Component\HttpFoundation\Response;

class EmployeesController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'role:admin']);
    }

    public function InsertEmployee(Request $request)
    {
        $isAddingSelf = $request->boolean('is_self');

        // 1️⃣ Validimi (422 — Validation error)
        try {
            $rules = [
                'business_id' => 'required|exists:businesses,id',
                'is_self'     => 'boolean'
            ];

            // Nëse nuk po shton veten, kërko të gjitha fushat përfshirë CONFIRMED
            if (!$isAddingSelf) {
                $rules = array_merge($rules, [
                    'name'         => 'required|string|max:255',
                    'surname'      => 'required|string|max:255',
                    'email'        => 'required|email|unique:users,email',
                    'phone_number' => 'required|string|max:20|unique:users,phone_number',
                    'password'     => 'required|string|min:8|confirmed', // Mbetet confirmed këtu
                ]);
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
                
                // Kontrollo ownership
                $ownsBusiness = Business::where('id', $validated['business_id'])
                                        ->where('user_id', $user->id)
                                        ->exists();
                
                if (!$ownsBusiness) {
                    return response()->json(['message' => 'Nuk keni autorizim për këtë biznes.'], 403);
                }

                $targetUserId = $user->id;
            } else {
                // Krijimi i përdoruesit të ri (vetëm nëse is_self është false)
                $user = User::create([
                    'name'         => $validated['name'],
                    'surname'      => $validated['surname'],
                    'email'        => $validated['email'],
                    'phone_number' => $validated['phone_number'],
                    'password'     => Hash::make($validated['password']),
                    'role'         => 'employee',
                ]);
                $targetUserId = $user->id;
            }

            // 2️⃣ Create employee (Lidhja me biznesin)
            // Përdorim updateOrCreate për të shmangur duplikimet
            $employee = Employees::updateOrCreate(
                ['user_id' => $targetUserId, 'business_id' => $validated['business_id']],
                ['user_id' => $targetUserId]
            );
            
            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => $isAddingSelf ? 'U shtuat me sukses' : 'Employee created successfully',
                'data' => [
                    'user' => $user,
                    'employee' => $employee,
                ]
            ], Response::HTTP_CREATED);

        } catch (QueryException $e) {
            DB::rollBack();

            if ($e->errorInfo[1] === 1062) {
                return response()->json([
                    'status' => 'conflict',
                    'message' => 'Email or phone number already exists.',
                ], Response::HTTP_CONFLICT);
            }

            return response()->json([
                'status' => 'server_error',
                'message' => 'Database error occurred.',
                'debug' => config('app.debug') ? $e->getMessage() : null
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'server_error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}