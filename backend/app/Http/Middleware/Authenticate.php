<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        // Për API, nuk duam kurrë ridrejtim (redirect).
        // Duam vetëm një përgjigje 401 Unauthorized.
        if (! $request->expectsJson()) {
            // Kjo e detyron Laravel-in të kthejë gabim JSON edhe nëse harron Header-in në React
            abort(response()->json(['error' => 'Unauthenticated.'], 401));
        }
        
        return null;
    }
}