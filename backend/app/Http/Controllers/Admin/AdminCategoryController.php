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

class AdminCategoryController extends Controller
{
    public function createCategory(Request $request): JsonResponse
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

}
