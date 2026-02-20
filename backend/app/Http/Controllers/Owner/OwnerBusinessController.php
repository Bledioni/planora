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

class OwnerBusinessController extends Controller
{
    public function getMyBusiness()
{
    $business = Business::with(['employees.user:id,name,surname', 'services'])
        ->where('user_id', auth()->id())
        ->first();

    if (!$business) {
        return response()->json([
            'status' => 'error',
            'message' => 'Biznesi nuk u gjet'
        ], 404);
    }

    $formattedEmployees = $business->employees->map(function($emp) {
        return [
            'id' => $emp->id,
            'name' => ($emp->user->name ?? 'N/A') . ' ' . ($emp->user->surname ?? '')
        ];
    });

    return response()->json([
        'status' => 'success',
        'business' => [
            'id' => $business->id,
            'name' => $business->name,
            'shop_name' => $business->shop_name,
            'slug' => $business->slug,
            'employees' => $formattedEmployees,
            'services' => $business->services
        ]
    ], 200);
}

}
