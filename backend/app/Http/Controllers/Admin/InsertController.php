<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use App\Models\Categories;

class InsertController extends Controller
{
    
    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'role:admin']);
    }

    public function InsertCategory(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:categories,name',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 422,
                'error' => 'Validation Failed',
                'messages' => $validator->errors()
            ], 422);
        }

        try {
            $record = Categories::create([
                'name' => $request->name,
            ]);

            // 201 Created
            return response()->json([
                'status' => 201,
                'message' => 'Category created successfully by Admin',
                'data' => $record
            ], 201);

        } catch (\Exception $e) {
            // 500 Internal Server Error
            Log::error("Admin Category Insertion Error: " . $e->getMessage());

            return response()->json([
                'status' => 500,
                'error' => 'Internal Server Error',
                'message' => 'Could not save data to the database.',
                'debug' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}