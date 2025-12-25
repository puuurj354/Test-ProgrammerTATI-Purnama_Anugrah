<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login user and create token
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Kredensial yang diberikan tidak sesuai.'],
            ]);
        }

        // Revoke previous tokens
        $user->tokens()->delete();

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'position' => $user->position,
                    'supervisor_id' => $user->supervisor_id,
                    'has_subordinates' => $user->hasSubordinates(),
                ],
                'token' => $token,
            ],
        ]);
    }

    /**
     * Get authenticated user info
     */
    public function me(Request $request)
    {
        $user = $request->user();
        $user->load(['supervisor:id,name,position', 'subordinates:id,name,position,supervisor_id']);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'position' => $user->position,
                'supervisor' => $user->supervisor,
                'subordinates' => $user->subordinates,
                'has_subordinates' => $user->hasSubordinates(),
            ],
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil',
        ]);
    }
}
