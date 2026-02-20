<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Business;
use App\Models\Employees; 
use App\Models\Services;
use App\Models\Categories;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class OwnerServiceController extends Controller
{
    public function createService(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'business_id' => 'required|exists:businesses,id',
            'service_name' => 'required|string',
            'service_price' => 'required|numeric',
            'service_duration' => 'required|integer',
        ]);

        if ($validator->fails()) return response()->json(['errors' => $validator->errors()], 422);

        $service = Services::create([
            'business_id' => $request->business_id,
            'service_name' => $request->service_name,
            'description' => $request->service_description,
            'service_price' => $request->service_price,
            'service_duration' => $request->service_duration,
        ]);

        return response()->json(['status' => 'success', 'service' => $service], 201);
    }

    public function updateService(Request $request, $serviceId)
{
    $validator = Validator::make($request->all(), [
        'business_id' => 'required|exists:businesses,id',
        'service_name' => 'required|string',
        'service_price' => 'required|numeric',
        'service_duration' => 'required|integer',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    $service = Services::findOrFail($serviceId);

    // Verify ownership
    if ($service->business_id != $request->business_id) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $service->update([
        'service_name' => $request->service_name,
        'description' => $request->service_description,
        'service_price' => $request->service_price,
        'service_duration' => $request->service_duration,
    ]);

    return response()->json([
        'status' => 'success',
        'message' => 'Shërbimi u përditësua me sukses',
        'service' => $service
    ], 200);
}

public function deleteService($serviceId)
{
    try {
        $service = Services::findOrFail($serviceId);
        
        // Verify ownership (optional but recommended)
        $business = Business::where('user_id', auth()->id())->first();
        if ($service->business_id != $business->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $service->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Shërbimi u fshi me sukses'
        ], 200);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Gabim gjatë fshirjes',
            'error' => $e->getMessage()
        ], 500);
    }
}
}
