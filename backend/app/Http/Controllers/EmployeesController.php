<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Employees;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\QueryException;
use Symfony\Component\HttpFoundation\Response;

class EmployeesController extends Controller
{

    public function __construct()
    {
        // This ensures the user is logged in AND has the 'admin' role
        // 'role:admin' assumes you have a middleware that checks the role column
        $this->middleware(['auth:sanctum', 'role:business_owner']);
    }

    public function InsertEmployee(Request $request)
    {
        // 422 — Validation error
        try {
            $validated = $request->validate([
                'business_id' => 'required|exists:businesses,id',
                'name' => 'required|string|max:255',
                'surname' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'phone_number' => 'required|string|max:20|unique:users,phone_number',
                'password' => 'required|string|min:8|confirmed',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'validation_error',
                'errors' => $e->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        DB::beginTransaction();

        try {
            // 1️⃣ Create user
            $user = User::create([
                'name' => $validated['name'],
                'surname' => $validated['surname'],
                'email' => $validated['email'],
                'phone_number' => $validated['phone_number'],
                'password' => Hash::make($validated['password']),
                'role' => 'employee',
            ]);

            // 2️⃣ Create employee (ONLY FK)
            $employee = Employees::create([
                'user_id' => $user->id,
                'business_id' => $validated['business_id'],
            ]);
            
            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Employee created successfully',
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
        }
    }
}
