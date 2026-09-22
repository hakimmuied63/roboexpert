import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input, Select } from '../../components/ui';
import { orderService } from '../../mocks/services';
import toast from 'react-hot-toast';
import { CheckCircle2, ShieldCheck, MapPin, CreditCard } from 'lucide-react';
import type { OrderItem } from '../../types';

export function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1); // 1: Shipping, 2: Payment (Mock Razorpay)
  
  const [form, setForm] = useState({
    fullName: user?.name || '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const subtotal = totalPrice;
  const shipping = subtotal > 999 ? 0 : 99;
  const total = subtotal + shipping;

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const validateShipping = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = 'Name is required';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    if (!form.line1.trim()) e.line1 = 'Address is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.state.trim()) e.state = 'State is required';
    if (!form.pincode.trim()) e.pincode = 'Pincode is required';
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateShipping()) {
      setStep(2);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Simulate Razorpay window opening and closing
      toast('Opening secure payment gateway...', { icon: '🔒' });
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const orderItems: OrderItem[] = items.map(i => ({
        productId: i.product.id,
        productTitle: i.product.title,
        productImage: i.product.images[0],
        price: i.product.price,
        quantity: i.quantity,
        sellerId: i.product.sellerId,
        sellerName: i.product.sellerName,
      }));

      const newOrder = await orderService.create({
        buyerId: user.id,
        buyerName: user.name,
        buyerEmail: user.email,
        items: orderItems,
        totalAmount: total,
        status: 'placed',
        shippingAddress: form,
        paymentMethod: 'Razorpay',
        paymentStatus: 'paid',
      });

      toast.success('Payment successful! Order placed.');
      clearCart();
      navigate(`/orders/${newOrder.id}`);
    } catch {
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Checkout Steps Header */}
      <div className="flex items-center justify-center mb-12">
        <div className="flex items-center">
          <div className={`flex flex-col items-center ${step >= 1 ? 'text-primary-600' : 'text-surface-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 ${
              step >= 1 ? 'bg-primary-600 text-white' : 'bg-surface-200 text-surface-500'
            }`}>
              1
            </div>
            <span className="text-sm font-medium">Shipping</span>
          </div>
          <div className={`w-24 h-1 mx-4 rounded-full ${step >= 2 ? 'bg-primary-600' : 'bg-surface-200'}`} />
          <div className={`flex flex-col items-center ${step >= 2 ? 'text-primary-600' : 'text-surface-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 ${
              step >= 2 ? 'bg-primary-600 text-white' : 'bg-surface-200 text-surface-500'
            }`}>
              2
            </div>
            <span className="text-sm font-medium">Payment</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column (Forms) */}
        <div className="flex-1">
          {step === 1 ? (
            <div className="bg-white rounded-2xl border border-surface-200 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-6 h-6 text-primary-600" />
                <h2 className="text-xl font-bold text-surface-900">Shipping Address</h2>
              </div>
              <form onSubmit={handleContinueToPayment} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    label="Full Name"
                    value={form.fullName}
                    onChange={e => setForm({ ...form, fullName: e.target.value })}
                    error={errors.fullName}
                  />
                  <Input
                    label="Phone Number"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    error={errors.phone}
                  />
                </div>
                <Input
                  label="Address Line 1"
                  value={form.line1}
                  onChange={e => setForm({ ...form, line1: e.target.value })}
                  error={errors.line1}
                  placeholder="Street address, P.O. box, company name, c/o"
                />
                <Input
                  label="Address Line 2 (Optional)"
                  value={form.line2}
                  onChange={e => setForm({ ...form, line2: e.target.value })}
                  placeholder="Apartment, suite, unit, building, floor, etc."
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    label="City"
                    value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })}
                    error={errors.city}
                  />
                  <Select
                    label="State"
                    value={form.state}
                    onChange={e => setForm({ ...form, state: e.target.value })}
                    error={errors.state}
                    options={[
                      { value: 'Karnataka', label: 'Karnataka' },
                      { value: 'Maharashtra', label: 'Maharashtra' },
                      { value: 'Delhi', label: 'Delhi' },
                      { value: 'Tamil Nadu', label: 'Tamil Nadu' },
                      { value: 'Telangana', label: 'Telangana' },
                      { value: 'Gujarat', label: 'Gujarat' },
                    ]}
                    placeholder="Select State"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    label="PIN Code"
                    value={form.pincode}
                    onChange={e => setForm({ ...form, pincode: e.target.value })}
                    error={errors.pincode}
                  />
                  <Input
                    label="Country"
                    value={form.country}
                    disabled
                  />
                </div>
                <Button type="submit" size="lg" className="w-full sm:w-auto">
                  Continue to Payment
                </Button>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-surface-200 p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-success-600" />
                    <h2 className="text-xl font-bold text-surface-900">Shipping Address</h2>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    Edit
                  </button>
                </div>
                <div className="text-sm text-surface-600 bg-surface-50 p-4 rounded-xl border border-surface-200">
                  <p className="font-medium text-surface-900">{form.fullName} ({form.phone})</p>
                  <p>{form.line1}</p>
                  {form.line2 && <p>{form.line2}</p>}
                  <p>{form.city}, {form.state} - {form.pincode}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-surface-200 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="w-6 h-6 text-primary-600" />
                  <h2 className="text-xl font-bold text-surface-900">Payment</h2>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/1/1f/Razorpay_Logo.svg" 
                    alt="Razorpay" 
                    className="h-8 mx-auto mb-4"
                  />
                  <p className="text-sm text-blue-800 mb-6">
                    You will be securely redirected to Razorpay to complete your purchase. Payments are routed directly to the sellers.
                  </p>
                  <Button size="lg" loading={loading} onClick={handlePlaceOrder} className="w-full sm:w-auto px-8">
                    Pay ₹{total.toLocaleString('en-IN')} via Razorpay
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Order Summary) */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-surface-200 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-surface-900 mb-6">Order Summary</h2>

            <ul className="space-y-4 mb-6">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="flex gap-4">
                  <div className="relative">
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-16 h-16 rounded-lg object-cover border border-surface-200"
                    />
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-surface-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                      {quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-900 line-clamp-2">{product.title}</p>
                    <p className="text-xs text-surface-500 mt-1">Sold by {product.sellerName}</p>
                  </div>
                  <p className="text-sm font-medium text-surface-900">
                    ₹{(product.price * quantity).toLocaleString('en-IN')}
                  </p>
                </li>
              ))}
            </ul>

            <div className="space-y-3 text-sm border-t border-surface-200 pt-4 mb-4">
              <div className="flex justify-between text-surface-600">
                <span>Subtotal</span>
                <span className="font-medium text-surface-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-surface-600">
                <span>Shipping fee</span>
                <span className="font-medium text-surface-900">
                  {shipping === 0 ? <span className="text-success-600">Free</span> : `₹${shipping}`}
                </span>
              </div>
            </div>

            <div className="border-t border-surface-200 pt-4 mb-6">
              <div className="flex justify-between">
                <span className="text-base font-bold text-surface-900">Total</span>
                <span className="text-xl font-bold text-primary-600">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="bg-surface-50 rounded-lg p-3 flex items-start gap-2 text-xs text-surface-500">
              <ShieldCheck className="w-4 h-4 text-success-600 flex-shrink-0 mt-0.5" />
              <p>Safe and secure payments. 100% Authentic products.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
