<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Business;
use App\Models\Employees; 
use App\Models\Services;
use App\Models\Categories;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class BusinessesController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['index', 'getDetailsBySlug', 'getCategories']);
    }

    /** 1. AKTIVIZIMI I BIZNESIT (Kill-Switch ON) */
    /** 1. AKTIVIZIMI I BIZNESIT (Kill-Switch ON) */
public function StoreBusiness(Request $request)
{
    \Log::info("Të dhënat nga React:", $request->all());

    if (!$request->user_id) {
        return response()->json(['message' => 'USER_ID nuk erdhi nga React!'], 400);
    }

    try {
        // A) Krijojmë Biznesin
        $business = Business::create([
            'user_id'       => $request->user_id,
            'category_id'   => $request->category_id,
            'shop_name'     => $request->shop_name,
            'address'       => $request->address,
            'business_type' => $request->business_type,
            'description'   => $request->description,
            'slug'          => \Illuminate\Support\Str::slug($request->shop_name) . '-' . rand(100, 999),
        ]);

        // B) Përditësimi me Query Builder
        // KËTU: Përdorim (int) për t'u siguruar që ID është numër
        $affected = \Illuminate\Support\Facades\DB::table('users')
            ->where('id', (int)$request->user_id) 
            ->update([
                'status' => 'active',
                'business_id' => $business->id
            ]);

        \Log::info("Rreshta të ndryshuar në Users: " . $affected);

        return response()->json([
            'status' => 'success',
            'message' => $affected > 0 ? 'Biznesi u krijua dhe statusi u bë ACTIVE!' : 'Biznesi u krijua por User-i nuk u gjet.',
            'affected_rows' => $affected
        ], 201);

    } catch (\Exception $e) {
        return response()->json(['message' => 'Gabim: ' . $e->getMessage()], 500);
    }
}
    /** 2. BLLOKIMI I BIZNESIT (Kill-Switch OFF) */
    public function deactivateBusiness($id)
{
    if (auth()->user()->role !== 'admin') {
        return response()->json(['message' => 'Pa autorizim.'], 403);
    }

    try {
        $business = Business::findOrFail($id);

        // Kjo bllokon Pronarin DHE të gjithë punonjësit (1 ose 100 qofshin)
        $affected = \Illuminate\Support\Facades\DB::table('users')
            ->where('business_id', $id)
            ->orWhere('id', $business->user_id) // Sigurohemi edhe për pronarin
            ->update(['status' => 'pending']);

        return response()->json([
            'status' => 'success', 
            'message' => "Aksesi u pezullua për $affected përdorues."
        ]);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Gabim: ' . $e->getMessage()], 500);
    }
}

    /** 3. ADMIN: Regjistron pronarin si punonjës */
    public function adminRegisterOwnerAsEmployee(Request $request)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Pa autorizim.'], 403);
        }

        $request->validate(['business_id' => 'required|exists:businesses,id']);
        $business = Business::find($request->business_id);
        $ownerId = $business->user_id;

        $exists = Employees::where('user_id', $ownerId)
            ->where('business_id', $business->id)
            ->exists();

        if ($exists) return response()->json(['message' => 'Pronari është regjistruar tashmë si punonjës.'], 400);

        Employees::create([
            'user_id' => $ownerId,
            'business_id' => $business->id,
        ]);

        return response()->json(['status' => 'success', 'message' => 'Pronari u shtua si punonjës me sukses!'], 201);
    }

    /** 4. GET MY BUSINESS (Për React Dashboard) */
    public function getMyBusiness()
    {
        $business = Business::with(['employees.user:id,name,surname'])
            ->where('user_id', auth()->id())
            ->first();

        if (!$business) return response()->json(['message' => 'Biznesi nuk u gjet'], 404);

        $formattedEmployees = $business->employees->map(function($emp) {
            return [
                'id' => $emp->id,
                'name' => ($emp->user->name ?? 'N/A') . ' ' . ($emp->user->surname ?? '')
            ];
        });

        return response()->json([
            'id' => $business->id,
            'shop_name' => $business->shop_name,
            'employees' => $formattedEmployees
        ]);
    }

    /** 5. GET BUSINESS STAFF (Kill-Switch Protected) */
    public function getBusinessStaff(Request $request)
    {
        $business = Business::where('user_id', $request->user()->id)->first();
        
        if (!$business) return response()->json(['message' => 'Biznesi nuk u gjet'], 404);

        $staff = User::where('business_id', $business->id)
                    ->select('id', 'name', 'email', 'status')
                    ->get();

        return response()->json($staff);
    }

    /** 6. DASHBOARD STATS */
    public function getOwnerDashboard()
    {
        $user = auth()->user();
        $business = Business::where('user_id', $user->id)->first();

        if (!$business) return response()->json(['message' => 'Nuk keni biznes.'], 404);

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $business->id,
                'shop_name' => $business->shop_name,
                'stats' => [
                    'total_employees' => $business->employees()->count(),
                    'total_services' => $business->services()->count(),
                ]
            ]
        ]);
    }

    /** 7. PUBLIC ACTIONS */
    public function index() { return response()->json(Business::latest()->get()); }

    public function getDetailsBySlug($slug)
    {
        $business = Business::with(['employees.user:id,name,surname', 'services'])->where('slug', $slug)->first();
        if (!$business) return response()->json(['message' => 'Jo gjetur'], 404);
        return response()->json(['status' => 'success', 'data' => $this->formatBusinessData($business)], 200);
    }

    public function getCategories() { return response()->json(['status' => 'success', 'data' => Categories::all()]); }

    /** 8. INSERT SERVICES */
    public function InsertServices(Request $request)
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

    /** HELPER FORMAT */
    private function formatBusinessData($business)
    {
        return [
            'id' => $business->id,
            'shop_name' => $business->shop_name,
            'address' => $business->address,
            'barbers' => $business->employees->map(fn($emp) => [
                'id' => $emp->id,
                'name' => ($emp->user->name ?? '') . ' ' . ($emp->user->surname ?? ''),
            ]),
            'services' => $business->services->map(fn($s) => [
                'id' => $s->id,
                'name' => $s->service_name,
                'price' => $s->service_price,
            ]),
        ];
    }

    /** AKTIVIZIMI MASIV (Back to work!) */
public function activateBusiness($id)
{
    try {
        $business = Business::findOrFail($id);

        // Aktivizojmë pronarin dhe gjithë stafin me një goditje
        $affected = \Illuminate\Support\Facades\DB::table('users')
            ->where('business_id', $id)
            ->orWhere('id', $business->user_id)
            ->update(['status' => 'active']);

        return response()->json([
            'status' => 'success',
            'message' => "Biznesi u ri-aktivizua! $affected përdorues janë tani ACTIVE."
        ]);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Gabim: ' . $e->getMessage()], 500);
    }
}
}