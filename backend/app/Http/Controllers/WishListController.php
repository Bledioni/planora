<?php

namespace App\Http\Controllers;

use App\Models\WishList;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;
use Exception;

class WishListController extends Controller
{
    public function WishListRegister(Request $request)
    {
        try {
            // ✅ Validate request data
            $validated = $request->validate([
                'business_name' => 'required|string|max:255',
                'phone_number'  => 'required|string|max:20',
                'email_address' => 'required|email|max:255|unique:wish_lists,email_address',
            ]);

            // ✅ Create wishlist record
            $wishlist = WishList::create([
                'business_name' => $validated['business_name'],
                'phone_number'  => $validated['phone_number'],
                'email_address' => $validated['email_address'],
            ]);

            // ✅ Success response
            return response()->json([
                'status'  => 'success',
                'message' => 'Wishlist registered successfully.',
                'data'    => $wishlist
            ], Response::HTTP_CREATED); // 201

        } catch (ValidationException $e) {
            // ❌ Validation error
            return response()->json([
                'status'  => 'error',
                'message' => 'Validation failed.',
                'errors'  => $e->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY); // 422

        } catch (Exception $e) {
            // ❌ Server error
            return response()->json([
                'status'  => 'error',
                'message' => 'Something went wrong.',
                'debug'   => config('app.debug') ? $e->getMessage() : null
            ], Response::HTTP_INTERNAL_SERVER_ERROR); // 500
        }
    }
}
