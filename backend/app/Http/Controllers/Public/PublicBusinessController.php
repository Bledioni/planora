<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Business;
use Illuminate\Http\JsonResponse;

class PublicBusinessController extends Controller
{
    public function getAllBusinesses(): JsonResponse
{
    try {
        $businesses = Business::with([
            // Eager load the relationships
            'user:id,name,surname,email,status',
            'services:id,business_id,service_name,service_price,service_duration',
            'employees.user:id,name,surname,phone_number,status'
        ])
        // 1. Filter: Only get businesses where the owner (user) is active
        ->whereHas('user', function ($query) {
            $query->where('status', 'active');
        })
        ->latest()
        ->get();

        return response()->json([
            'status' => 'success',
            'businesses' => $businesses
        ], 200);

    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Gabim gjatë marrjes së të dhënave',
            'error' => $e->getMessage()
        ], 500);
    }
}

    public function getBusinessBySlug($slug): JsonResponse
    {
        try {
            $business = Business::where('slug', $slug)
                ->with([
                    'user:id,name,surname,email,phone_number,status',
                    'services:id,business_id,service_name,service_price,service_duration',
                    'employees.user:id,name,surname,phone_number,status'
                ])
                ->whereHas('user', function ($query) {
            $query->where('status', 'active');
        })
                ->firstOrFail();

            return response()->json([
                'status' => 'success',
                'business' => $business
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Biznesi nuk u gjet.',
                'error' => $e->getMessage()
            ], 404);
        }
    }
}