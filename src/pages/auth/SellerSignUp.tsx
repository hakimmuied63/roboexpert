import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, CreditCard, Wallet, Banknote } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../mocks/services';
import toast from 'react-hot-toast';

export function SellerSignUp() {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Basic info
  const [form, setForm] = useState({ name: '', email: '', password: '', businessName: '' });
  
  // Payout info
  const [payoutMethod, setPayoutMethod] = useState<'razorpay' | 'bank'>('razorpay');
  const [payoutForm, setPayoutForm] = useState({
    razorpayId: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
  });

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.businessName) {
      toast.error('Please fill in all basic info fields');
      return;
    }
    setStep(2);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payoutMethod === 'razorpay' && !payoutForm.razorpayId) {
      toast.error('Please provide Razorpay ID');
      return;
    }
    if (payoutMethod === 'bank' && (!payoutForm.bankName || !payoutForm.accountNumber || !payoutForm.ifscCode)) {
      toast.error('Please fill in all bank details');
      return;
    }

    setLoading(true);
    try {
      const seller = await authService.signupSeller({
        name: form.name,
        email: form.email,
        businessName: form.businessName,
        payoutMethod,
      });
      login(seller);
      toast.success('Seller account created successfully!');
      navigate('/seller');
    } catch {
      toast.error('Signup failed');
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
            Set up your shop and start receiving direct payments instantly.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-surface-200 overflow-hidden">
          {/* Progress Bar */}
          <div className="flex bg-surface-50 border-b border-surface-200">
            <div className={`flex-1 py-3 text-sm font-medium text-center ${step >= 1 ? 'text-primary-600 border-b-2 border-primary-600' : 'text-surface-400'}`}>
              1. Basic Details
            </div>
            <div className={`flex-1 py-3 text-sm font-medium text-center ${step >= 2 ? 'text-primary-600 border-b-2 border-primary-600' : 'text-surface-400'}`}>
              2. Payout Setup
            </div>
          </div>

          <div className="p-8">
            {step === 1 ? (
              <form className="space-y-6" onSubmit={handleNext}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                  <Input
                    label="Business/Shop Name"
                    value={form.businessName}
                    onChange={e => setForm({ ...form, businessName: e.target.value })}
                    required
                  />
                </div>
                <Input
                  label="Email address"
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
                
                <Button type="submit" fullWidth size="lg">
                  Continue to Payout Setup
                </Button>
              </form>
            ) : (
              <form className="space-y-6" onSubmit={handleSignup}>
                <div className="bg-primary-50 rounded-xl p-4 mb-6">
                  <p className="text-sm text-primary-900 font-medium mb-1">Direct Payments Only</p>
                  <p className="text-xs text-primary-700">
                    Roboexpert does not hold your funds. When a buyer places an order, the payment is routed directly to your connected account.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    payoutMethod === 'razorpay' ? 'border-primary-500 bg-primary-50' : 'border-surface-200 hover:border-primary-200'
                  }`}>
                    <input
                      type="radio"
                      className="sr-only"
                      checked={payoutMethod === 'razorpay'}
                      onChange={() => setPayoutMethod('razorpay')}
                    />
                    <Wallet className={`w-6 h-6 mb-2 ${payoutMethod === 'razorpay' ? 'text-primary-600' : 'text-surface-400'}`} />
                    <p className="font-medium text-surface-900">Razorpay</p>
                    <p className="text-xs text-surface-500">Connect account</p>
                  </label>
                  
                  <label className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    payoutMethod === 'bank' ? 'border-primary-500 bg-primary-50' : 'border-surface-200 hover:border-primary-200'
                  }`}>
                    <input
                      type="radio"
                      className="sr-only"
                      checked={payoutMethod === 'bank'}
                      onChange={() => setPayoutMethod('bank')}
                    />
                    <Banknote className={`w-6 h-6 mb-2 ${payoutMethod === 'bank' ? 'text-primary-600' : 'text-surface-400'}`} />
                    <p className="font-medium text-surface-900">Bank Transfer</p>
                    <p className="text-xs text-surface-500">Direct deposit</p>
                  </label>
                </div>

                <div className="pt-4 border-t border-surface-200">
                  {payoutMethod === 'razorpay' ? (
                    <div className="space-y-4">
                      <Input
                        label="Razorpay Account ID"
                        value={payoutForm.razorpayId}
                        onChange={e => setPayoutForm({ ...payoutForm, razorpayId: e.target.value })}
                        placeholder="rzp_live_xxxxxxxx"
                        required
                        icon={<CreditCard className="w-4 h-4" />}
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Input
                        label="Bank Name"
                        value={payoutForm.bankName}
                        onChange={e => setPayoutForm({ ...payoutForm, bankName: e.target.value })}
                        placeholder="e.g., HDFC Bank"
                        required
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Account Number"
                          value={payoutForm.accountNumber}
                          onChange={e => setPayoutForm({ ...payoutForm, accountNumber: e.target.value })}
                          required
                        />
                        <Input
                          label="IFSC Code"
                          value={payoutForm.ifscCode}
                          onChange={e => setPayoutForm({ ...payoutForm, ifscCode: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" loading={loading}>
                    Complete Setup
                  </Button>
                </div>
              </form>
            )}
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
