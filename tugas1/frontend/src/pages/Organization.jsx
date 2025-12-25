import { useState, useEffect } from 'react';
import { employeeApi } from '../api';
import { Users, ChevronDown, ChevronRight, User } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

function OrgTreeNode({ node, level = 0 }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  const colors = [
    'bg-primary-600',
    'bg-green-600',
    'bg-yellow-600',
    'bg-purple-600',
    'bg-red-600',
  ];
  const bgColor = colors[level % colors.length];

  return (
    <div className={`${level > 0 ? 'ml-8' : ''}`}>
      <div
        className={`flex items-center space-x-3 p-4 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${
          level === 0 ? 'border-primary-200 bg-primary-50' : ''
        }`}
      >
        <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0`}>
          <User className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">{node.name}</h4>
          <p className="text-sm text-gray-500 truncate">{node.position}</p>
          <p className="text-xs text-gray-400 truncate">{node.email}</p>
        </div>
        {hasChildren && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            {expanded ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
          </button>
        )}
      </div>

      {hasChildren && expanded && (
        <div className="relative mt-4 space-y-4">
          {/* Connecting line */}
          <div className="absolute left-5 top-0 bottom-4 w-0.5 bg-gray-200" />
          
          {node.children.map((child, index) => (
            <div key={child.id} className="relative">
              {/* Horizontal connector */}
              <div className="absolute left-5 top-7 w-3 h-0.5 bg-gray-200" />
              <OrgTreeNode node={child} level={level + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OrgChart({ data }) {
  if (!data) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Tidak ada data</h3>
        <p className="text-gray-500 mt-1">
          Struktur organisasi belum tersedia
        </p>
      </div>
    );
  }

  return <OrgTreeNode node={data} />;
}

function EmployeeCard({ employee }) {
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
          <User className="w-6 h-6 text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900">{employee.name}</h4>
          <p className="text-sm text-gray-500">{employee.position}</p>
          <p className="text-xs text-gray-400 mt-1">{employee.email}</p>
          
          {employee.supervisor && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Atasan: <span className="font-medium text-gray-700">{employee.supervisor.name}</span>
              </p>
            </div>
          )}
          
          {employee.subordinates_count > 0 && (
            <p className="text-xs text-primary-600 mt-2">
              {employee.subordinates_count} bawahan langsung
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Organization() {
  const [loading, setLoading] = useState(true);
  const [orgData, setOrgData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'list'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orgResponse, employeesResponse] = await Promise.all([
          employeeApi.getOrganization(),
          employeeApi.getAll(),
        ]);
        setOrgData(orgResponse.data.data);
        setEmployees(employeesResponse.data.data);
      } catch (error) {
        console.error('Error fetching organization data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
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
          <h2 className="text-2xl font-bold text-gray-900">Struktur Organisasi</h2>
          <p className="text-gray-500 mt-1">
            Lihat hierarki kepegawaian Pemerintah Daerah X
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('tree')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'tree'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Hierarki
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Daftar
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'tree' ? (
        <div className="card">
          <OrgChart data={orgData} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((employee) => (
            <EmployeeCard key={employee.id} employee={employee} />
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Keterangan Struktur</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-primary-600" />
            <span className="text-sm text-gray-600">Kepala Dinas</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-green-600" />
            <span className="text-sm text-gray-600">Kepala Bidang</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-yellow-600" />
            <span className="text-sm text-gray-600">Staff</span>
          </div>
        </div>
      </div>
    </div>
  );
}
