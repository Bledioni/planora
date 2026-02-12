<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Business;
use Illuminate\Http\Request;

class AdminBusinessController extends Controller
{

    public function __construct()
    {
        // Sigurohemi që middleware janë aktivë
        $this->middleware(['auth:sanctum', 'role:admin']);

    }
    /**
     * Merr të gjitha bizneset për panelin e adminit.
     */
    public function GetBusinesses()
    {
        try {
            // Marrim të dhënat që i duhen React-it
            $businesses = Business::select('id', 'shop_name', 'address', 'business_type')
                ->latest()
                ->get();

            return response()->json($businesses, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gabim gjatë marrjes së bizneseve',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
 * Merr të gjithë përdoruesit që janë Pronarë Biznesi.
 */
// Provo ta bësh kështu që të jesh i sigurt
public function GetBusinessOwners() 
{
    try {
        // Kjo merr të gjithë përdoruesit që kanë një regjistrim në tabelën businesses
        $owners = \App\Models\User::has('business')
            ->with('business')
            ->latest()
            ->get();


        return response()->json($owners);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}
}