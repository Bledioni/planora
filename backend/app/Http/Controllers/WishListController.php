<?php

namespace App\Http\Controllers;

use App\Models\WishList;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;
use Exception;
use Illuminate\Support\Facades\Hash;


class WishListController extends Controller
{
    public function WishListRegister(Request $request)
    {
        try {
            // ✅ Validate request data
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'surname'  => 'required|string|max:20',
                'email_address' => 'required|email|max:255|unique:wish_lists,email_address',
                'password' => 'required|min:8|max:255|',
                'phone_number' => 'required|unique:wish_lists,phone_number',
            ]);


            $wishlist = WishList::create([
                'name' => $validated['name'],
                'surname'  => $validated['surname'],
                'email_address' => $validated['email_address'],
                'password' => Hash::make($validated['password']),
                'phone_number' => $validated['phone_number'],

            ]);

            return response()->json([
                'status'  => 'success',
                'message' => 'Wishlist registered successfully.',
                'data'    => $wishlist
            ], Response::HTTP_CREATED); // 201

        } catch (ValidationException $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Validation failed.',
                'errors'  => $e->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY); // 422

        } catch (Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Something went wrong.',
                'debug'   => config('app.debug') ? $e->getMessage() : null
            ], Response::HTTP_INTERNAL_SERVER_ERROR); // 500
        }
    }
}
