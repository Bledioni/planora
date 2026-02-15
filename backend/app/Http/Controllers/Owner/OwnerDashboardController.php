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

class OwnerDashboardController extends Controller
{
    public function getDashboardStats()
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
}
