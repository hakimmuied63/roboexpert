import { useAuth } from '../../contexts/AuthContext';
import { Button, Input } from '../../components/ui';
import { useState } from 'react';
import toast from 'react-hot-toast';
import type { Seller } from '../../types';

export function SellerSettings() {
  const { user } = useAuth();
  const seller = user as Seller | null;

  const [form, setForm] = useState({
    businessName: seller?.businessName || '',
    description: seller?.description || '',
    email: seller?.email || '',
    payoutMethod: seller?.payoutDetails?.method || 'razorpay',
    razorpayId: seller?.payoutDetails?.razorpayId || '',
    bankName: seller?.payoutDetails?.bankName || '',
    accountNumber: seller?.payoutDetails?.accountNumber || '',
    ifscCode: seller?.payoutDetails?.ifscCode || '',
    accountHolder: seller?.payoutDetails?.accountHolder || '',
  });

  const handleSave = () => {
    toast.success('Settings saved (mock)');
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Settings</h1>
        <p className="text-surface-500 mt-1">Manage your shop and payout details.</p>
      </div>

      {/* Shop Info */}
      <div className="bg-white rounded-xl border border-surface-200 p-6 space-y-5">
        <h2 className="text-sm font-semibold text-surface-900">Shop Information</h2>
        <Input
          label="Business Name"
          value={form.businessName}
          onChange={e => setForm({ ...form, businessName: e.target.value })}
        />
        <Input
          label="Email Address"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          type="email"
        />
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-surface-700">Shop Description</label>
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border border-surface-300 bg-white px-3.5 py-2.5 text-sm text-surface-900
              placeholder:text-surface-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none
              transition-colors min-h-[80px] resize-y"
            placeholder="Tell buyers about your shop..."
          />
        </div>
      </div>

      {/* Payout Details */}
      <div className="bg-white rounded-xl border border-surface-200 p-6 space-y-5">
        <h2 className="text-sm font-semibold text-surface-900">Payout Details</h2>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-surface-700">Payout Method</label>
          <div className="flex gap-3">
            <label className={`flex-1 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
              form.payoutMethod === 'razorpay' ? 'border-primary-500 bg-primary-50' : 'border-surface-200'
            }`}>
              <input
                type="radio"
                name="payout"
                value="razorpay"
                checked={form.payoutMethod === 'razorpay'}
                onChange={e => setForm({ ...form, payoutMethod: e.target.value as 'razorpay' | 'bank' })}
                className="sr-only"
              />
              <p className="text-sm font-medium text-surface-900">Razorpay</p>
              <p className="text-xs text-surface-500">Connect your Razorpay account</p>
            </label>
            <label className={`flex-1 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
              form.payoutMethod === 'bank' ? 'border-primary-500 bg-primary-50' : 'border-surface-200'
            }`}>
              <input
                type="radio"
                name="payout"
                value="bank"
                checked={form.payoutMethod === 'bank'}
                onChange={e => setForm({ ...form, payoutMethod: e.target.value as 'razorpay' | 'bank' })}
                className="sr-only"
              />
              <p className="text-sm font-medium text-surface-900">Bank Account</p>
              <p className="text-xs text-surface-500">Direct bank transfer</p>
            </label>
          </div>
        </div>

        {form.payoutMethod === 'razorpay' ? (
          <Input
            label="Razorpay Account ID"
            value={form.razorpayId}
            onChange={e => setForm({ ...form, razorpayId: e.target.value })}
            placeholder="rzp_live_xxxxxxxx"
          />
        ) : (
          <div className="space-y-4">
            <Input
              label="Bank Name"
              value={form.bankName}
              onChange={e => setForm({ ...form, bankName: e.target.value })}
              placeholder="e.g., HDFC Bank"
            />
            <Input
              label="Account Holder Name"
              value={form.accountHolder}
              onChange={e => setForm({ ...form, accountHolder: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Account Number"
                value={form.accountNumber}
                onChange={e => setForm({ ...form, accountNumber: e.target.value })}
              />
              <Input
                label="IFSC Code"
                value={form.ifscCode}
                onChange={e => setForm({ ...form, ifscCode: e.target.value })}
                placeholder="e.g., HDFC0001234"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Settings</Button>
      </div>
    </div>
  );
}
