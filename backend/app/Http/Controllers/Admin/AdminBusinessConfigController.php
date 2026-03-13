<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Business;
use Illuminate\Http\Request;

class AdminBusinessConfigController extends Controller
{
    public function getBusinessById($id)
    {
        $business = Business::with(['user', 'employees', 'category'])->find($id);

        if (!$business) {
            return response()->json(['message' => 'Biznesi nuk u gjet.'], 404);
        }

        return response()->json($business);
    }

    public function updateBusiness(Request $request, $id)
    {
        $business = Business::find($id);

        if (!$business) {
            return response()->json(['message' => 'Biznesi nuk u gjet.'], 404);
        }

        $validated = $request->validate([
            'shop_name'     => 'sometimes|string|max:255',
            'address'       => 'sometimes|string|max:255',
            'business_type' => 'sometimes|string|max:100',
            'description'   => 'sometimes|string|nullable',
        ]);

        $business->update($validated);

        return response()->json([
            'message'  => 'Biznesi u përditësua me sukses!',
            'business' => $business->fresh(['user', 'employees', 'category'])
        ]);
    }
}