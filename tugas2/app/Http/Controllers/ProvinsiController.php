<?php

namespace App\Http\Controllers;

use App\Models\Provinsi;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class ProvinsiController extends Controller
{
    /**
     * Display a listing of all provinsi.
     * GET /api/provinsi
     */
    public function index(): JsonResponse
    {
        $provinsi = Provinsi::all();

        return response()->json([
            'success' => true,
            'message' => 'Daftar provinsi berhasil diambil',
            'data' => $provinsi
        ], 200);
    }

    /**
     * Store a newly created provinsi in storage.
     * POST /api/provinsi
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'code' => 'required|string|max:10|unique:provinsi,code',
                'name' => 'required|string|max:100',
            ]);

            $provinsi = Provinsi::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Provinsi berhasil ditambahkan',
                'data' => $provinsi
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        }
    }

    /**
     * Display the specified provinsi.
     * GET /api/provinsi/{id}
     */
    public function show(string $id): JsonResponse
    {
        $provinsi = Provinsi::find($id);

        if (!$provinsi) {
            return response()->json([
                'success' => false,
                'message' => 'Provinsi tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail provinsi berhasil diambil',
            'data' => $provinsi
        ], 200);
    }

    /**
     * Update the specified provinsi in storage.
     * PUT /api/provinsi/{id}
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $provinsi = Provinsi::find($id);

        if (!$provinsi) {
            return response()->json([
                'success' => false,
                'message' => 'Provinsi tidak ditemukan'
            ], 404);
        }

        try {
            $validated = $request->validate([
                'code' => 'sometimes|required|string|max:10|unique:provinsi,code,' . $id,
                'name' => 'sometimes|required|string|max:100',
            ]);

            $provinsi->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Provinsi berhasil diupdate',
                'data' => $provinsi
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        }
    }

    /**
     * Remove the specified provinsi from storage.
     * DELETE /api/provinsi/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        $provinsi = Provinsi::find($id);

        if (!$provinsi) {
            return response()->json([
                'success' => false,
                'message' => 'Provinsi tidak ditemukan'
            ], 404);
        }

        $provinsi->delete();

        return response()->json([
            'success' => true,
            'message' => 'Provinsi berhasil dihapus'
        ], 200);
    }
}
