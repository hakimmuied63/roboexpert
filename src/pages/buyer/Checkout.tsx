import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  ArrowRight,
  Banknote,
  Check,
  CreditCard,
  Loader2,
  Lock,
  MapPin,
  Pencil,
  RotateCcw,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { placeOrder, createPaymentOrder, verifyPayment } from '../../lib/api';
import OtpPopup from '../../components/ui/OtpPopup';
import { getStoredUtm } from '../../lib/utm';
import toast from 'react-hot-toast';

gsap.registerPlugin(useGSAP);

declare global {
  interface Window {
    Razorpay: any;
  }
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const fmt = (n: number) => n.toLocaleString('en-IN');

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands',
  'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
  'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

/* -------------------------------------------------------------------------- */
/* Animated number                                                             */
/* -------------------------------------------------------------------------- */

function AnimatedNumber({ value, prefix = '₹' }: { value: number; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (shown.current === null || prefersReducedMotion()) {
      el.textContent = `${prefix}${fmt(value)}`;
      shown.current = value;
      return;
    }

    const obj = { v: shown.current };
    const tween = gsap.to(obj, {
      v: value,
      duration: 0.7,
      ease: 'power3.out',
      onUpdate: () => {
        shown.current = obj.v;
        el.textContent = `${prefix}${fmt(Math.round(obj.v))}`;
      },
      onComplete: () => {
        shown.current = value;
        el.textContent = `${prefix}${fmt(value)}`;
      },
    });

    return () => {
      tween.kill();
    };
  }, [value, prefix]);

  return <span ref={ref} className="tabular-nums" />;
}

/* -------------------------------------------------------------------------- */
/* Form fields                                                                 */
/* -------------------------------------------------------------------------- */

const fieldBase =
  'h-12 w-full rounded-2xl border bg-white px-4 text-sm text-[#20221d] placeholder:text-[#a5a69d] transition-colors duration-300 focus:outline-none disabled:cursor-not-allowed disabled:bg-[#f4f5ee] disabled:text-[#85877e]';

