<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    /**
     * Get organization structure
     */
    public function organizationStructure()
    {
        // Get the root (Kepala Dinas - user without supervisor)
        $root = User::whereNull('supervisor_id')
            ->with(['subordinates' => function ($query) {
                $query->with(['subordinates' => function ($q) {
                    $q->with('subordinates');
                }]);
            }])
            ->first();

        if (!$root) {
            return response()->json([
                'success' => true,
                'data' => null,
                'message' => 'Tidak ada struktur organisasi',
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $this->buildTree($root),
        ]);
    }

    /**
     * Build tree structure recursively
     */
    private function buildTree(User $user): array
    {
        $data = [
            'id' => $user->id,
            'name' => $user->name,
            'position' => $user->position,
            'email' => $user->email,
            'children' => [],
        ];

        foreach ($user->subordinates as $subordinate) {
            $data['children'][] = $this->buildTree($subordinate);
        }

        return $data;
    }

    /**
     * Get all employees list
     */
    public function index(Request $request)
    {
        $query = User::with(['supervisor:id,name,position'])
            ->withCount('subordinates');

        // Search by name or email
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('position', 'like', "%{$search}%");
            });
        }

        $employees = $query->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => $employees,
        ]);
    }

    /**
     * Get single employee details
     */
    public function show(User $user)
    {
        $user->load([
            'supervisor:id,name,position',
            'subordinates:id,name,position,supervisor_id',
        ]);

        return response()->json([
            'success' => true,
            'data' => $user,
        ]);
    }
}
