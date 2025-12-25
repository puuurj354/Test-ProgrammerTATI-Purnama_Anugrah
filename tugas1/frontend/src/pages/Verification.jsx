import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { verificationApi } from '../api';
import {
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  User,
  AlertCircle,
  CheckSquare,
  X,
  AlertTriangle,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

function StatusBadge({ status }) {
  const config = {
    pending: { class: 'badge-pending', label: 'Pending' },
    approved: { class: 'badge-approved', label: 'Disetujui' },
    rejected: { class: 'badge-rejected', label: 'Ditolak' },
  };

  const { class: badgeClass, label } = config[status] || config.pending;

  return <span className={`badge ${badgeClass}`}>{label}</span>;
}

function RejectModal({ isOpen, onClose, onSubmit, loading }) {
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(reason);
  };

  useEffect(() => {
    if (isOpen) {
      setReason('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Tolak Log</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex items-start space-x-4 mb-4">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-gray-600 text-sm">
              Berikan alasan penolakan agar pegawai dapat memperbaiki log-nya.
            </p>
          </div>
          <div className="mb-4">
            <label htmlFor="reason" className="label">
              Alasan Penolakan
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input min-h-[100px] resize-none"
              placeholder="Contoh: Laporan kurang detail, mohon dilengkapi"
              required
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Batal
            </button>
            <button type="submit" className="btn btn-danger" disabled={loading}>
              {loading ? 'Memproses...' : 'Tolak Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Verification() {
  const { hasSubordinates } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [subordinates, setSubordinates] = useState([]);
  const [selectedSubordinate, setSelectedSubordinate] = useState('all');
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectLogId, setRejectLogId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSubordinates = async () => {
    try {
      const response = await verificationApi.getSubordinates();
      setSubordinates(response.data.data);
    } catch (error) {
      console.error('Error fetching subordinates:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const params = {
        status: filter,
        page,
        per_page: 10,
      };
      if (selectedSubordinate !== 'all') {
        params.user_id = selectedSubordinate;
      }
      const response = await verificationApi.getPendingLogs(params);
      setLogs(response.data.data.data);
      setPagination({
        current_page: response.data.data.current_page,
        last_page: response.data.data.last_page,
        total: response.data.data.total,
      });
    } catch (error) {
      toast.error('Gagal memuat data log');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubordinates();
  }, []);

  useEffect(() => {
    setLoading(true);
    setSelectedLogs([]);
    fetchLogs();
  }, [filter, selectedSubordinate, page]);

  const handleApprove = async (logId) => {
    setActionLoading(true);
    try {
      await verificationApi.approve(logId);
      toast.success('Log berhasil disetujui');
      fetchLogs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyetujui log');
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (logId) => {
    setRejectLogId(logId);
    setRejectModalOpen(true);
  };

  const handleReject = async (reason) => {
    setActionLoading(true);
    try {
      await verificationApi.reject(rejectLogId, { rejection_reason: reason });
      toast.success('Log berhasil ditolak');
      setRejectModalOpen(false);
      setRejectLogId(null);
      fetchLogs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menolak log');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedLogs.length === 0) {
      toast.error('Pilih log yang akan disetujui');
      return;
    }
    setActionLoading(true);
    try {
      await verificationApi.bulkApprove(selectedLogs);
      toast.success(`${selectedLogs.length} log berhasil disetujui`);
      setSelectedLogs([]);
      fetchLogs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyetujui log');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleLogSelection = (logId) => {
    setSelectedLogs((prev) =>
      prev.includes(logId)
        ? prev.filter((id) => id !== logId)
        : [...prev, logId]
    );
  };

  const toggleAllSelection = () => {
    const pendingLogs = logs.filter((log) => log.status === 'pending');
    if (selectedLogs.length === pendingLogs.length) {
      setSelectedLogs([]);
    } else {
      setSelectedLogs(pendingLogs.map((log) => log.id));
    }
  };

  if (!hasSubordinates) {
    return (
      <div className="card text-center py-12">
        <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Tidak Ada Bawahan</h3>
        <p className="text-gray-500 mt-1">
          Anda tidak memiliki bawahan yang perlu diverifikasi log-nya.
        </p>
      </div>
    );
  }

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const pendingLogs = logs.filter((log) => log.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Verifikasi Log</h2>
          <p className="text-gray-500 mt-1">
            Verifikasi log harian pegawai bawahan Anda
          </p>
        </div>
        {selectedLogs.length > 0 && filter === 'pending' && (
          <button
            onClick={handleBulkApprove}
            disabled={actionLoading}
            className="btn btn-success flex items-center space-x-2"
          >
            <CheckSquare className="w-5 h-5" />
            <span>Setujui {selectedLogs.length} Log</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-500">Status:</span>
          {[
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Disetujui' },
            { value: 'rejected', label: 'Ditolak' },
            { value: 'all', label: 'Semua' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setFilter(option.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === option.value
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <User className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-500">Bawahan:</span>
          <select
            value={selectedSubordinate}
            onChange={(e) => {
              setSelectedSubordinate(e.target.value);
              setPage(1);
            }}
            className="input py-1.5 px-3 w-auto"
          >
            <option value="all">Semua Bawahan</option>
            {subordinates.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name} ({sub.position})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card overflow-hidden">
        {logs.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    {filter === 'pending' && (
                      <th className="py-3 px-4 w-12">
                        <input
                          type="checkbox"
                          checked={
                            pendingLogs.length > 0 &&
                            selectedLogs.length === pendingLogs.length
                          }
                          onChange={toggleAllSelection}
                          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </th>
                    )}
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Pegawai
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Tanggal
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Aktivitas
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Status
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 ${
                        selectedLogs.includes(log.id) ? 'bg-primary-50' : ''
                      }`}
                    >
                      {filter === 'pending' && (
                        <td className="py-4 px-4">
                          {log.status === 'pending' && (
                            <input
                              type="checkbox"
                              checked={selectedLogs.includes(log.id)}
                              onChange={() => toggleLogSelection(log.id)}
                              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                          )}
                        </td>
                      )}
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {log.user?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {log.user?.position}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-900">
                        {format(new Date(log.log_date), 'dd MMM yyyy', {
                          locale: id,
                        })}
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-gray-900">{log.activity}</p>
                        {log.description && (
                          <p className="text-sm text-gray-500 mt-1 truncate max-w-xs">
                            {log.description}
                          </p>
                        )}
                        {log.rejection_reason && (
                          <p className="text-sm text-red-500 mt-1">
                            <span className="font-medium">Alasan tolak:</span>{' '}
                            {log.rejection_reason}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={log.status} />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end space-x-2">
                          {log.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(log.id)}
                                disabled={actionLoading}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Setujui"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => openRejectModal(log.id)}
                                disabled={actionLoading}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Tolak"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          {log.status !== 'pending' && (
                            <span className="text-sm text-gray-400">
                              Sudah diverifikasi
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Total {pagination.total} data
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="btn btn-secondary text-sm py-1 px-3 disabled:opacity-50"
                  >
                    Sebelumnya
                  </button>
                  <span className="text-sm text-gray-600">
                    {page} / {pagination.last_page}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.last_page}
                    className="btn btn-secondary text-sm py-1 px-3 disabled:opacity-50"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              {filter === 'pending'
                ? 'Tidak ada log yang menunggu verifikasi'
                : 'Tidak ada log'}
            </h3>
            <p className="text-gray-500 mt-1">
              {filter === 'pending'
                ? 'Semua log bawahan sudah diverifikasi'
                : 'Tidak ada log dengan status ini'}
            </p>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <RejectModal
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setRejectLogId(null);
        }}
        onSubmit={handleReject}
        loading={actionLoading}
      />
    </div>
  );
}
