import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Store, User, Briefcase } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../mocks/services';
import toast from 'react-hot-toast';

export function Login() {
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
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
      const user = await authService.login(email, password, role);
      if (user) {
        login(user);
        toast.success(`Welcome back, ${user.name}!`);
        
        // Redirect to intended page or role home
        const from = (location.state as any)?.from?.pathname;
        if (from) {
          navigate(from, { replace: true });
        } else {
          navigate(role === 'seller' ? '/seller' : '/');
        }
      } else {
        toast.error('Invalid credentials or wrong role selected');
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
          <h2 className="text-3xl font-bold text-surface-900">Sign in to your account</h2>
          <p className="mt-2 text-sm text-surface-500">
            Use <span className="font-medium text-surface-700">rahul@example.com</span> for Buyer,<br />
            or <span className="font-medium text-surface-700">techzone@example.com</span> for Seller
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-surface-200 overflow-hidden">
          {/* Role Tabs */}
          <div className="flex border-b border-surface-200">
            <button
              onClick={() => setRole('buyer')}
              className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                role === 'buyer'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50'
                  : 'text-surface-500 hover:text-surface-700 hover:bg-surface-50'
              }`}
            >
              <User className="w-4 h-4" /> Buyer
            </button>
            <button
              onClick={() => setRole('seller')}
              className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                role === 'seller'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50'
                  : 'text-surface-500 hover:text-surface-700 hover:bg-surface-50'
              }`}
            >
              <Briefcase className="w-4 h-4" /> Seller
            </button>
          </div>

          <div className="p-8">
            <form className="space-y-6" onSubmit={handleLogin}>
              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-surface-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-surface-700">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                    Forgot your password?
                  </a>
                </div>
              </div>

              <Button type="submit" fullWidth size="lg" loading={loading}>
                Sign in
              </Button>
            </form>
          </div>
          
          <div className="px-8 py-6 bg-surface-50 border-t border-surface-200 text-center text-sm">
            <span className="text-surface-500">Don't have an account? </span>
            {role === 'buyer' ? (
              <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-500">
                Sign up as a Buyer
              </Link>
            ) : (
              <Link to="/seller/signup" className="font-medium text-primary-600 hover:text-primary-500">
                Register as a Seller
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
