import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:5001';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [emailError, setEmailError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError('Email is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(trimmed)) {
      setEmailError('Invalid email address');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data || !data.ok) {
        toast.error(data?.error ?? 'Something went wrong');
        return;
      }

      setSent(true);
      if (data.devToken) {
        setDevToken(data.devToken);
      }
    } catch {
      toast.error('Network error — please try again');
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
          <h2 className="text-3xl font-bold text-surface-900">Forgot your password?</h2>
          <p className="mt-2 text-sm text-surface-500">
            Enter your email address and we'll send you a reset link.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-surface-200 overflow-hidden">
          <div className="p-8">
            {!sent ? (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <Input
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                  }}
                  error={emailError}
                  placeholder="you@example.com"
                  autoComplete="email"
                  autoFocus
                />

                <Button type="submit" fullWidth size="lg" loading={loading}>
                  Send Reset Link
                </Button>
              </form>
            ) : (
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-success-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-surface-900 mb-2">
                    Check your email
                  </h3>
                  <p className="text-sm text-surface-600">
                    If an account with <strong>{email}</strong> exists, we've sent a
                    password reset link.
                  </p>
                </div>

                {devToken && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                    <p className="text-xs font-semibold text-yellow-900 mb-2">
                      ⚠️ DEV MODE — Reset link:
                    </p>
                    <Link
                      to={`/reset-password?token=${devToken}`}
                      className="text-xs text-blue-600 hover:text-blue-700 break-all font-mono"
                    >
                      /reset-password?token={devToken.substring(0, 24)}...
                    </Link>
                    <p className="text-xs text-yellow-700 mt-2">
                      In production this link is emailed. Click to continue.
                    </p>
                  </div>
                )}

                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
              </div>
            )}
          </div>

          {!sent && (
            <div className="px-8 py-6 bg-surface-50 border-t border-surface-200 text-center text-sm">
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}