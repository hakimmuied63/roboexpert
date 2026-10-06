import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { Button, Input, Select } from '../../components/ui';
import { placeOrder, createPaymentOrder, verifyPayment } from '../../lib/api';
import toast from 'react-hot-toast';
import {
  CheckCircle2,
  ShieldCheck,
  MapPin,
  CreditCard,
  Banknote,
} from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('online');

  const [form, setForm] = useState({
    fullName: '',
    email: '',
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
  const shipping = 0;
  const total = subtotal + shipping;

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const validateShipping = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
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
    if (validateShipping()) setStep(2);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);

    try {
      const payload = {
        buyer: {
          name: form.fullName,
          email: form.email,
          phone: form.phone,
        },
        shippingAddress: {
          line1: form.line1,
          line2: form.line2 || undefined,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          country: form.country,
        },
        paymentMethod,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
      };

      toast('Placing your order...', { icon: '📦' });

      const result = await placeOrder(payload);

      if (!result || !result.ok) {
        toast.error('Failed to place order. Please try again.');
        setLoading(false);
        return;
      }

      const orderCount = result.orders.length;
      const firstOrderNumber = result.orders[0].order.orderNumber;

      // If online payment -> open Razorpay modal
      if (paymentMethod === 'online') {
        if (orderCount > 1) {
          toast.error(
            'Online payment is not available for multi-seller carts yet. Please choose COD or split your order.'
          );
          setLoading(false);
          return;
        }

        const order = result.orders[0].order;

        const rzpData = await createPaymentOrder(order._id);
        if (!rzpData || !rzpData.ok || !rzpData.razorpayOrderId || !rzpData.keyId) {
          toast.error('Could not start payment. Please try again.');
          setLoading(false);
          return;
        }

        const options = {
          key: rzpData.keyId,
          amount: (rzpData.amount ?? order.total) * 100,
          currency: rzpData.currency ?? 'INR',
          name: 'Roboexpert',
          description: `Order #${order.orderNumber}`,
          order_id: rzpData.razorpayOrderId,
          prefill: {
            name: form.fullName,
            email: form.email,
            contact: form.phone,
          },
          theme: {
            color: '#2563eb',
          },
          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            const verified = await verifyPayment({
              orderId: order._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (!verified || !verified.ok) {
              toast.error('Payment verification failed. Please contact support.');
              setLoading(false);
              return;
            }

            toast.success(
              (t) => (
                <div className="flex flex-col gap-1">
                  <span className="font-medium">Payment successful!</span>
                  <span className="text-xs">Order #{order.orderNumber}</span>
                  <button
                    onClick={() => {
                      toast.dismiss(t.id);
                      navigate(`/track-order?order=${order.orderNumber}`);
                    }}
                    className="text-primary-600 hover:text-primary-700 text-xs font-medium text-left underline mt-1"
                  >
                    Track this order &rarr;
                  </button>
                </div>
              ),
              { duration: 6000 }
            );

            clearCart();
            navigate('/');
          },
          modal: {
            ondismiss: () => {
              toast.error(
                'Payment cancelled. Your order is saved - you can retry payment later.'
              );
              setLoading(false);
            },
          },
        };

        if (!window.Razorpay) {
          toast.error('Payment system failed to load. Please refresh and try again.');
          setLoading(false);
          return;
        }

        const rzp = new window.Razorpay(options);
        rzp.open();
        return;
      }

      // COD path
      if (orderCount === 1) {
        toast.success(
          (t) => (
            <div className="flex flex-col gap-1">
              <span className="font-medium">Order placed!</span>
              <span className="text-xs">#{firstOrderNumber}</span>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  navigate(`/track-order?order=${firstOrderNumber}`);
                }}
                className="text-primary-600 hover:text-primary-700 text-xs font-medium text-left underline mt-1"
              >
                Track this order &rarr;
              </button>
            </div>
          ),
          { duration: 6000 }
        );
      } else {
        toast.success(
          (t) => (
            <div className="flex flex-col gap-1">
              <span className="font-medium">{orderCount} orders placed!</span>
              <span className="text-xs">
                {result.orders.map((o) => `#${o.order.orderNumber}`).join(', ')}
              </span>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  navigate(`/track-order?order=${firstOrderNumber}`);
                }}
                className="text-primary-600 hover:text-primary-700 text-xs font-medium text-left underline mt-1"
              >
                Track your orders &rarr;
              </button>
            </div>
          ),
          { duration: 8000 }
        );
      }

      clearCart();
      navigate('/');
    } catch (error) {
      console.error('Place order error:', error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Steps Header */}
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
        {/* Left Column */}
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
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    error={errors.email}
                  />
                </div>
                <Input
                  label="Phone Number"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  error={errors.phone}
                />
                <Input
                  label="Address Line 1"
                  value={form.line1}
                  onChange={e => setForm({ ...form, line1: e.target.value })}
                  error={errors.line1}
                  placeholder="Street address"
                />
                <Input
                  label="Address Line 2 (Optional)"
                  value={form.line2}
                  onChange={e => setForm({ ...form, line2: e.target.value })}
                  placeholder="Apartment, suite, etc."
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
                  <Input label="Country" value={form.country} disabled />
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
                  <p className="font-medium text-surface-900">
                    {form.fullName} ({form.phone})
                  </p>
                  <p>{form.line1}</p>
                  {form.line2 && <p>{form.line2}</p>}
                  <p>
                    {form.city}, {form.state} - {form.pincode}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-surface-200 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="w-6 h-6 text-primary-600" />
                  <h2 className="text-xl font-bold text-surface-900">Payment Method</h2>
                </div>

                <div className="space-y-3 mb-6">
                  {/* Pay Online */}
                  <label
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      paymentMethod === 'online'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-surface-200 hover:border-primary-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={() => setPaymentMethod('online')}
                      className="sr-only"
                    />
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        paymentMethod === 'online'
                          ? 'bg-primary-600 text-white'
                          : 'bg-surface-100 text-surface-500'
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-surface-900">Pay Online</p>
                      <p className="text-xs text-surface-500 mt-0.5">
                        UPI, Credit Card, Debit Card, Netbanking - secured by Razorpay
                      </p>
                    </div>
                  </label>

                  {/* Cash on Delivery */}
                  <label
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      paymentMethod === 'cod'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-surface-200 hover:border-primary-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="sr-only"
                    />
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        paymentMethod === 'cod'
                          ? 'bg-primary-600 text-white'
                          : 'bg-surface-100 text-surface-500'
                      }`}
                    >
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-surface-900">Cash on Delivery</p>
                      <p className="text-xs text-surface-500 mt-0.5">
                        Pay in cash when your order is delivered to your doorstep
                      </p>
                    </div>
                  </label>
                </div>

                {paymentMethod === 'online' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-xs text-blue-800">
                    Razorpay checkout will open when you place your order. Your payment goes
                    directly to the seller's account.
                  </div>
                )}

                <Button
                  size="lg"
                  loading={loading}
                  onClick={handlePlaceOrder}
                  className="w-full sm:w-auto px-8"
                >
                  Place Order - ₹ {total.toLocaleString('en-IN')}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Order Summary */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-surface-200 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-surface-900 mb-6">Order Summary</h2>

            <ul className="space-y-4 mb-6">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-4">
                  <div className="relative">
                    <img
                      src={item.image ?? 'https://via.placeholder.com/64'}
                      alt={item.productName}
                      className="w-16 h-16 rounded-lg object-cover border border-surface-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://via.placeholder.com/64?text=No+Image';
                      }}
                    />
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-surface-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-900 line-clamp-2">
                      {item.productName}
                    </p>
                    {Object.keys(item.variantAttributes).length > 0 && (
                      <p className="text-xs text-surface-500 mt-0.5">
                        {Object.values(item.variantAttributes).join(' / ')}
                      </p>
                    )}
                    <p className="text-xs text-surface-500 mt-1">Sold by {item.companyName}</p>
                  </div>
                  <p className="text-sm font-medium text-surface-900">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </p>
                </li>
              ))}
            </ul>

            <div className="space-y-3 text-sm border-t border-surface-200 pt-4 mb-4">
              <div className="flex justify-between text-surface-600">
                <span>Subtotal</span>
                <span className="font-medium text-surface-900">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-surface-600">
                <span>Shipping</span>
                <span className="font-medium text-surface-900">
                  <span className="text-success-600">Free</span>
                </span>
              </div>
              <div className="flex justify-between text-surface-600">
                <span>Packaging</span>
                <span className="text-xs text-surface-500 italic">
                  Calculated at order placement
                </span>
              </div>
            </div>

            <div className="border-t border-surface-200 pt-4 mb-6">
              <div className="flex justify-between">
                <span className="text-base font-bold text-surface-900">Total</span>
                <span className="text-xl font-bold text-primary-600">
                ₹{total.toLocaleString('en-IN')}
                </span>
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