<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // 1. Check if user is logged in
        if (!$request->user()) {
            return response()->json([
                'status' => 401,
                'message' => 'Unauthorized. Please log in.'
            ], 401);
        }

        // 2. Check if the user's role matches the required role
        // This assumes your 'users' table has a 'role' column
        if ($request->user()->role !== $role) {
            return response()->json([
                'status' => 403,
                'error' => 'Forbidden',
                'message' => "Access denied. This area requires {$role} privileges."
            ], 403);
        }

        return $next($request);
    }
}