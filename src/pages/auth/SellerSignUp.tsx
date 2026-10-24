import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, CheckCircle2, Upload } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { uploadImage, signupSeller } from '../../lib/api';
import toast from 'react-hot-toast';

export function SellerSignUp() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { login } = useAuth(); // We'll use login after signup
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    businessName: '',
    email: '',
    phone: '',
    gstNumber: '',
    password: '',
  });
  const [panCardUrl, setPanCardUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.businessName.trim()) e.businessName = 'Business name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    if (!form.gstNumber.trim()) e.gstNumber = 'GST number is required';
    else if (form.gstNumber.length !== 15) e.gstNumber = 'GST must be 15 characters';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) {
      e.password = 'Password must be at least 8 characters';
    }
    if (!panCardUrl) e.panCard = 'PAN card upload is required';
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePanUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const res = await uploadImage(file, 'sellers');
    setUploading(false);

    if (!res.ok || !res.url) {
      toast.error(res.error || 'Failed to upload PAN card');
      return;
    }
    setPanCardUrl(res.url);
    setErrors((prev) => ({ ...prev, panCard: '' }));
    toast.success('PAN card uploaded');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the errors above');
      return;
    }

    setLoading(true);
    try {
      // 1. Call signupSeller with all fields
      const result = await signupSeller({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        name: form.name.trim(),
        businessName: form.businessName.trim(),
        phone: form.phone.trim(),
        gstNumber: form.gstNumber.toUpperCase().trim(),
        panCardUrl,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      // 2. Log them in
      await login(form.email.trim().toLowerCase(), form.password);
      
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
            Create your shop, verify your business details, and start selling.
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  label="Email address"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  error={errors.email}
                  placeholder="you@example.com"
                />
                <Input
                  label="Phone Number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  error={errors.phone}
                  placeholder="+91 98765 43210"
                />
              </div>

              <Input
                label="GST Number"
                value={form.gstNumber}
                onChange={(e) => setForm({ ...form, gstNumber: e.target.value.toUpperCase() })}
                error={errors.gstNumber}
                placeholder="e.g., 22AAAAA0000A1Z5"
                maxLength={15}
              />

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  PAN Card Image *
                </label>
                {panCardUrl ? (
                  <div className="flex items-center gap-3 p-3 bg-success-50 border border-success-200 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-success-600" />
                    <span className="text-sm text-success-800">PAN card uploaded successfully</span>
                    <button
                      type="button"
                      onClick={() => setPanCardUrl('')}
                      className="ml-auto text-xs text-danger-600 hover:underline"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className={`w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg transition-colors ${
                        errors.panCard
                          ? 'border-danger-300 bg-danger-50 text-danger-600'
                          : 'border-surface-300 hover:border-primary-400 text-surface-500 hover:text-primary-600'
                      }`}
                    >
                      <Upload className="w-5 h-5" />
                      {uploading ? 'Uploading...' : 'Click to upload PAN card'}
                    </button>
                    {errors.panCard && (
                      <p className="mt-1 text-xs text-danger-600">{errors.panCard}</p>
                    )}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePanUpload}
                />
              </div>

              <Input
                label="Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                error={errors.password}
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />

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
      </div>
    </div>
  );
}