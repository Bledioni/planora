<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
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
        'role'         => 'required|string', 
        'business_id'  => 'nullable|integer' 
    ]);

    $status = 'pending';

    if (auth('sanctum')->check()) {
        $currentUser = auth('sanctum')->user();

        if ($currentUser->role === 'admin') {
            $status = 'active';
        }

        if ($currentUser->role === 'business_owner' && $validated['role'] === 'employee') {
            $status = 'active';
            $validated['business_id'] = $currentUser->business_id;
        }
    }

    $user = User::create([
        'name'         => $validated['name'],
        'surname'      => $validated['surname'],
        'email'        => $validated['email'],
        'phone_number' => $request->phone_number,
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
            'status' => 'success',
            'user'   => [
                'id'     => $user->id,
                'name'   => $user->name,
                'role'   => $user->role,
                'status' => $user->status
            ]
        ], 200)->withCookie(
            cookie(
                'auth_token',
                $token,
                1440,
                '/',
                null,
                false,      // ← changed from app()->isProduction()
                true,       // httpOnly ← JS cannot read this
                false,
                'Lax'
            )
        );
    }

    /* ======================
        LOGOUT LOGIC
    ====================== */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Logged out'
        ])->withCookie(
            cookie()->forget('auth_token')
        );
    }

    public function getUserProfile(Request $request) {
        return response()->json([
            'status' => 'success',
            'role'   => $request->user()->role,
            'name'   => $request->user()->name,
            'email'  => $request->user()->email,
        ]);
    }
}