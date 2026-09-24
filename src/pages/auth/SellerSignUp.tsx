import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, CheckCircle2 } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export function SellerSignUp() {
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    businessName: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.businessName.trim()) e.businessName = 'Business name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) {
      e.password = 'Password must be at least 8 characters';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the errors above');
      return;
    }

    setLoading(true);
    try {
      const result = await signup(
        form.email.trim().toLowerCase(),
        form.password,
        form.name.trim(),
        form.businessName.trim()
      );

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success('Welcome to Roboexpert!');
      navigate('/seller');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-surface-900">
              roboexpert<span className="text-primary-600">.in</span>
            </span>
          </Link>
          <h2 className="text-3xl font-bold text-surface-900">Start Selling on Roboexpert</h2>
          <p className="mt-2 text-sm text-surface-500">
            Create your shop in seconds. No approval required.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-surface-200 overflow-hidden">
          <div className="p-8">
            <form className="space-y-6" onSubmit={handleSignup}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  error={errors.name}
                  placeholder="e.g., Muied Ahmed"
                />
                <Input
                  label="Business / Shop Name"
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  error={errors.businessName}
                  placeholder="e.g., Muied Enterprises"
                />
              </div>

              <Input
                label="Email address"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                error={errors.email}
                placeholder="you@example.com"
                autoComplete="email"
              />

              <Input
                label="Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                error={errors.password}
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />

              <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-primary-900">
                  <p className="font-medium mb-1">What you get</p>
                  <ul className="space-y-0.5 text-primary-800">
                    <li>• Your own storefront URL (Shop Now link)</li>
                    <li>• Direct payments to your Razorpay account</li>
                    <li>• Full control over products, orders, and categories</li>
                  </ul>
                </div>
              </div>

              <Button type="submit" fullWidth size="lg" loading={loading}>
                Create Seller Account
              </Button>
            </form>
          </div>

          <div className="px-8 py-6 bg-surface-50 border-t border-surface-200 text-center text-sm">
            <span className="text-surface-500">Already a seller? </span>
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in to your dashboard
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-surface-400">
          By creating an account, you agree to Roboexpert's Terms of Service.
        </p>
      </div>
    </div>
  );
}