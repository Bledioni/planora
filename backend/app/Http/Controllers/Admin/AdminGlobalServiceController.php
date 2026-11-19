<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GlobalService;
use App\Models\Categories;
use Illuminate\Http\Request;

class AdminGlobalServiceController extends Controller
{
    public function index()
    {
        $services = GlobalService::with('category')->orderBy('name')->get();
        $categories = Categories::orderBy('name')->get();

        return response()->json([
            'services'   => $services,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'price'       => 'nullable|numeric|min:0',
            'duration'    => 'nullable|integer|min:1',
            'category_id' => 'nullable|exists:categories,id',
        ]);

        $service = GlobalService::create($request->only('name', 'description', 'price', 'duration', 'category_id'));
        $service->load('category');

        return response()->json(['status' => 'success', 'service' => $service], 201);
    }

    public function destroy($id)
    {
        GlobalService::findOrFail($id)->delete();
        return response()->json(['status' => 'success', 'message' => 'Service deleted.']);
    }
}