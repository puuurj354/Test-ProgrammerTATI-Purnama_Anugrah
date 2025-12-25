import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dailyLogApi, verificationApi } from '../api';
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  ArrowRight,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

function StatCard({ title, value, icon: Icon, color, subtext }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    pending: { class: 'badge-pending', label: 'Pending' },
    approved: { class: 'badge-approved', label: 'Disetujui' },
    rejected: { class: 'badge-rejected', label: 'Ditolak' },
  };

  const { class: badgeClass, label } = config[status] || config.pending;

  return <span className={`badge ${badgeClass}`}>{label}</span>;
}

export default function Dashboard() {
  const { user, hasSubordinates } = useAuth();
  const [loading, setLoading] = useState(true);
  const [myStats, setMyStats] = useState(null);
  const [verifyStats, setVerifyStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse] = await Promise.all([dailyLogApi.statistics()]);
        setMyStats(statsResponse.data.data.statistics);
        setRecentLogs(statsResponse.data.data.recent_logs);

        if (hasSubordinates) {
          const verifyResponse = await verificationApi.statistics();
          setVerifyStats(verifyResponse.data.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hasSubordinates]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="card bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Selamat Datang, {user?.name}!</h2>
            <p className="text-primary-100 mt-1">{user?.position}</p>
            <p className="text-primary-200 text-sm mt-2">
              {format(new Date(), "EEEE, dd MMMM yyyy", { locale: id })}
            </p>
          </div>
          <div className="hidden md:block">
            <TrendingUp className="w-16 h-16 text-primary-300" />
          </div>
        </div>
      </div>

      {/* My Statistics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Log Harian Saya</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Log"
            value={myStats?.total || 0}
            icon={FileText}
            color="blue"
          />
          <StatCard
            title="Pending"
            value={myStats?.pending || 0}
            icon={Clock}
            color="yellow"
          />
          <StatCard
            title="Disetujui"
            value={myStats?.approved || 0}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="Ditolak"
            value={myStats?.rejected || 0}
            icon={XCircle}
            color="red"
          />
        </div>
      </div>

      {/* Verification Statistics (for supervisors) */}
      {hasSubordinates && verifyStats && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Menunggu Verifikasi Anda
            </h3>
            <Link
              to="/verification"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
            >
              Lihat Semua
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Total Bawahan"
              value={verifyStats.statistics?.total_subordinates || 0}
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Menunggu Verifikasi"
              value={verifyStats.statistics?.pending || 0}
              icon={Clock}
              color="yellow"
              subtext="Perlu tindakan"
            />
            <StatCard
              title="Sudah Diverifikasi"
              value={
                (verifyStats.statistics?.approved || 0) +
                (verifyStats.statistics?.rejected || 0)
              }
              icon={CheckCircle}
              color="green"
            />
          </div>

          {/* Pending by Subordinate */}
          {verifyStats.pending_by_subordinate?.length > 0 && (
            <div className="mt-4 card">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Pending per Bawahan
              </h4>
              <div className="space-y-2">
                {verifyStats.pending_by_subordinate.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{sub.name}</p>
                      <p className="text-sm text-gray-500">{sub.position}</p>
                    </div>
                    {sub.pending_count > 0 ? (
                      <span className="badge badge-pending">
                        {sub.pending_count} pending
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">Tidak ada pending</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Logs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Log Terbaru</h3>
          <Link
            to="/daily-logs"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
          >
            Lihat Semua
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="card">
          {recentLogs.length > 0 ? (
            <div className="space-y-4">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <p className="font-medium text-gray-900">{log.activity}</p>
                      <StatusBadge status={log.status} />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {format(new Date(log.log_date), 'dd MMMM yyyy', { locale: id })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Belum ada log harian. Mulai tambahkan log pertama Anda!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
