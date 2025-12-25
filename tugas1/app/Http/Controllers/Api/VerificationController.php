<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DailyLog;
use App\Models\User;
use Illuminate\Http\Request;

class VerificationController extends Controller
{
    /**
     * Get all subordinates of authenticated user
     */
    public function subordinates(Request $request)
    {
        $user = $request->user();
        
        $subordinates = User::where('supervisor_id', $user->id)
            ->withCount([
                'dailyLogs as total_logs',
                'dailyLogs as pending_logs' => function ($query) {
                    $query->where('status', DailyLog::STATUS_PENDING);
                },
            ])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $subordinates,
        ]);
    }

    /**
     * Get pending logs from subordinates for verification
     */
    public function pendingLogs(Request $request)
    {
        $user = $request->user();
        
        // Get direct subordinate IDs
        $subordinateIds = User::where('supervisor_id', $user->id)->pluck('id');

        if ($subordinateIds->isEmpty()) {
            return response()->json([
                'success' => true,
                'data' => [],
                'message' => 'Tidak ada bawahan',
            ]);
        }

        $query = DailyLog::whereIn('user_id', $subordinateIds)
            ->with(['user:id,name,position'])
            ->orderBy('log_date', 'desc')
            ->orderBy('created_at', 'desc');

        // Filter by status (default to pending)
        $status = $request->get('status', 'pending');
        if ($status !== 'all') {
            $query->where('status', $status);
        }

        // Filter by subordinate
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->whereDate('log_date', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->whereDate('log_date', '<=', $request->end_date);
        }

        $logs = $query->paginate($request->get('per_page', 10));

        return response()->json([
            'success' => true,
            'data' => $logs,
        ]);
    }

    /**
     * Approve a daily log
     */
    public function approve(Request $request, DailyLog $dailyLog)
    {
        $user = $request->user();
        
        // Check if the log belongs to a subordinate
        $logOwner = User::find($dailyLog->user_id);
        if (!$logOwner || $logOwner->supervisor_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak berwenang untuk menyetujui log ini',
            ], 403);
        }

        // Check if log is still pending
        if ($dailyLog->status !== DailyLog::STATUS_PENDING) {
            return response()->json([
                'success' => false,
                'message' => 'Log ini sudah diverifikasi sebelumnya',
            ], 422);
        }

        $dailyLog->update([
            'status' => DailyLog::STATUS_APPROVED,
            'verified_by' => $user->id,
            'verified_at' => now(),
            'rejection_reason' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Log harian berhasil disetujui',
            'data' => $dailyLog->fresh()->load(['user:id,name,position', 'verifier:id,name,position']),
        ]);
    }

    /**
     * Reject a daily log
     */
    public function reject(Request $request, DailyLog $dailyLog)
    {
        $user = $request->user();
        
        // Check if the log belongs to a subordinate
        $logOwner = User::find($dailyLog->user_id);
        if (!$logOwner || $logOwner->supervisor_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak berwenang untuk menolak log ini',
            ], 403);
        }

        // Check if log is still pending
        if ($dailyLog->status !== DailyLog::STATUS_PENDING) {
            return response()->json([
                'success' => false,
                'message' => 'Log ini sudah diverifikasi sebelumnya',
            ], 422);
        }

        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        $dailyLog->update([
            'status' => DailyLog::STATUS_REJECTED,
            'verified_by' => $user->id,
            'verified_at' => now(),
            'rejection_reason' => $validated['rejection_reason'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Log harian berhasil ditolak',
            'data' => $dailyLog->fresh()->load(['user:id,name,position', 'verifier:id,name,position']),
        ]);
    }

    /**
     * Bulk approve multiple logs
     */
    public function bulkApprove(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'log_ids' => 'required|array|min:1',
            'log_ids.*' => 'exists:daily_logs,id',
        ]);

        // Get direct subordinate IDs
        $subordinateIds = User::where('supervisor_id', $user->id)->pluck('id');

        $approvedCount = DailyLog::whereIn('id', $validated['log_ids'])
            ->whereIn('user_id', $subordinateIds)
            ->where('status', DailyLog::STATUS_PENDING)
            ->update([
                'status' => DailyLog::STATUS_APPROVED,
                'verified_by' => $user->id,
                'verified_at' => now(),
            ]);

        return response()->json([
            'success' => true,
            'message' => "{$approvedCount} log harian berhasil disetujui",
        ]);
    }

    /**
     * Get verification statistics
     */
    public function statistics(Request $request)
    {
        $user = $request->user();
        
        // Get direct subordinate IDs
        $subordinateIds = User::where('supervisor_id', $user->id)->pluck('id');

        $stats = [
            'total_subordinates' => $subordinateIds->count(),
            'pending' => DailyLog::whereIn('user_id', $subordinateIds)->pending()->count(),
            'approved' => DailyLog::whereIn('user_id', $subordinateIds)->approved()->count(),
            'rejected' => DailyLog::whereIn('user_id', $subordinateIds)->rejected()->count(),
            'total' => DailyLog::whereIn('user_id', $subordinateIds)->count(),
        ];

        // Get pending logs by subordinate
        $pendingBySubordinate = User::where('supervisor_id', $user->id)
            ->withCount([
                'dailyLogs as pending_count' => function ($query) {
                    $query->where('status', DailyLog::STATUS_PENDING);
                },
            ])
            ->get(['id', 'name', 'position'])
            ->map(function ($sub) {
                return [
                    'id' => $sub->id,
                    'name' => $sub->name,
                    'position' => $sub->position,
                    'pending_count' => $sub->pending_count,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'statistics' => $stats,
                'pending_by_subordinate' => $pendingBySubordinate,
            ],
        ]);
    }
}
