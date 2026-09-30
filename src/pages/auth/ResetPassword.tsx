import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Store, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:5001';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!password) e.password = 'Password is required';
    else if (password.length < 8) e.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data || !data.ok) {
        toast.error(data?.error ?? 'Could not reset password');
        return;
      }

      setSuccess(true);
      toast.success('Password reset successfully');
      // Auto-redirect to login after 2 seconds
      setTimeout(() => navigate('/login'), 2000);
    } catch {
      toast.error('Network error — please try again');
    } finally {
      setLoading(false);
    }
  };

  // Missing token — can't reset
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-surface-200 p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-surface-900 mb-2">Invalid reset link</h2>
            <p className="text-sm text-surface-600">
              The password reset link is missing or invalid. Please request a new one.
            </p>
          </div>
          <Link
            to="/forgot-password"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Request new link
          </Link>
        </div>
      </div>
    );
  }

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
          <h2 className="text-3xl font-bold text-surface-900">Set a new password</h2>
          <p className="mt-2 text-sm text-surface-500">
            Enter your new password below.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-surface-200 overflow-hidden">
          <div className="p-8">
            {!success ? (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="relative">
                  <Input
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors({ ...errors, password: '' });
                    }}
                    error={errors.password}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-[38px] text-surface-400 hover:text-surface-600 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <Input
                  label="Confirm New Password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors({ ...errors, confirmPassword: '' });
                  }}
                  error={errors.confirmPassword}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                />

                <Button type="submit" fullWidth size="lg" loading={loading}>
                  Reset Password
                </Button>
              </form>
            ) : (
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-success-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-surface-900 mb-2">
                    Password reset successfully
                  </h3>
                  <p className="text-sm text-surface-600">
                    You can now log in with your new password. Redirecting...
                  </p>
                </div>
                <Link
                  to="/login"
                  className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  Go to login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}