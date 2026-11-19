<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\GlobalService;
use App\Models\Business;
use Illuminate\Http\Request;

class OwnerGlobalServiceController extends Controller
{
    public function index(Request $request)
    {
        // Get the owner's business category
        $business = Business::where('user_id', $request->user()->id)->first();

        if (!$business) {
            return response()->json(['services' => []]);
        }

        // Return only services matching the business category
        $services = GlobalService::with('category')
            ->where('category_id', $business->category_id)
            ->orderBy('name')
            ->get();

        return response()->json(['services' => $services]);
    }
}