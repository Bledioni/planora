<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class AuthenticationController extends Controller
{
    /* ======================
        REGISTER LOGIC
    ====================== */
   public function register(Request $request)
{
    $validated = $request->validate([
        'name'         => 'required|string',
        'surname'      => 'required|string',
        'email'        => 'required|email|unique:users,email',
        'phone_number'        => 'required|string|unique:users,phone_number',
        'password'     => 'required|min:8|confirmed',
        'role'         => 'required|string', // admin, business_owner, employee
        'business_id'  => 'nullable|integer' 
    ]);

    // 1. Përcaktojmë STATUSIN në bazë të ROLIT dhe AUTORITETIT
    $status = 'pending'; // Default për çdo regjistrim publik

    if (auth('sanctum')->check()) {
        $currentUser = auth('sanctum')->user();

        // Nëse Admini regjistron dikë (çfarëdo roli), bëhet direkt ACTIVE
        if ($currentUser->role === 'admin') {
            $status = 'active';
        }

        // Nëse Owner regjistron një Employee, bëhet direkt ACTIVE
        if ($currentUser->role === 'business_owner' && $validated['role'] === 'employee') {
            $status = 'active';
            $validated['business_id'] = $currentUser->business_id; // Ia lidhim automatikisht biznesin
        }
    }

    // 2. KRIJIMI I PËRDORUESIT (Për të gjithë)
    $user = User::create([
    'name'         => $validated['name'],
    'surname'      => $validated['surname'],
    'email'        => $validated['email'],
    'phone_number' => $request->phone_number, // KJO MUNGONTE!
    'password'     => Hash::make($validated['password']),
    'role'         => $validated['role'],
    'status'       => $status,
    'business_id'  => $validated['business_id'] ?? null,
]);

    return response()->json(['status' => 'success', 'user' => $user], 201);
}

    /* ======================
        LOGIN LOGIC
    ====================== */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string|min:6'
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Email ose fjalëkalim i pasaktë'
            ], 401); 
        }

        // Bllokimi i llogarive pending ose suspended
        if ($user->status === 'pending') {
            return response()->json([
                'status'  => 'awaiting_approval',
                'message' => 'Llogaria juaj është në proces verifikimi nga Admini.'
            ], 403);
        }

        if ($user->status === 'suspended') {
            return response()->json(['message' => 'Llogaria juaj është pezulluar.'], 403);
        }

        $token = $user->createToken('auth_token', [$user->role])->plainTextToken;

        return response()->json([
            'status'  => 'success',
            'token'   => $token,
            'user'    => [
                'id'    => $user->id,
                'name'  => $user->name,
                'role'  => $user->role,
                'status' => $user->status
            ]
        ], 200);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['status' => 'success', 'message' => 'Logged out']);
    }
}