function FieldShell({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-[#7d8c60]">
        {label}
      </span>
      {children}
      {error && <span className="co-error mt-1.5 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

function TextField({
  label,
  error,
  ...props
}: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldShell label={label} error={error}>
      <input
        {...props}
        className={`${fieldBase} ${
          error ? 'border-red-400' : 'border-[#dcdbd2] focus:border-[#1d211a]'
        }`}
      />
    </FieldShell>
  );
}

function StateField({
  label,
  error,
  value,
  onChange,
}: {
  label: string;
  error?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <FieldShell label={label} error={error}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${fieldBase} appearance-none bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-10 ${
          error ? 'border-red-400' : 'border-[#dcdbd2] focus:border-[#1d211a]'
        } ${value ? '' : 'text-[#a5a69d]'}`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none' stroke='%23343a2d' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'><path d='M1 1.5l5 5 5-5'/></svg>\")",
        }}
      >
        <option value="">Select state</option>
        {STATES.map((s) => (
          <option key={s} value={s} className="text-[#20221d]">
            {s}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Payment option                                                              */
/* -------------------------------------------------------------------------- */

function PayOption({
  selected,
  onSelect,
  icon,
  title,
  sub,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    // NOTE: transition-colors only. transition-all would fight GSAP's opacity/transform.
    <label
      className={`co-pay relative flex cursor-pointer items-center gap-4 rounded-3xl border-2 p-4 transition-colors duration-300 sm:p-5 ${
        selected
          ? 'border-[#1d211a] bg-[#f4f9e6]'
          : 'border-[#e5e4dc] bg-white hover:border-[#a8c56e]'
      }`}
    >
      <input type="radio" name="payment" checked={selected} onChange={onSelect} className="sr-only" />
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
          selected ? 'bg-[#1d211a] text-[#c9f06b]' : 'bg-[#eff4e5] text-[#414b30]'
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-[#20221d] sm:text-base">{title}</span>
        <span className="mt-0.5 block text-xs leading-5 text-[#6b6e63]">{sub}</span>
      </span>
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
          selected ? 'border-[#1d211a] bg-[#1d211a]' : 'border-[#cfcfc6]'
        }`}
      >
        <Check
          className={`h-3.5 w-3.5 text-[#c9f06b] transition-transform duration-300 ${
            selected ? 'scale-100' : 'scale-0'
          }`}
        />
      </span>
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/* Checkout                                                                    */
/* -------------------------------------------------------------------------- */

export function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const appliedCoupon = location.state?.coupon;

  const root = useRef<HTMLDivElement>(null);
  const orderDone = useRef(false);

  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
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
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const total = Math.max(0, subtotal + shipping - discountAmount);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  /* ----------------------------- effects ---------------------------- */

  // empty cart -> back to cart (skipped once an order has gone through)
  useEffect(() => {
    if (items.length === 0 && !orderDone.current) {
      navigate('/cart', { replace: true });
    }
  }, [items.length, navigate]);

  // page entrance
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      tl.from('.co-word', { yPercent: 120, rotate: 5, duration: 1.2, stagger: 0.07 }, 0)
        .from('.co-fade', { y: 24, opacity: 0, duration: 1, stagger: 0.08 }, 0.15)
        .from('.co-summary', { y: 50, opacity: 0, duration: 1.2 }, 0.35);
    },
    { scope: root },
  );

  // step change: progress line + panels
  // fromTo + clearProps so nothing can ever stay stuck hidden
  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        gsap.set('.co-progress', { scaleX: step === 2 ? 1 : 0 });
        return;
      }

      gsap.to('.co-progress', {
        scaleX: step === 2 ? 1 : 0,
        duration: 0.9,
        ease: 'power3.inOut',
      });

      gsap.fromTo(
        '.co-panel',
        { y: 34, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'expo.out',
          stagger: 0.1,
          clearProps: 'opacity,transform',
        },
      );

      gsap.fromTo(
        '.co-field',
        { y: 18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.04,
          ease: 'power3.out',
          delay: 0.1,
          clearProps: 'opacity,transform',
        },
      );

      gsap.fromTo(
        '.co-pay',
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          delay: 0.15,
          clearProps: 'opacity,transform',
        },
      );
    },
    { scope: root, dependencies: [step] },
  );

  // validation errors shake in
  const errorKey = Object.keys(errors).join(',');
  useGSAP(
    () => {
      if (!errorKey || prefersReducedMotion()) return;
      gsap.fromTo(
        '.co-error',
        { x: -8, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'elastic.out(1, 0.35)',
          clearProps: 'opacity,transform',
        },
      );
    },
    { scope: root, dependencies: [errorKey] },
  );

  const goToStep = (next: 1 | 2) => {
    setStep(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* --------------------------- validation --------------------------- */

  const validateShipping = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    else if (form.phone.replace(/\D/g, '').length < 10) e.phone = 'Enter a valid 10-digit number';
    if (!form.line1.trim()) e.line1 = 'Address is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.state.trim()) e.state = 'State is required';
    if (!form.pincode.trim()) e.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(form.pincode.trim())) e.pincode = 'Enter a 6-digit PIN code';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateShipping()) goToStep(2);
  };

  const handlePlaceOrder = () => {
    if (!form.email) {
      toast.error('Please enter your email first.');
      return;
    }
    setShowOtp(true);
  };

  /* ---------------------------- place order ---------------------------- */

  const executeOrder = async () => {
    setLoading(true);

    try {
      const utm = getStoredUtm();

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
        utm,
        couponCode: appliedCoupon?.coupon?.code,
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
            'Online payment is not available for multi-seller carts yet. Please choose COD or split your order.',
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
            color: '#1d211a',
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
                    className="mt-1 text-left text-xs font-medium text-[#4d5f33] underline hover:text-[#1d211a]"
                  >
                    Track this order &rarr;
                  </button>
                </div>
              ),
              { duration: 6000 },
            );

            orderDone.current = true;
            clearCart();
            navigate('/');
          },
          modal: {
            ondismiss: () => {
              toast.error('Payment cancelled. Your order is saved - you can retry payment later.');
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
                className="mt-1 text-left text-xs font-medium text-[#4d5f33] underline hover:text-[#1d211a]"
              >
                Track this order &rarr;
              </button>
            </div>
          ),
          { duration: 6000 },
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
                className="mt-1 text-left text-xs font-medium text-[#4d5f33] underline hover:text-[#1d211a]"
              >
                Track your orders &rarr;
              </button>
            </div>
          ),
          { duration: 8000 },
        );
      }

      orderDone.current = true;
      clearCart();
      navigate('/');
    } catch (error) {
      console.error('Place order error:', error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------ view ------------------------------ */

  if (items.length === 0) return null;

  const steps = [
    { n: 1, label: 'Shipping' },
    { n: 2, label: 'Payment' },
  ];

  return (
    <div
      ref={root}
      className="roboexpert-checkout relative min-h-screen overflow-x-clip bg-[#faf9f6] pb-20 text-[#20221d]"
    >
      <div className="mx-auto max-w-[1440px] px-4 pt-6 sm:px-6 sm:pt-10 lg:px-10">
        {/* Heading */}
        <div className="mb-8 sm:mb-12">
          <p className="co-fade mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#7d8c60]">
            Secure checkout
          </p>
          <h1 className="font-serif text-5xl font-medium tracking-[-0.055em] sm:text-6xl lg:text-7xl">
            {['Almost', 'yours.'].map((w, i) => (
              <span
                key={i}
                className="-mb-[0.12em] mr-[0.22em] inline-block overflow-hidden pb-[0.12em] align-top"
              >
                <span className="co-word inline-block">{w}</span>
              </span>
            ))}
          </h1>
        </div>

        {/* Stepper */}
        <div className="co-fade mb-10 flex max-w-md items-center sm:mb-14">
          {steps.map((s, i) => {
            const done = step > s.n;
            const active = step === s.n;
            return (
              <div key={s.n} className="flex flex-1 items-center last:flex-none">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-500 ${
                      done
                        ? 'border-[#c9f06b] bg-[#c9f06b] text-[#1d211a]'
                        : active
                        ? 'border-[#1d211a] bg-[#1d211a] text-white'
                        : 'border-[#dcdbd2] bg-white text-[#a5a69d]'
                    }`}
                  >
                    {done ? <Check className="h-4 w-4" /> : s.n}
                  </span>
                  <span
                    className={`text-sm font-semibold transition-colors duration-500 ${
                      active || done ? 'text-[#20221d]' : 'text-[#a5a69d]'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="relative mx-4 h-[3px] flex-1 overflow-hidden rounded-full bg-[#e5e4dc]">
                    <div className="co-progress absolute inset-0 origin-left scale-x-0 rounded-full bg-gradient-to-r from-[#a8d530] to-[#c9f06b]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col items-start gap-8 lg:flex-row lg:gap-12">
          {/* ------------------------ Left column ------------------------ */}
          <div className="w-full flex-1">
            {step === 1 ? (
              <div className="co-panel rounded-[1.75rem] border border-[#e5e4dc] bg-white p-6 sm:p-9">
                <div className="mb-8 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eff4e5] text-[#414b30]">
                    <MapPin className="h-5 w-5" strokeWidth={1.7} />
                  </span>
                  <div>
                    <h2 className="font-serif text-2xl font-medium tracking-[-0.04em] sm:text-3xl">
                      Where should we send it?
                    </h2>
                    <span className="mt-2 block h-[2px] w-12 bg-[#a8d530]" />
                  </div>
                </div>

                <form onSubmit={handleContinueToPayment} className="space-y-5" noValidate>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="co-field">
                      <TextField
                        label="Full name"
                        value={form.fullName}
                        onChange={set('fullName')}
                        error={errors.fullName}
                        autoComplete="name"
                      />
                    </div>
                    <div className="co-field">
                      <TextField
                        label="Email"
                        type="email"
                        value={form.email}
                        onChange={set('email')}
                        error={errors.email}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="co-field">
                    <TextField
                      label="Phone number"
                      type="tel"
                      inputMode="tel"
                      value={form.phone}
                      onChange={set('phone')}
                      error={errors.phone}
                      autoComplete="tel"
                    />
                  </div>

                  <div className="co-field">
                    <TextField
                      label="Address line 1"
                      value={form.line1}
                      onChange={set('line1')}
                      error={errors.line1}
                      placeholder="Street address"
                      autoComplete="address-line1"
                    />
                  </div>

                  <div className="co-field">
                    <TextField
                      label="Address line 2 (optional)"
                      value={form.line2}
                      onChange={set('line2')}
                      placeholder="Apartment, suite, etc."
                      autoComplete="address-line2"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="co-field">
                      <TextField
                        label="City"
                        value={form.city}
                        onChange={set('city')}
                        error={errors.city}
                        autoComplete="address-level2"
                      />
                    </div>
                    <div className="co-field">
                      <StateField
                        label="State"
                        value={form.state}
                        onChange={(v) => setForm((f) => ({ ...f, state: v }))}
                        error={errors.state}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="co-field">
                      <TextField
                        label="PIN code"
                        inputMode="numeric"
                        maxLength={6}
                        value={form.pincode}
                        onChange={set('pincode')}
                        error={errors.pincode}
                        autoComplete="postal-code"
                      />
                    </div>
                    <div className="co-field">
                      <TextField label="Country" value={form.country} disabled readOnly />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="co-shine group relative mt-4 flex h-14 w-full items-center justify-between overflow-hidden rounded-full bg-[#1d211a] py-2 pl-7 pr-2 text-sm font-semibold text-white shadow-[0_18px_40px_-18px_rgba(29,33,26,0.7)] transition-colors duration-300 hover:bg-[#343a2d] sm:w-auto sm:min-w-[320px]"
                  >
                    Continue to payment
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c9f06b] text-[#1d211a] transition-transform duration-500 group-hover:rotate-[-35deg]">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Address recap */}
                <div className="co-panel rounded-[1.75rem] border border-[#e5e4dc] bg-white p-6 sm:p-8">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#c9f06b] text-[#1d211a]">
                        <Check className="h-5 w-5" />
                      </span>
                      <h2 className="font-serif text-2xl font-medium tracking-[-0.04em]">
                        Delivering to
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => goToStep(1)}
                      className="group inline-flex items-center gap-1.5 rounded-full border border-[#dcdbd2] px-4 py-2 text-xs font-semibold text-[#343a2d] transition-colors hover:border-[#1d211a]"
                    >
                      <Pencil className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-rotate-12" />
                      Edit
                    </button>
                  </div>

                  <div className="rounded-2xl bg-[#f4f5ee] p-5 text-sm leading-7 text-[#555951]">
                    <p className="font-semibold text-[#20221d]">
                      {form.fullName}{' '}
                      <span className="font-normal text-[#85877e]">· {form.phone}</span>
                    </p>
                    <p>{form.line1}</p>
                    {form.line2 && <p>{form.line2}</p>}
                    <p>
                      {form.city}, {form.state} - {form.pincode}
                    </p>
                    <p className="text-[#85877e]">{form.email}</p>
                  </div>
                </div>

                {/* Payment */}
                <div className="co-panel rounded-[1.75rem] border border-[#e5e4dc] bg-white p-6 sm:p-9">
                  <div className="mb-7 flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eff4e5] text-[#414b30]">
                      <CreditCard className="h-5 w-5" strokeWidth={1.7} />
                    </span>
                    <div>
                      <h2 className="font-serif text-2xl font-medium tracking-[-0.04em] sm:text-3xl">
                        How would you like to pay?
                      </h2>
                      <span className="mt-2 block h-[2px] w-12 bg-[#a8d530]" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <PayOption
                      selected={paymentMethod === 'online'}
                      onSelect={() => setPaymentMethod('online')}
                      icon={<CreditCard className="h-5 w-5" strokeWidth={1.7} />}
                      title="Pay online"
                      sub="UPI, credit card, debit card, netbanking. Secured by Razorpay."
                    />
                    <PayOption
                      selected={paymentMethod === 'cod'}
                      onSelect={() => setPaymentMethod('cod')}
                      icon={<Banknote className="h-5 w-5" strokeWidth={1.7} />}
                      title="Cash on delivery"
                      sub="Pay in cash when your order reaches your doorstep."
                    />
                  </div>

                  {paymentMethod === 'online' && (
                    <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#d6e6b4] bg-[#f4f9e6] p-4 text-xs leading-5 text-[#4d5f33]">
                      <Lock className="mt-0.5 h-4 w-4 shrink-0" />
                      <p>
                        Razorpay checkout opens when you place your order. Your payment goes
                        directly to the seller's account.
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="co-shine group relative mt-7 flex h-14 w-full items-center justify-between overflow-hidden rounded-full bg-[#1d211a] py-2 pl-7 pr-2 text-sm font-semibold text-white shadow-[0_18px_40px_-18px_rgba(29,33,26,0.7)] transition-colors duration-300 hover:bg-[#343a2d] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:min-w-[360px]"
                  >
                    <span>
                      {loading ? 'Placing order…' : `Place order · ₹${fmt(total)}`}
                    </span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c9f06b] text-[#1d211a] transition-transform duration-500 group-hover:rotate-[-35deg]">
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ------------------------ Summary ------------------------ */}
          <aside className="co-summary w-full shrink-0 lg:sticky lg:top-24 lg:w-[420px]">
            <div className="rounded-[1.75rem] border border-[#e5e4dc] bg-white p-6 shadow-[0_40px_90px_-50px_rgba(32,37,27,0.45)] sm:p-7">
              <h2 className="font-serif text-3xl font-medium tracking-[-0.05em]">
                Order summary
              </h2>
              <span className="mt-3 block h-[2px] w-12 bg-[#a8d530]" />

              <ul className="mt-7 max-h-[340px] space-y-5 overflow-y-auto pr-1">
                {items.map((item) => {
                  const attrs = Object.values(item.variantAttributes ?? {});
                  return (
                    <li key={item.variantId} className="flex gap-4">
                      <div className="relative h-[72px] w-[72px] shrink-0">
                        <img
                          src={item.image ?? '/placeholder.svg'}
                          alt={item.productName}
                          className="h-full w-full rounded-2xl bg-[#e9e7df] object-cover ring-1 ring-black/5"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                        <span className="absolute -right-2 -top-2 flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-[#1d211a] px-1.5 text-[11px] font-semibold text-white ring-2 ring-white">
                          {item.quantity}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-semibold leading-snug tracking-[-0.01em] text-[#20221d]">
                          {item.productName}
                        </p>
                        {attrs.length > 0 && (
                          <p className="mt-1 text-xs text-[#85877e]">{attrs.join(' / ')}</p>
                        )}
                        <p className="mt-0.5 text-xs text-[#85877e]">Sold by {item.companyName}</p>
                      </div>

                      <p className="text-sm font-semibold tabular-nums text-[#20221d]">
                        ₹{fmt(item.price * item.quantity)}
                      </p>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6 space-y-3.5 border-t border-[#eeede6] pt-6 text-sm">
                <div className="flex items-center justify-between text-[#555951]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#20221d]">
                    <AnimatedNumber value={subtotal} />
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#555951]">
                  <span>Shipping</span>
                  <span className="rounded-full bg-[#eff4e5] px-2.5 py-1 text-xs font-semibold text-[#4d5f33]">
                    Free
                  </span>
                </div>

                {appliedCoupon && (
                  <div className="flex items-center justify-between font-semibold text-[#4d5f33]">
                    <span className="inline-flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5" />
                      Discount
                      <span className="rounded-full border border-dashed border-[#a8c56e] bg-[#f4f9e6] px-2 py-0.5 font-mono text-[10px] tracking-[0.14em]">
                        {appliedCoupon.coupon.code}
                      </span>
                    </span>
                    <AnimatedNumber value={discountAmount} prefix="− ₹" />
                  </div>
                )}

                <div className="flex items-center justify-between text-[#555951]">
                  <span>Packaging</span>
                  <span className="text-xs italic text-[#85877e]">
                    Calculated at order placement
                  </span>
                </div>
              </div>

              <div className="relative mt-6 overflow-hidden rounded-2xl bg-[#20251b] px-5 py-5 text-white">
                <div className="pointer-events-none absolute -left-8 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-[#c9f06b]/25 blur-3xl" />
                <div className="relative flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
                      Total
                    </p>
                    <p className="mt-0.5 text-[11px] text-white/45">Inclusive of all taxes</p>
                  </div>
                  <p className="font-serif text-4xl font-medium tracking-[-0.04em]">
                    <AnimatedNumber value={total} />
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-[#eeede6] pt-5">
                <div className="flex items-center gap-2 text-xs text-[#555951]">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-[#4d5f33]" />
                  Safe and secure
                </div>
                <div className="flex items-center gap-2 text-xs text-[#555951]">
                  <RotateCcw className="h-4 w-4 shrink-0 text-[#4d5f33]" />
                  7-day returns
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {showOtp && (
        <OtpPopup
          email={form.email}
          purpose="checkout"
          onVerified={() => {
            setShowOtp(false);
            void executeOrder();
          }}
          onClose={() => setShowOtp(false)}
        />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap');

        .roboexpert-checkout {
          font-family: 'DM Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }

        .roboexpert-checkout .font-serif {
          font-family: 'Playfair Display', Georgia, serif;
        }

        .roboexpert-checkout ::selection {
          background: #c9f06b;
          color: #1d211a;
        }

        .co-shine::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%);
          transform: translateX(-120%);
          transition: transform 0.9s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .co-shine:not(:disabled):hover::after {
          transform: translateX(120%);
        }
      `}</style>
    </div>
  );
}