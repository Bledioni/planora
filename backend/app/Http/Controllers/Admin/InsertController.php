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

class InsertController extends Controller
{
    public function __construct()
    {
        // Sigurohemi që middleware janë aktivë
        $this->middleware(['auth:sanctum', 'role:admin']);
        
        // Shtohet Rate Limiting: Vetëm 60 kërkesa në minutë për këto veprime admini
        $this->middleware('throttle:60,1');
    }

    /**
     * Shto Kategoritë me validim të rreptë
     */
    public function InsertCategory(Request $request): JsonResponse
    {
        // Përdorim 'strip_tags' për të parandaluar sulmet XSS nëse emri shfaqet diku në frontend
        $input = $request->all();
        if ($request->has('name')) {
            $input['name'] = strip_tags($request->name);
        }

        $validator = Validator::make($input, [
            'name' => 'required|string|min:2|max:50|unique:categories,name',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => Response::HTTP_UNPROCESSABLE_ENTITY,
                'error' => 'Validimi dështoi',
                'messages' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $record = Categories::create([
                'name' => trim($input['name']),
            ]);

            return response()->json([
                'status' => Response::HTTP_CREATED,
                'message' => 'Kategoria u krijua me sukses.',
                'data' => $record
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            Log::critical("Security/DB Error: Admin Category Insertion: " . $e->getMessage(), [
                'admin_id' => auth()->id(),
                'ip' => request()->ip()
            ]);

            return response()->json([
                'status' => Response::HTTP_INTERNAL_SERVER_ERROR,
                'error' => 'Gabim i brendshëm',
                'message' => 'Ruajtja e të dhënave dështoi.'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Merr përdoruesit pa biznes - I mbrojtur nga Data Leaks
     */
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

    
}