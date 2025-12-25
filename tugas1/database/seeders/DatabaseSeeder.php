<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\DailyLog;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Kepala Dinas (Top Level - No Supervisor)
        $kepalaDinas = User::create([
            'name' => 'Budi Santoso',
            'email' => 'kepala.dinas@pemda.go.id',
            'password' => Hash::make('password123'),
            'position' => 'Kepala Dinas',
            'supervisor_id' => null,
        ]);

        // Create Kepala Bidang 1 (Reports to Kepala Dinas)
        $kepalaBidang1 = User::create([
            'name' => 'Ahmad Wijaya',
            'email' => 'kepala.bidang1@pemda.go.id',
            'password' => Hash::make('password123'),
            'position' => 'Kepala Bidang 1',
            'supervisor_id' => $kepalaDinas->id,
        ]);

        // Create Kepala Bidang 2 (Reports to Kepala Dinas)
        $kepalaBidang2 = User::create([
            'name' => 'Siti Rahayu',
            'email' => 'kepala.bidang2@pemda.go.id',
            'password' => Hash::make('password123'),
            'position' => 'Kepala Bidang 2',
            'supervisor_id' => $kepalaDinas->id,
        ]);

        // Create Staff 1 (Reports to Kepala Bidang 1)
        $staff1 = User::create([
            'name' => 'Dedi Kurniawan',
            'email' => 'staff1@pemda.go.id',
            'password' => Hash::make('password123'),
            'position' => 'Staff Bidang 1',
            'supervisor_id' => $kepalaBidang1->id,
        ]);

        // Create Staff 2 (Reports to Kepala Bidang 2)
        $staff2 = User::create([
            'name' => 'Rina Permata',
            'email' => 'staff2@pemda.go.id',
            'password' => Hash::make('password123'),
            'position' => 'Staff Bidang 2',
            'supervisor_id' => $kepalaBidang2->id,
        ]);

        // Create sample daily logs for demonstration
        $this->createSampleLogs($kepalaBidang1, $kepalaDinas);
        $this->createSampleLogs($kepalaBidang2, $kepalaDinas);
        $this->createSampleLogs($staff1, $kepalaBidang1);
        $this->createSampleLogs($staff2, $kepalaBidang2);

        $this->command->info('Database seeded successfully!');
        $this->command->info('');
        $this->command->info('Login Credentials:');
        $this->command->info('================================');
        $this->command->info('Kepala Dinas: kepala.dinas@pemda.go.id / password123');
        $this->command->info('Kepala Bidang 1: kepala.bidang1@pemda.go.id / password123');
        $this->command->info('Kepala Bidang 2: kepala.bidang2@pemda.go.id / password123');
        $this->command->info('Staff 1: staff1@pemda.go.id / password123');
        $this->command->info('Staff 2: staff2@pemda.go.id / password123');
    }

    /**
     * Create sample daily logs for a user
     */
    private function createSampleLogs(User $user, User $supervisor): void
    {
        $activities = [
            'Menyusun laporan bulanan',
            'Rapat koordinasi',
            'Review dokumen',
            'Membuat surat dinas',
            'Koordinasi dengan stakeholder',
            'Penginputan data',
            'Monitoring program',
            'Evaluasi kinerja',
        ];

        // Create logs for the past 7 days
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $activity = $activities[array_rand($activities)];
            
            // Random status distribution
            $rand = rand(1, 10);
            if ($rand <= 3) {
                $status = DailyLog::STATUS_PENDING;
                $verifiedBy = null;
                $verifiedAt = null;
                $rejectionReason = null;
            } elseif ($rand <= 8) {
                $status = DailyLog::STATUS_APPROVED;
                $verifiedBy = $supervisor->id;
                $verifiedAt = now()->subDays($i)->addHours(rand(1, 8));
                $rejectionReason = null;
            } else {
                $status = DailyLog::STATUS_REJECTED;
                $verifiedBy = $supervisor->id;
                $verifiedAt = now()->subDays($i)->addHours(rand(1, 8));
                $rejectionReason = 'Laporan kurang detail, mohon dilengkapi';
            }

            DailyLog::create([
                'user_id' => $user->id,
                'log_date' => $date,
                'activity' => $activity,
                'description' => "Melaksanakan kegiatan {$activity} untuk mendukung program kerja dinas.",
                'status' => $status,
                'verified_by' => $verifiedBy,
                'verified_at' => $verifiedAt,
                'rejection_reason' => $rejectionReason,
            ]);
        }
    }
}
