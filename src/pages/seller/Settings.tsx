import { useEffect, useState } from 'react';
import { Copy, Check, Store, ExternalLink } from 'lucide-react';
import { Button, Input, LoadingSpinner } from '../../components/ui';
import { fetchMyCompany, updateMyCompany, type MyCompany } from '../../lib/api';
import toast from 'react-hot-toast';

export function SellerSettings() {
  const [company, setCompany] = useState<MyCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    name: '',
    contactEmail: '',
    contactPhone: '',
    logoUrl: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      const data = await fetchMyCompany();
      if (data) {
        setCompany(data);
        setForm({
          name: data.name ?? '',
          contactEmail: data.contactEmail ?? '',
          contactPhone: data.contactPhone ?? '',
          logoUrl: data.logoUrl ?? '',
          line1: data.address?.line1 ?? '',
          line2: data.address?.line2 ?? '',
          city: data.address?.city ?? '',
          state: data.address?.state ?? '',
          pincode: data.address?.pincode ?? '',
          country: data.address?.country ?? 'India',
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  const shopNowUrl = company
    ? `${window.location.origin}/shop/${company._id}`
    : '';

  const handleCopy = async () => {
    if (!shopNowUrl) return;
    try {
      await navigator.clipboard.writeText(shopNowUrl);
      setCopied(true);
      toast.success('Shop Now URL copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy');
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Company name is required';
    if (!form.contactEmail.trim()) e.contactEmail = 'Contact email is required';
    else if (!/\S+@\S+\.\S+/.test(form.contactEmail)) {
      e.contactEmail = 'Invalid email';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the errors below');
      return;
    }

    setSaving(true);

    const payload = {
      name: form.name.trim(),
      contactEmail: form.contactEmail.trim().toLowerCase(),
      contactPhone: form.contactPhone.trim() || undefined,
      logoUrl: form.logoUrl.trim() || undefined,
      address: {
        line1: form.line1.trim() || undefined,
        line2: form.line2.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        pincode: form.pincode.trim() || undefined,
        country: form.country.trim() || 'India',
      },
    };

    const updated = await updateMyCompany(payload);
    setSaving(false);

    if (!updated) {
      toast.error('Could not save changes');
      return;
    }

    setCompany(updated);
    toast.success('Company profile updated');
  };

  if (loading) return <LoadingSpinner />;

  if (!company) {
    return (
      <div className="p-6 lg:p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="text-lg font-bold text-red-900">Could not load company</h2>
          <p className="text-sm text-red-700 mt-1">
            Please make sure you're signed in as a seller.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Settings</h1>
        <p className="text-surface-500 mt-1">
          Manage your company profile and store link.
        </p>
      </div>

      {/* Shop Now URL Card */}
      <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center text-white flex-shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-surface-900">Your Shop Now URL</h2>
            <p className="text-sm text-surface-600 mt-0.5">
              Paste this link behind the "Shop Now" button on your own website. Buyers who
              click it will land directly on your storefront.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white border border-primary-200 rounded-lg p-2 pl-4">
          <code className="flex-1 text-sm text-surface-700 truncate">{shopNowUrl}</code>
          <Button
            type="button"
            size="sm"
            onClick={handleCopy}
            icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>

        <a
          href={shopNowUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium mt-3"
        >
          Open my storefront
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Company Profile Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Info */}
        <div className="bg-white rounded-xl border border-surface-200 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-surface-900">Company Information</h2>

          <Input
            label="Company Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
            placeholder="e.g., Muied Enterprises"
          />

          <Input
            label="Logo URL (optional)"
            value={form.logoUrl}
            onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
            placeholder="https://..."
          />
        </div>

        {/* Contact */}
        <div className="bg-white rounded-xl border border-surface-200 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-surface-900">Contact Details</h2>

          <Input
            label="Contact Email"
            type="email"
            value={form.contactEmail}
            onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
            error={errors.contactEmail}
            placeholder="contact@yourcompany.com"
          />

          <Input
            label="Contact Phone (optional)"
            value={form.contactPhone}
            onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
            placeholder="9876543210"
          />
        </div>

        {/* Address */}
        <div className="bg-white rounded-xl border border-surface-200 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-surface-900">Business Address</h2>

          <Input
            label="Address Line 1"
            value={form.line1}
            onChange={(e) => setForm({ ...form, line1: e.target.value })}
            placeholder="Street address"
          />

          <Input
            label="Address Line 2 (optional)"
            value={form.line2}
            onChange={(e) => setForm({ ...form, line2: e.target.value })}
            placeholder="Apartment, suite, etc."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
            <Input
              label="State"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="PIN Code"
              value={form.pincode}
              onChange={(e) => setForm({ ...form, pincode: e.target.value })}
            />
            <Input
              label="Country"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            />
          </div>
        </div>

        {/* Read-only info */}
        <div className="bg-surface-50 border border-surface-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-surface-500">Company Slug</span>
            <span className="font-mono text-surface-700">{company.slug}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-surface-500">Company ID</span>
            <span className="font-mono text-xs text-surface-700">{company._id}</span>
          </div>
          <p className="text-xs text-surface-400 pt-1">
            These are set automatically and can't be changed.
          </p>
        </div>

        <div className="flex justify-end">
          <Button type="submit" loading={saving}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}