<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Business;
use App\Models\Employees;
use App\Models\Services;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str; // Added for slug generation

class BusinessesController extends Controller
{
    public function __construct()
    {
        // Public access for browsing; Owner access for management
        $this->middleware(['auth:sanctum', 'role:business_owner'])
             ->only(['InsertServices']);
    }

    /**
     * Step 1: List all businesses (Barber Discovery Page)
     */
    public function index()
    {
        try {
            // CRITICAL FIX: Included 'slug' in the selection
            $businesses = Business::select('id', 'slug', 'shop_name', 'address', 'business_type', 'description')->get();
            
            return response()->json([
                'status' => 'success',
                'data' => $businesses
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gabim gjatë marrjes së bizneseve.'], 500);
        }
    }

    /**
     * Step 2: Get Details by Slug (planora.com/tevisi)
     * This transforms the data into the exact format your React App expects.
     */
    public function getDetailsBySlug($slug)
    {
        $business = Business::with(['employees.user:id,name', 'services'])
            ->where('slug', $slug)
            ->first();

        if (!$business) {
            return response()->json(['message' => 'Biznesi nuk u gjet.'], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $this->formatBusinessData($business)
        ], 200);
    }

    /**
     * Step 3: Get Details by ID (Fallback/Internal)
     */
    public function getDetails($id)
    {
        $business = Business::with(['employees.user:id,name', 'services'])->find($id);

        if (!$business) {
            return response()->json(['message' => 'Biznesi nuk u gjet.'], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $this->formatBusinessData($business)
        ], 200);
    }

    /**
     * Helper: Keep data structure consistent for React
     */
    private function formatBusinessData($business)
    {
        return [
            'id' => $business->id,
            'slug' => $business->slug,
            'shop_name' => $business->shop_name,
            'address' => $business->address,
            'description' => $business->description,
            'barbers' => $business->employees->map(function ($emp) {
                return [
                    'id' => $emp->id,
                    'name' => $emp->user->name ?? 'Barber i paemërtuar',
                ];
            }),
            'services' => $business->services->map(function ($service) {
                return [
                    'id' => $service->id,
                    'name' => $service->service_name,
                    'price' => $service->service_price,
                    'duration' => $service->service_duration,
                    'description' => $service->service_description,
                ];
            }),
        ];
    }

    /**
     * Add Services to a Business (Owner Only)
     */
    public function InsertServices(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'business_id'         => 'required|integer|exists:businesses,id',
            'service_name'        => 'required|string|max:255',
            'service_description' => 'nullable|string|max:1000',
            'service_price'       => 'required|numeric|min:0',
            'service_duration'    => 'required|integer|min:1|max:480', 
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $service = Services::create($request->all());

            return response()->json([
                'status'  => 201,
                'message' => 'Shërbimi u shtua me sukses.',
                'data'    => $service
            ], 201);

        } catch (\Exception $e) {
            Log::error("Service Error: " . $e->getMessage());
            return response()->json(['message' => 'Gabim në server.'], 500);
        }
    }
}