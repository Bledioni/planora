<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Business;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str; // Added for slug generation


class StoreBusinessController extends Controller
{
    
    public function __construct()
    {
        // Public access for browsing; Owner access for management
        $this->middleware(['auth:sanctum', 'role:admin'])
             ->only(['StoreBusiness']);
    }

     public function StoreBusiness(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'category_id' => 'required|exists:categories,id',
            'shop_name' => 'required|string|max:255|unique:businesses,shop_name',
            'address' => 'required|string|max:255',
            'business_type' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'validation_error', 'errors' => $validator->errors()], 422);
        }

        try {
            $data = $request->all();
            // Automatically generate the slug (e.g. "Te Visi" becomes "te-visi")
            $data['slug'] = Str::slug($request->shop_name);

            $shop = Business::create($data);

            return response()->json([
                'status' => 'success',
                'message' => 'Biznesi u krijua me sukses',
                'data' => $shop
            ], 201);

        } catch (QueryException $e) {
            if ($e->errorInfo[1] === 1062) {
                return response()->json(['message' => 'Ky emër i biznesit ose slug ekziston.'], 409);
            }
            return response()->json(['message' => 'Gabim në databazë.'], 500);
        }
    }


}