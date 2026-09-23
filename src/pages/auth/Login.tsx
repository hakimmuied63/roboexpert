import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Store, Briefcase } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      if (result.role !== 'seller') {
        toast.error('This account is not a seller account');
        return;
      }

      toast.success(`Welcome back, ${result.user.name}!`);

      // Redirect to intended page or seller home
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else {
        navigate('/seller');
      }
    } catch {
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-surface-900">
              roboexpert<span className="text-primary-600">.in</span>
            </span>
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium mb-3">
            <Briefcase className="w-4 h-4" />
            Seller Login
          </div>
          <h2 className="text-3xl font-bold text-surface-900">Sign in to your shop</h2>
          <p className="mt-2 text-sm text-surface-500">
            Manage your products, orders, and payments
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-surface-200 overflow-hidden">
          <div className="p-8">
            <form className="space-y-6" onSubmit={handleLogin}>
              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />

              <Button type="submit" fullWidth size="lg" loading={loading}>
                Sign in
              </Button>
            </form>
          </div>

          <div className="px-8 py-6 bg-surface-50 border-t border-surface-200 text-center text-sm">
            <span className="text-surface-500">Don't have a seller account? </span>
            <Link to="/seller/signup" className="font-medium text-primary-600 hover:text-primary-500">
              Register as a Seller
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-surface-400">
          Are you an admin?{' '}
          <Link to="/admin/login" className="text-primary-600 hover:text-primary-500 font-medium">
            Admin login
          </Link>
        </p>
      </div>
    </div>
  );
}