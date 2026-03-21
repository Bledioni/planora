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
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class AdminBusinessController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'role:admin']);
    }

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
                'message' => 'Gabim gjatë marrjes së bizneseve'
            ], 500);
        }
    }

    public function GetBusinessOwners() 
    {
        try {
            $owners = User::where('role', 'business_owner')
                ->with([
                    'business:id,user_id,shop_name,address,slug',
                    'business.subscription:id,business_id,start_date,end_date,status'
                ])
                ->select('id', 'name', 'surname', 'email', 'phone_number', 'status', 'created_at')
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
                'message' => 'Gabim gjatë marrjes së pronarëve'
            ], 500);
        }
    }

    public function createBusiness(Request $request)
    {
        Log::info("Business creation request data:", $request->all());

        $validator = Validator::make($request->all(), [
            'user_id'       => 'required|exists:users,id',
            'category_id'   => 'required|exists:categories,id',
            'shop_name'     => 'required|string|max:255',
            'address'       => 'required|string',
            'location_link' => 'nullable|url',
            'description'   => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Validation failed',
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $business = Business::create([
                'user_id'       => $request->user_id,
                'category_id'   => $request->category_id,
                'shop_name'     => $request->shop_name,
                'address'       => $request->address,
                'location_link' => $request->location_link,
                'description'   => $request->description,
                'slug'          => Str::slug($request->shop_name) . '-' . rand(100, 999)
            ]);

            $user = User::find($request->user_id);
            if ($user) {
                $user->update([
                    'status'      => 'active',
                    'business_id' => $business->id,
                    'role'        => 'business_owner'
                ]);
                $user->touch();
            }

            DB::commit();

            return response()->json([
                'status'       => 'success',
                'message'      => 'Biznesi u krijua dhe pronari u bë ACTIVE!',
                'business'     => $business,
                'user_updated' => $user ? true : false
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating business: ' . $e->getMessage());
            
            return response()->json([
                'status'  => 'error',
                'message' => 'Gabim gjatë krijimit të biznesit'
            ], 500);
        }
    }

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
                'status'     => 'success',
                'businesses' => $businesses
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error listing businesses: ' . $e->getMessage());
            
            return response()->json([
                'status'  => 'error',
                'message' => 'Gabim gjatë marrjes së bizneseve'
            ], 500);
        }
    }

    public function deactivateBusiness($id)
    {
        try {
            DB::beginTransaction();

            $business = Business::findOrFail($id);

            if ($business->user_id) {
                $owner = User::find($business->user_id);
                if ($owner) {
                    $owner->update(['status' => 'pending']);
                    $owner->touch();
                }
            }

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

            return response()->json([
                'status'  => 'success', 
                'message' => "Aksesi u pezullua për {$totalAffected} përdorues (1 pronar + {$employeeCount} punonjës)."
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deactivating business: ' . $e->getMessage());
            
            return response()->json([
                'status'  => 'error',
                'message' => 'Gabim gjatë çaktivizimit të biznesit'
            ], 500);
        }
    }

    public function activateBusiness(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            $business = Business::findOrFail($id);

            $startDate = now();
            $endDate   = null;

            if ($request->has('months')) {
                $endDate = now()->addMonths((int) $request->months);
            } elseif ($request->has('end_date')) {
                $endDate = $request->end_date;
            } else {
                $endDate = now()->addMonth();
            }

            \App\Models\Subscription::updateOrCreate(
                ['business_id' => $id],
                [
                    'start_date' => $startDate,
                    'end_date'   => $endDate,
                    'months'     => $request->months ?? 0,
                    'status'     => 'active',
                ]
            );

            if ($business->user_id) {
                $owner = User::find($business->user_id);
                if ($owner) {
                    $owner->update(['status' => 'active']);
                    $owner->touch();
                }
            }

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

            $formattedDate = \Carbon\Carbon::parse($endDate)->format('d/m/Y');

            return response()->json([
                'status'  => 'success',
                'message' => "Biznesi u aktivizua deri më {$formattedDate}! (1 pronar + {$employeeCount} punonjës)."
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error activating business: ' . $e->getMessage());
            
            return response()->json([
                'status'  => 'error',
                'message' => 'Gabim gjatë aktivizimit të biznesit dhe abonimit'
            ], 500);
        }
    }

    public function getBusinessDetails($id)
    {
        try {
            $business = Business::with([
                'user:id,name,surname,email,phone_number',
                'services',
                'employees.user:id,name,surname,email,phone_number,status'
            ])->findOrFail($id);

            return response()->json([
                'status'   => 'success',
                'business' => $business
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error fetching business details: ' . $e->getMessage());
            
            return response()->json([
                'status'  => 'error',
                'message' => 'Biznesi nuk u gjet'
            ], 404);
        }
    }

    public function sendEmail(Request $request)
    {
        // Rate limit — max 3 bulk sends per hour per admin
        $key = 'send-email:' . auth()->id();
        if (RateLimiter::tooManyAttempts($key, 3)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Ju keni dërguar shumë email. Prisni një orë.'
            ], 429);
        }
        RateLimiter::hit($key, 3600);

        $request->validate([
            'subject'      => 'required|string|max:255',
            'message'      => 'required|string',
            'business_id'  => 'nullable|exists:businesses,id',
            'send_to_all'  => 'boolean'
        ]);

        try {
            if ($request->send_to_all) {
                $owners = User::where('role', 'business_owner')
                    ->where('status', 'active')
                    ->with('business')
                    ->get();

                $count = 0;
                foreach ($owners as $owner) {
                    \Mail::to($owner->email)->send(
                        new \App\Mail\BusinessNotification(
                            $request->subject,
                            $request->message,
                            $owner->business->shop_name ?? null
                        )
                    );
                    $count++;
                }

                return response()->json([
                    'status'  => 'success',
                    'message' => "Email u dërgua me sukses te {$count} biznese!"
                ], 200);

            } else {
                $business = Business::with('user')->findOrFail($request->business_id);

                if (!$business->user) {
                    return response()->json([
                        'status'  => 'error',
                        'message' => 'Biznesi nuk ka pronar të regjistruar.'
                    ], 404);
                }

                \Mail::to($business->user->email)->send(
                    new \App\Mail\BusinessNotification(
                        $request->subject,
                        $request->message,
                        $business->shop_name
                    )
                );

                return response()->json([
                    'status'  => 'success',
                    'message' => "Email u dërgua me sukses te {$business->user->name}!"
                ], 200);
            }

        } catch (\Exception $e) {
            Log::error('Error sending email: ' . $e->getMessage());
            return response()->json([
                'status'  => 'error',
                'message' => 'Gabim gjatë dërgimit të emailit'
            ], 500);
        }
    }
}