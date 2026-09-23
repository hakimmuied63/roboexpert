import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(email, password);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      if (result.role !== 'admin') {
        toast.error('This account is not an admin account');
        return;
      }

      toast.success('Admin access granted');
      navigate('/admin');
    } catch {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-900/40 via-surface-900 to-surface-900" />

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-surface-800 border border-surface-700 flex items-center justify-center mb-6 shadow-2xl">
            <ShieldAlert className="w-8 h-8 text-primary-500" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Admin Portal</h2>
          <p className="mt-2 text-sm text-surface-400">
            Sign in with your admin credentials
          </p>
        </div>

        <div className="bg-surface-800 rounded-2xl shadow-2xl border border-surface-700 p-8">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              className="shadow-lg shadow-primary-500/20"
            >
              Access Control Panel
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}