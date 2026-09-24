import { useEffect, useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Shield,
  ExternalLink,
  Eye,
  EyeOff,
  Trash2,
} from 'lucide-react';
import { Button, Input, LoadingSpinner, ConfirmModal } from '../../components/ui';
import {
  fetchMyPaymentConfig,
  savePaymentConfig,
  deletePaymentConfig,
  type SellerPaymentConfig,
} from '../../lib/api';
import toast from 'react-hot-toast';

export function SellerPayments() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<SellerPaymentConfig | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(false);

  const [form, setForm] = useState({
    keyId: '',
    keySecret: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const data = await fetchMyPaymentConfig();
    setConfig(data.config);
    setShowForm(!data.configured);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.keyId.trim()) e.keyId = 'Key ID is required';
    if (!form.keySecret.trim()) e.keySecret = 'Key Secret is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    const ok = await savePaymentConfig(form.keyId.trim(), form.keySecret.trim());
    setSaving(false);

    if (!ok) {
      toast.error('Could not save keys. Check that they are valid.');
      return;
    }

    toast.success('Razorpay connected');
    setForm({ keyId: '', keySecret: '' });
    await load();
  };

  const handleRemove = async () => {
    const ok = await deletePaymentConfig();
    if (!ok) {
      toast.error('Could not remove keys');
      return;
    }
    toast.success('Razorpay disconnected');
    setConfig(null);
    setShowForm(true);
    setRemoveTarget(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 lg:p-8 max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Payments</h1>
        <p className="text-surface-500 mt-1">
          Connect your Razorpay account to receive payments directly.
        </p>
      </div>

      {/* How it works */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">How payments work on Roboexpert</p>
            <ul className="space-y-1 list-disc list-inside text-blue-800">
              <li>Buyers pay through Razorpay when they check out.</li>
              <li>
                Money goes <strong>directly to your Razorpay account</strong> — we never hold it.
              </li>
              <li>Your Key Secret is encrypted at rest and never returned to the browser.</li>
              <li>You keep 100% of every sale.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Status Card */}
      {config ? (
        <div className="bg-white rounded-xl border border-surface-200 p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-success-50 flex items-center justify-center text-success-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base font-bold text-surface-900">Razorpay connected</p>
                <p className="text-sm text-surface-500 mt-0.5">
                  Buyers' payments will route to your Razorpay account.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-surface-50 rounded-lg p-4 border border-surface-200">
            <p className="text-xs font-medium text-surface-500 uppercase tracking-wider mb-1">
              Key ID
            </p>
            <p className="font-mono text-sm text-surface-900">{config.razorpayKeyId}</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowForm((s) => !s)}
            >
              {showForm ? 'Cancel update' : 'Update keys'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRemoveTarget(true)}
              className="text-danger-600 hover:bg-danger-50"
              icon={<Trash2 className="w-4 h-4" />}
            >
              Disconnect
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-yellow-900">Razorpay not connected</p>
            <p className="text-yellow-800 mt-1">
              Until you connect your Razorpay account, buyers can't complete checkout for
              your products.
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSave}
          className="bg-white rounded-xl border border-surface-200 p-6 space-y-5"
        >
          <h2 className="text-sm font-semibold text-surface-900">
            {config ? 'Update Razorpay keys' : 'Connect Razorpay'}
          </h2>

          <Input
            label="Razorpay Key ID"
            value={form.keyId}
            onChange={(e) => setForm({ ...form, keyId: e.target.value })}
            error={errors.keyId}
            placeholder="rzp_test_xxxxxxxxxxxx"
          />

          <div className="relative">
            <Input
              label="Razorpay Key Secret"
              type={showSecret ? 'text' : 'password'}
              value={form.keySecret}
              onChange={(e) => setForm({ ...form, keySecret: e.target.value })}
              error={errors.keySecret}
              placeholder="Your secret key"
            />
            <button
              type="button"
              onClick={() => setShowSecret((s) => !s)}
              className="absolute right-3 top-[38px] text-surface-400 hover:text-surface-600 cursor-pointer"
              aria-label={showSecret ? 'Hide secret' : 'Show secret'}
            >
              {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <p className="text-xs text-surface-500">
            Find these keys in your Razorpay dashboard under{' '}
            <span className="font-medium">Settings → API Keys</span>.
          </p>

          <div className="flex items-center justify-between pt-2">
            <a
              href="https://dashboard.razorpay.com/app/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Open Razorpay dashboard
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <Button type="submit" loading={saving}>
              {config ? 'Save new keys' : 'Connect Razorpay'}
            </Button>
          </div>
        </form>
      )}

      {/* Help */}
      <div className="bg-white rounded-xl border border-surface-200 p-6">
        <div className="flex items-start gap-3">
          <CreditCard className="w-5 h-5 text-surface-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-surface-600">
            <p className="font-medium text-surface-900 mb-1">Don't have a Razorpay account?</p>
            <p>
              Sign up at{' '}
              <a
                href="https://razorpay.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                razorpay.com
              </a>{' '}
              — it's free, and you'll get your API keys once your account is verified.
            </p>
          </div>
        </div>
      </div>

      {/* Remove confirmation */}
      <ConfirmModal
        isOpen={removeTarget}
        onClose={() => setRemoveTarget(false)}
        onConfirm={handleRemove}
        title="Disconnect Razorpay"
        message="Are you sure you want to remove your Razorpay keys? Buyers won't be able to check out from your store until you reconnect."
        confirmText="Disconnect"
      />
    </div>
  );
}