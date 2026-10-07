import { useEffect, useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Button, Input } from '../ui';
import { createLead } from '../../lib/api';
import toast from 'react-hot-toast';

const SUBMITTED_KEY = 'roboexpert_lead_submitted';
const DISMISSED_KEY = 'roboexpert_lead_dismissed';
const SHOW_DELAY_MS = 3000;

export function LeadPopup() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Already submitted or dismissed in this browser? Skip.
    try {
      if (localStorage.getItem(SUBMITTED_KEY) === 'true') return;
      if (localStorage.getItem(DISMISSED_KEY) === 'true') return;
    } catch {
      // ignore
    }

    const timer = setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    else if (name.trim().length < 2) e.name = 'Name is too short';

    const cleaned = phone.replace(/\s+/g, '');
    if (!cleaned) e.phone = 'Phone number is required';
    else if (!/^[0-9+\-]{10,15}$/.test(cleaned)) e.phone = 'Enter a valid phone number';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleDismiss = () => {
    setOpen(false);
    try {
      localStorage.setItem(DISMISSED_KEY, 'true');
    } catch {
      // ignore
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const ok = await createLead(name.trim(), phone.trim());
    setSubmitting(false);

    if (!ok) {
      toast.error('Could not save. Please try again.');
      return;
    }

    try {
      localStorage.setItem(SUBMITTED_KEY, 'true');
    } catch {
      // ignore
    }

    toast.success('Thanks! We will reach out soon.');
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
        {/* Close */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-full text-surface-400 hover:bg-surface-100 hover:text-surface-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 px-6 pt-7 pb-6 text-white">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold leading-tight">
            Get exclusive offers!
          </h2>
          <p className="text-sm text-white/90 mt-2">
            Sign up now to unlock special discounts and updates from RoboExpert.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            placeholder="e.g., John Doe"
            autoFocus
          />

          <Input
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={errors.phone}
            placeholder="e.g., 9876543210"
            type="tel"
          />

          <Button type="submit" fullWidth size="lg" loading={submitting}>
            Claim My Offer
          </Button>

          <button
            type="button"
            onClick={handleDismiss}
            className="w-full text-xs text-surface-400 hover:text-surface-600 transition-colors pt-2"
          >
            No thanks, maybe later
          </button>
        </form>
      </div>
    </div>
  );
}