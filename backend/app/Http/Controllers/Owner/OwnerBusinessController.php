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

}
