<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DailyLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DailyLogController extends Controller
{
    /**
     * Get all daily logs for authenticated user
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = DailyLog::where('user_id', $user->id)
            ->with(['verifier:id,name,position'])
            ->orderBy('log_date', 'desc')
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
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
     * Store a new daily log
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'log_date' => 'required|date',
            'activity' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $log = DailyLog::create([
            'user_id' => $request->user()->id,
            'log_date' => $validated['log_date'],
            'activity' => $validated['activity'],
            'description' => $validated['description'] ?? null,
            'status' => DailyLog::STATUS_PENDING,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Log harian berhasil ditambahkan',
            'data' => $log->load('verifier:id,name,position'),
        ], 201);
    }

    /**
     * Get single daily log
     */
    public function show(Request $request, DailyLog $dailyLog)
    {
        // Check if user owns this log
        if ($dailyLog->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $dailyLog->load('verifier:id,name,position'),
        ]);
    }

    /**
     * Update a daily log
     */
    public function update(Request $request, DailyLog $dailyLog)
    {
        // Check if user owns this log
        if ($dailyLog->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        // Only allow update if status is pending or rejected
        if ($dailyLog->status === DailyLog::STATUS_APPROVED) {
            return response()->json([
                'success' => false,
                'message' => 'Log yang sudah disetujui tidak dapat diubah',
            ], 422);
        }

        $validated = $request->validate([
            'log_date' => 'sometimes|required|date',
            'activity' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
        ]);

        // If updating a rejected log, reset to pending
        if ($dailyLog->status === DailyLog::STATUS_REJECTED) {
            $validated['status'] = DailyLog::STATUS_PENDING;
            $validated['verified_by'] = null;
            $validated['verified_at'] = null;
            $validated['rejection_reason'] = null;
        }

        $dailyLog->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Log harian berhasil diperbarui',
            'data' => $dailyLog->fresh()->load('verifier:id,name,position'),
        ]);
    }

    /**
     * Delete a daily log
     */
    public function destroy(Request $request, DailyLog $dailyLog)
    {
        // Check if user owns this log
        if ($dailyLog->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        // Only allow delete if status is pending or rejected
        if ($dailyLog->status === DailyLog::STATUS_APPROVED) {
            return response()->json([
                'success' => false,
                'message' => 'Log yang sudah disetujui tidak dapat dihapus',
            ], 422);
        }

        $dailyLog->delete();

        return response()->json([
            'success' => true,
            'message' => 'Log harian berhasil dihapus',
        ]);
    }

    /**
     * Get statistics for dashboard
     */
    public function statistics(Request $request)
    {
        $user = $request->user();
        
        $stats = [
            'total' => DailyLog::where('user_id', $user->id)->count(),
            'pending' => DailyLog::where('user_id', $user->id)->pending()->count(),
            'approved' => DailyLog::where('user_id', $user->id)->approved()->count(),
            'rejected' => DailyLog::where('user_id', $user->id)->rejected()->count(),
        ];

        // Get recent logs
        $recentLogs = DailyLog::where('user_id', $user->id)
            ->with('verifier:id,name,position')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'statistics' => $stats,
                'recent_logs' => $recentLogs,
            ],
        ]);
    }
}
