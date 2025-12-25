import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Building2, Eye, EyeOff, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Login berhasil!');
      navigate('/');
    } catch (error) {
      const message = error.response?.data?.message || 'Login gagal. Silakan coba lagi.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Demo credentials
  const demoUsers = [
    { email: 'kepala.dinas@pemda.go.id', position: 'Kepala Dinas' },
    { email: 'kepala.bidang1@pemda.go.id', position: 'Kepala Bidang 1' },
    { email: 'kepala.bidang2@pemda.go.id', position: 'Kepala Bidang 2' },
    { email: 'staff1@pemda.go.id', position: 'Staff Bidang 1' },
    { email: 'staff2@pemda.go.id', position: 'Staff Bidang 2' },
  ];

  const fillDemoCredentials = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <Building2 className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-white">Pemerintah Daerah X</h1>
          <p className="text-primary-200 mt-2">Sistem Log Harian Pegawai</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Masuk ke Akun</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="email@pemda.go.id"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Masuk</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-3">Demo Login (password: password123)</p>
            <div className="space-y-2">
              {demoUsers.map((user) => (
                <button
                  key={user.email}
                  type="button"
                  onClick={() => fillDemoCredentials(user.email)}
                  className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="font-medium text-gray-900">{user.position}</span>
                  <span className="text-gray-500 ml-2">({user.email})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
