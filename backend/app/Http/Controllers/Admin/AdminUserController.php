<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB; 
use App\Models\Categories;
use App\Models\User;
use Symfony\Component\HttpFoundation\Response;

class AdminUserController extends Controller
{
     public function getUsersWithoutBusiness(): JsonResponse
    {
        try {
            // Përdorim Query Builder në mënyrë të optimizuar
            $alreadyHasBusiness = DB::table('businesses')->pluck('user_id');

            // Marrim vetëm fushat e nevojshme, kurrë fjalëkalimet ose tokens
            $users = User::where('role', 'business_owner')
                ->whereNotIn('id', $alreadyHasBusiness)
                ->select(['id', 'name', 'surname', 'email', 'phone_number', 'created_at'])
                ->get();

            return response()->json([
                'status' => 'success',
                'count' => $users->count(),
                'data' => $users
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            // Nuk ia kthejmë gabimin e plotë SQL përdoruesit (për siguri)
            Log::error("Security/DB Error: GetUsersWithoutBusiness: " . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Shërbimi nuk mund të procesojë kërkesën momentalisht.'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

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
