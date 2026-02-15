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

class OwnerStaffController extends Controller
{
    public function getMyStaff(Request $request)
    {
        $business = Business::where('user_id', $request->user()->id)->first();
        
        if (!$business) return response()->json(['message' => 'Biznesi nuk u gjet'], 404);

        $staff = User::where('business_id', $business->id)
                    ->select('id', 'name', 'email', 'status')
                    ->get();

        return response()->json($staff);
    }
}
