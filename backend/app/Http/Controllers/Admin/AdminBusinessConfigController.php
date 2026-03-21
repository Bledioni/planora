<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\User;
use Illuminate\Http\Request;

class AdminBusinessConfigController extends Controller
{
    public function getBusinessById($id)
{
    $business = Business::with([
        'user:id,name,surname,email,phone_number,status',
        'employees.user:id,name,surname,email,phone_number,status',
        'category:id,name'
    ])->find($id);

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
            'location_link' => 'sometimes|nullable|url',
            'category_id'   => 'sometimes|exists:categories,id',
            'description'   => 'sometimes|nullable|string',
            // Owner fields
            'email'         => 'sometimes|email|unique:users,email,' . $business->user_id,
            'phone_number'  => 'sometimes|string|unique:users,phone_number,' . $business->user_id,
        ]);

        // Update business fields
        $business->update([
            'shop_name'     => $validated['shop_name']     ?? $business->shop_name,
            'address'       => $validated['address']       ?? $business->address,
            'location_link' => $validated['location_link'] ?? $business->location_link,
            'category_id'   => $validated['category_id']   ?? $business->category_id,
            'description'   => $validated['description']   ?? $business->description,
        ]);

        // Update owner email/phone if provided
        if ($business->user_id) {
            $owner = User::find($business->user_id);
            if ($owner) {
                if (isset($validated['email']))        $owner->email        = $validated['email'];
                if (isset($validated['phone_number'])) $owner->phone_number = $validated['phone_number'];
                $owner->save();
            }
        }

        return response()->json([
            'message'  => 'Biznesi u përditësua me sukses!',
            'business' => $business->fresh([
                'user:id,name,surname,email,phone_number,status',
                'employees.user:id,name,surname,email,phone_number,status',
                'category:id,name'
            ])
        ]);
    }
}