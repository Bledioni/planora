<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Business;
use Illuminate\Support\Facades\Log;

class CheckBusinessActive
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Try to get business_id from different sources
        $businessId = $this->getBusinessId($request);

        if (!$businessId) {
            // No business_id found, let it pass (validation will catch it)
            return $next($request);
        }

        Log::info("CheckBusinessActive middleware - Business ID: {$businessId}");

        // Find the business with owner
        $business = Business::with('user')->find($businessId);

        if (!$business) {
            return response()->json([
                'status' => 'error',
                'message' => 'Biznesi nuk u gjet.'
            ], 404);
        }

        // Check if business has is_active field and if it's false
        if (property_exists($business, 'is_active') && $business->is_active === false) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ky biznes është i çaktivizuar momentalisht. Ju lutemi provoni më vonë.'
            ], 403);
        }

        // Check if owner exists
        if (!$business->user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pronari i biznesit nuk u gjet.'
            ], 404);
        }

        // Check if owner is active
        if ($business->user->status !== 'active') {
            return response()->json([
                'status' => 'error',
                'message' => 'Ky biznes është i çaktivizuar momentalisht. Ju lutemi provoni më vonë.'
            ], 403);
        }

        Log::info("Business active check passed for ID: {$businessId}");

        // Business is active, continue
        return $next($request);
    }

    /**
     * Get business_id from various sources
     */
    private function getBusinessId(Request $request): ?int
    {
        // 1. Check route parameter (for routes like /business/{businessId}/...)
        if ($request->route('businessId')) {
            return (int) $request->route('businessId');
        }

        if ($request->route('business_id')) {
            return (int) $request->route('business_id');
        }

        // 2. Check request input (for POST/PUT requests)
        if ($request->has('business_id')) {
            return (int) $request->input('business_id');
        }

        // 3. Check if service_id is provided (we can get business from service)
        if ($request->has('service_id')) {
            $service = \App\Models\Services::find($request->input('service_id'));
            if ($service) {
                return (int) $service->business_id;
            }
        }

        // 4. Check if employee_id is provided (we can get business from employee)
        if ($request->has('employee_id')) {
            $employee = \App\Models\Employees::find($request->input('employee_id'));
            if ($employee) {
                return (int) $employee->business_id;
            }
        }

        return null;
    }
}