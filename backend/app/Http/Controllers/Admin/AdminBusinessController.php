<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Business;
use App\Models\Employees; 
use App\Models\Services;
use App\Models\Categories;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AdminBusinessController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'role:admin']);
    }

    /**
     * Get all businesses for admin panel
     */
    public function GetBusinesses()
    {
        try {
            $businesses = Business::with([
                'user:id,name,surname,email',
                'category:id,name'
            ])
            ->latest()
            ->get();

            return response()->json([
                'status' => 'success',
                'businesses' => $businesses
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching businesses: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gabim gjatë marrjes së bizneseve',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all business owners with their businesses
     */
    public function GetBusinessOwners() 
    {
        try {
            $owners = User::where('role', 'business_owner')
                ->with(['business:id,user_id,shop_name,address,business_type,created_at,updated_at'])
                ->select('id', 'name', 'surname', 'email', 'phone_number', 'status', 'business_id', 'created_at', 'updated_at')
                ->latest()
                ->get();

            return response()->json([
                'status' => 'success',
                'business_owners' => $owners
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching business owners: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gabim gjatë marrjes së pronarëve',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new business
     */
    public function createBusiness(Request $request)
    {
        Log::info("Business creation request data:", $request->all());

        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'category_id' => 'required|exists:categories,id',
            'shop_name' => 'required|string|max:255',
            'address' => 'required|string',
            'business_type' => 'required|string',
            'description' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Create business using ONLY fields from your fillable array
            $business = Business::create([
                'user_id' => $request->user_id,
                'category_id' => $request->category_id,
                'shop_name' => $request->shop_name,
                'address' => $request->address,
                'business_type' => $request->business_type,
                'description' => $request->description,
                'slug' => Str::slug($request->shop_name) . '-' . rand(100, 999)
            ]);

            // Update the owner user
            $user = User::find($request->user_id);
            if ($user) {
                $user->update([
                    'status' => 'active',
                    'business_id' => $business->id,
                    'role' => 'business_owner'
                ]);
                $user->touch();
            }

            DB::commit();

            Log::info("Business created successfully with ID: {$business->id}");

            return response()->json([
                'status' => 'success',
                'message' => 'Biznesi u krijua dhe pronari u bë ACTIVE!',
                'business' => $business,
                'user_updated' => $user ? true : false
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating business: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Gabim gjatë krijimit të biznesit',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * List all businesses
     */
    public function listAllBusinesses()
    {
        try {
            $businesses = Business::with([
                'user:id,name,surname,email',
                'category:id,name'
            ])
            ->latest()
            ->get();

            return response()->json([
                'status' => 'success',
                'businesses' => $businesses
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error listing businesses: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Gabim gjatë marrjes së bizneseve',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Deactivate business (block owner and all employees)
     */
    public function deactivateBusiness($id)
    {
        try {
            DB::beginTransaction();

            $business = Business::findOrFail($id);

            // Update owner status
            if ($business->user_id) {
                $owner = User::find($business->user_id);
                if ($owner) {
                    $owner->update(['status' => 'pending']);
                    $owner->touch();
                }
            }

            // Deactivate all employees
            $employeeCount = 0;
            $employees = Employees::where('business_id', $id)->with('user')->get();
            
            foreach ($employees as $employee) {
                if ($employee->user) {
                    $employee->user->update(['status' => 'pending']);
                    $employee->user->touch();
                    $employeeCount++;
                }
            }

            DB::commit();

            $totalAffected = 1 + $employeeCount;

            Log::info("Business {$id} deactivated. Affected users: {$totalAffected}");

            return response()->json([
                'status' => 'success', 
                'message' => "Aksesi u pezullua për {$totalAffected} përdorues (1 pronar + {$employeeCount} punonjës)."
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deactivating business: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Gabim gjatë çaktivizimit të biznesit',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Activate business (activate owner and all employees)
     */
    public function activateBusiness($id)
    {
        try {
            DB::beginTransaction();

            $business = Business::findOrFail($id);

            // Activate owner
            if ($business->user_id) {
                $owner = User::find($business->user_id);
                if ($owner) {
                    $owner->update(['status' => 'active']);
                    $owner->touch();
                }
            }

            // Activate all employees
            $employeeCount = 0;
            $employees = Employees::where('business_id', $id)->with('user')->get();
            
            foreach ($employees as $employee) {
                if ($employee->user) {
                    $employee->user->update(['status' => 'active']);
                    $employee->user->touch();
                    $employeeCount++;
                }
            }

            DB::commit();

            $totalAffected = 1 + $employeeCount;

            Log::info("Business {$id} activated. Affected users: {$totalAffected}");

            return response()->json([
                'status' => 'success',
                'message' => "Biznesi u ri-aktivizua! {$totalAffected} përdorues janë tani ACTIVE (1 pronar + {$employeeCount} punonjës)."
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error activating business: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Gabim gjatë aktivizimit të biznesit',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single business details
     */
    public function getBusinessDetails($id)
    {
        try {
            $business = Business::with([
                'user:id,name,surname,email,phone_number',
                'services',
                'employees.user:id,name,surname,email,phone_number,status'
            ])->findOrFail($id);

            return response()->json([
                'status' => 'success',
                'business' => $business
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error fetching business details: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Biznesi nuk u gjet',
                'error' => $e->getMessage()
            ], 404);
        }
    }
}