import { useState, useEffect } from 'react';
import { dailyLogApi } from '../api';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  X,
  Calendar,
  FileText,
  AlertCircle,
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

function LogModal({ isOpen, onClose, onSubmit, editData }) {
  const [formData, setFormData] = useState({
    log_date: format(new Date(), 'yyyy-MM-dd'),
    activity: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      setFormData({
        log_date: editData.log_date?.split('T')[0] || format(new Date(), 'yyyy-MM-dd'),
        activity: editData.activity || '',
        description: editData.description || '',
      });
    } else {
      setFormData({
        log_date: format(new Date(), 'yyyy-MM-dd'),
        activity: '',
        description: '',
      });
    }
  }, [editData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting log:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {editData ? 'Edit Log Harian' : 'Tambah Log Harian'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="log_date" className="label">
              Tanggal
            </label>
            <input
              id="log_date"
              type="date"
              value={formData.log_date}
              onChange={(e) =>
                setFormData({ ...formData, log_date: e.target.value })
              }
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="activity" className="label">
              Aktivitas
            </label>
            <input
              id="activity"
              type="text"
              value={formData.activity}
              onChange={(e) =>
                setFormData({ ...formData, activity: e.target.value })
              }
              className="input"
              placeholder="Contoh: Rapat koordinasi, Review dokumen, dll"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="label">
              Deskripsi (opsional)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="input min-h-[100px] resize-none"
              placeholder="Jelaskan detail aktivitas yang dilakukan..."
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Batal
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : editData ? (
                'Simpan Perubahan'
              ) : (
                'Tambah Log'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({ isOpen, onClose, onConfirm, loading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Hapus Log</h3>
            <p className="text-gray-500 mt-1">
              Apakah Anda yakin ingin menghapus log ini? Tindakan ini tidak dapat
              dibatalkan.
            </p>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="btn btn-secondary"
            disabled={loading}
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="btn btn-danger"
            disabled={loading}
          >
            {loading ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DailyLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  const fetchLogs = async () => {
    try {
      const response = await dailyLogApi.getAll({
        status: filter,
        page,
        per_page: 10,
      });
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
    setLoading(true);
    fetchLogs();
  }, [filter, page]);

  const handleCreate = async (data) => {
    try {
      await dailyLogApi.create(data);
      toast.success('Log harian berhasil ditambahkan');
      fetchLogs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menambahkan log');
      throw error;
    }
  };

  const handleUpdate = async (data) => {
    try {
      await dailyLogApi.update(editData.id, data);
      toast.success('Log harian berhasil diperbarui');
      fetchLogs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui log');
      throw error;
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await dailyLogApi.delete(deleteId);
      toast.success('Log harian berhasil dihapus');
      setDeleteModalOpen(false);
      setDeleteId(null);
      fetchLogs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menghapus log');
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEditModal = (log) => {
    setEditData(log);
    setModalOpen(true);
  };

  const openDeleteModal = (id) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditData(null);
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Log Harian</h2>
          <p className="text-gray-500 mt-1">Kelola log aktivitas harian Anda</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Tambah Log</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-500">Filter:</span>
          {[
            { value: 'all', label: 'Semua' },
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Disetujui' },
            { value: 'rejected', label: 'Ditolak' },
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
      </div>

      {/* Logs Table */}
      <div className="card overflow-hidden">
        {logs.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Tanggal
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Aktivitas
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Verifikator
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
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">
                            {format(new Date(log.log_date), 'dd MMM yyyy', {
                              locale: id,
                            })}
                          </span>
                        </div>
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
                            Alasan: {log.rejection_reason}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={log.status} />
                      </td>
                      <td className="py-4 px-4">
                        {log.verifier ? (
                          <div>
                            <p className="text-gray-900">{log.verifier.name}</p>
                            <p className="text-sm text-gray-500">
                              {log.verifier.position}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end space-x-2">
                          {log.status !== 'approved' && (
                            <>
                              <button
                                onClick={() => openEditModal(log)}
                                className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openDeleteModal(log.id)}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {log.status === 'approved' && (
                            <span className="text-sm text-gray-400">
                              Terkunci
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
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              Belum ada log harian
            </h3>
            <p className="text-gray-500 mt-1">
              Klik tombol "Tambah Log" untuk membuat log pertama Anda
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <LogModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={editData ? handleUpdate : handleCreate}
        editData={editData}
      />

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteId(null);
        }}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
