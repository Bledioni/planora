<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BusinessVisit;
use Illuminate\Http\Request;

class AdminBusinessVisitController extends Controller
{
    public function index()
    {
        $visits = BusinessVisit::orderBy('created_at', 'desc')->get();
        return response()->json($visits);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'business_name' => 'required|string|max:255',
            'address'       => 'nullable|string|max:255',
            'maps_url'      => 'nullable|string',
            'status'        => 'sometimes|in:visited,waiting',
            'notes'         => 'nullable|string',
        ]);

        $visit = BusinessVisit::create($validated);

        return response()->json([
            'message' => 'Vizita u shtua me sukses!',
            'visit'   => $visit
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $visit = BusinessVisit::find($id);

        if (!$visit) {
            return response()->json(['message' => 'Nuk u gjet.'], 404);
        }

        $validated = $request->validate([
            'business_name' => 'sometimes|string|max:255',
            'address'       => 'nullable|string|max:255',
            'maps_url'      => 'nullable|string',
            'status'        => 'sometimes|in:visited,waiting',
            'notes'         => 'nullable|string',
        ]);

        $visit->update($validated);

        return response()->json([
            'message' => 'Vizita u përditësua!',
            'visit'   => $visit
        ]);
    }

    public function destroy($id)
    {
        $visit = BusinessVisit::find($id);

        if (!$visit) {
            return response()->json(['message' => 'Nuk u gjet.'], 404);
        }

        $visit->delete();

        return response()->json(['message' => 'Vizita u fshi me sukses!']);
    }
}