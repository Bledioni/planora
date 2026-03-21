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
            'user:id,name,surname,status',
            'services:id,business_id,service_name,service_price,service_duration',
            'employees.user:id,name,surname,status'  // ← removed phone_number
        ])
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
            'message' => 'Gabim gjatë marrjes së të dhënave'
        ], 500);
    }
}

public function getBusinessBySlug($slug): JsonResponse
{
    try {
        $business = Business::where('slug', $slug)
            ->with([
                'user:id,name,surname,status',
                'services:id,business_id,service_name,service_price,service_duration',
                'employees.user:id,name,surname,status'  // ← removed phone_number
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
            'message' => 'Biznesi nuk u gjet.'
        ], 404);
    }
}
}