<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Password;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /* ======================
        REGISTER LOGIC
    ====================== */
   public function register(Request $request)
{
     $validated = $request->validate([
        'name'         => 'required|string|max:100',
        'surname'      => 'required|string|max:100',
        'email'        => [
            'required',
            'email:rfc,dns', // ← validates domain actually exists
            'unique:users,email',
            'max:255',
        ],
        'phone_number' => 'required|string|unique:users,phone_number|min:9|max:20',
        'password'     => 'required|min:8|confirmed',
        'role'         => 'required|string|in:business_owner,employee',
        'business_id'  => 'nullable|integer' 
    ]);

    $status = 'pending';
    $finalBusinessId = $validated['business_id'] ?? null;

    // Logjika e Autentikimit
    if (auth('sanctum')->check()) {
        $currentUser = auth('sanctum')->user();

        // Vetëm Admini mund të krijojë përdorues direkt 'active'
        if ($currentUser->role === 'admin') {
            $status = 'active';
        }

        // Pronari shton punëtorin direkt 'active' dhe ia lidh Business ID-në e tij
        if ($currentUser->role === 'business_owner' && $validated['role'] === 'employee') {
            $status = 'active';
            $finalBusinessId = $currentUser->business_id;
        }
    }

    // Sigurohemi që 'customer' është gjithmonë active (nuk ka nevojë për aprovim)
    if ($validated['role'] === 'customer') {
        $status = 'active';
    }

    $user = User::create([
        'name'         => $validated['name'],
        'surname'      => $validated['surname'],
        'email'        => $validated['email'],
        'phone_number' => $validated['phone_number'],
        'password'     => $validated['password'],
        'role'         => $validated['role'],
        'status'       => $status,
        'business_id'  => $finalBusinessId,
    ]);

    return response()->json([
    'status'  => 'success',
    'message' => 'Regjistrimi u krye me sukses! Do të ridrejtoheni te hyrja...',
    'user'    => $user
], 201);
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
        60 * 24 * 365, // 1 year
        '/',
        null,
        app()->isProduction(), 
        true,
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

    public function forgotPassword(Request $request)
{
    $request->validate(['email' => 'required|email']);

    $user = \App\Models\User::where('email', $request->email)->first();
    if (!$user) {
        return response()->json(['message' => 'Email nuk u gjet.'], 404);
    }

    $status = Password::sendResetLink($request->only('email'));

    if ($status === Password::RESET_LINK_SENT) {
        return response()->json(['message' => 'Link-u u dërgua me sukses.'], 200);
    }

    return response()->json(['message' => 'Gabim gjatë dërgimit.'], 500);
}

public function resetPassword(Request $request)
{
    $request->validate([
        'token'                 => 'required',
        'email'                 => 'required|email',
        'password'              => 'required|min:8|confirmed',
    ]);

    $status = Password::reset(
        $request->only('email', 'password', 'password_confirmation', 'token'),
        function ($user, $password) {
            $user->forceFill([
                'password' => Hash::make($password),
                'remember_token' => Str::random(60),
            ])->save();
            event(new PasswordReset($user));
        }
    );

    if ($status === Password::PASSWORD_RESET) {
        return response()->json(['message' => 'Fjalëkalimi u ndryshua me sukses.'], 200);
    }

    return response()->json(['message' => 'Token i pavlefshëm ose i skaduar.'], 422);
}

public function changePassword(Request $request)
{
    $request->validate([
        'current_password' => 'required',
        'password'         => 'required|min:8|confirmed',
    ]);

    if (!Hash::check($request->current_password, $request->user()->password)) {
        return response()->json(['message' => 'Fjalëkalimi aktual është i gabuar.'], 422);
    }

    $request->user()->update([
        'password' => Hash::make($request->password),
    ]);

    return response()->json(['message' => 'Fjalëkalimi u ndryshua me sukses.']);
}
}
