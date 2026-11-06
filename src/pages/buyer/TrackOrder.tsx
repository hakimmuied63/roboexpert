import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileText,
  Home as HomeIcon,
  Loader2,
  MapPin,
  Package,
  RotateCcw,
  Search,
  Truck,
  X,
} from 'lucide-react';
import {
  trackOrder as trackOrderApi,
  cancelOrder as cancelOrderApi,
  requestReturn as requestReturnApi,
  getInvoiceUrl,
  type TrackedOrder,
  type TrackedOrderItem,
} from '../../lib/api';
import toast from 'react-hot-toast';

gsap.registerPlugin(useGSAP);

const LAST_EMAIL_KEY = 'roboexpert_last_order_email';

const CANCEL_REASONS = [
  'Changed my mind',
  'Ordered wrong item / size',
  'Found a better price',
  'Delivery taking too long',
  'No longer needed',
  'Other',
];

const RETURN_REASONS = [
  'Product damaged',
  'Wrong item received',
  'Item not as described',
  'Size does not fit',
  'Quality not as expected',
  'Other',
];

const STATUS_STEPS = ['placed', 'confirmed', 'shipped', 'delivered'];
const STEP_ICONS = [Package, CheckCircle2, Truck, HomeIcon];

const statusStyles: Record<string, string> = {
  placed: 'border-[#dcdbd2] bg-[#f4f5ee] text-[#555951]',
  confirmed: 'border-[#d6e6b4] bg-[#eff4e5] text-[#4d5f33]',
  shipped: 'border-[#1d211a] bg-[#1d211a] text-white',
  delivered: 'border-[#c9f06b] bg-[#c9f06b] text-[#1d211a]',
  cancelled: 'border-red-200 bg-red-50 text-red-700',
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const fmt = (n: number) => n.toLocaleString('en-IN');
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const fieldBase =
  'h-12 w-full rounded-2xl border bg-white px-4 text-sm text-[#20221d] placeholder:text-[#a5a69d] transition-colors duration-300 focus:outline-none';

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
      duration: 0.9,
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
/* Reason modal (used for both cancel and return)                              */
/* -------------------------------------------------------------------------- */

interface ReasonModalProps {
  title: string;
  subtitle: string;
  reasons: string[];
  reason: string;
  onReason: (v: string) => void;
  note: string;
  onNote: (v: string) => void;
  notePlaceholder: string;
  confirmLabel: string;
  dismissLabel: string;
  onConfirm: () => void;
  submitting: boolean;
  danger?: boolean;
  onClose: () => void;
}

function ReasonModal({
  title,
  subtitle,
  reasons,
  reason,
  onReason,
  note,
  onNote,
  notePlaceholder,
  confirmLabel,
  dismissLabel,
  onConfirm,
  submitting,
  danger,
  onClose,
}: ReasonModalProps) {
  const root = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  const close = () => {
    if (submitting) return;
    if (prefersReducedMotion() || !panel.current || !backdrop.current) {
      onClose();
      return;
    }
    gsap.to(panel.current, { y: 20, opacity: 0, scale: 0.97, duration: 0.3, ease: 'power2.in' });
    gsap.to(backdrop.current, { opacity: 0, duration: 0.3, onComplete: onClose });
  };

  const closeRef = useRef(close);
  closeRef.current = close;

  // entrance
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo('.rm-backdrop', { opacity: 0 }, { opacity: 1, duration: 0.4, clearProps: 'opacity' });
      gsap.fromTo(
        '.rm-panel',
        { y: 34, opacity: 0, scale: 0.96 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: 'expo.out',
          clearProps: 'opacity,transform',
        },
      );
    },
    { scope: root },
  );

  // escape key + scroll lock
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div ref={root} className="roboexpert-track fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        ref={backdrop}
        onClick={close}
        className="rm-backdrop absolute inset-0 bg-[#14170f]/60 backdrop-blur-sm"
      />

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="rm-panel relative w-full max-w-md rounded-[1.75rem] bg-white p-6 shadow-[0_40px_90px_-30px_rgba(20,23,15,0.6)] sm:p-8"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={close}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-[#555951] transition-colors hover:bg-[#eff4e5]"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="font-serif text-3xl font-medium tracking-[-0.05em]">{title}</h2>
        <span className="mt-3 block h-[2px] w-12 bg-[#a8d530]" />
        <p className="mt-4 text-sm text-[#85877e]">{subtitle}</p>

        <div className="mt-6 space-y-5">
          <label className="block">
            <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-[#7d8c60]">
              Reason
            </span>
            <select
              value={reason}
              onChange={(e) => onReason(e.target.value)}
              className={`${fieldBase} appearance-none border-[#dcdbd2] bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-10 focus:border-[#1d211a]`}
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none' stroke='%23343a2d' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'><path d='M1 1.5l5 5 5-5'/></svg>\")",
              }}
            >
              {reasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-[#7d8c60]">
              Additional notes (optional)
            </span>
            <textarea
              value={note}
              onChange={(e) => onNote(e.target.value)}
              rows={3}
              placeholder={notePlaceholder}
              className="w-full resize-none rounded-2xl border border-[#dcdbd2] bg-white px-4 py-3 text-sm text-[#20221d] transition-colors duration-300 placeholder:text-[#a5a69d] focus:border-[#1d211a] focus:outline-none"
            />
          </label>

          <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={close}
              disabled={submitting}
              className="h-12 rounded-full border border-[#dcdbd2] px-6 text-sm font-semibold text-[#343a2d] transition-colors hover:border-[#1d211a] disabled:opacity-50"
            >
              {dismissLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={submitting}
              className={`flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${
                danger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#1d211a] hover:bg-[#343a2d]'
              }`}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Track order                                                                 */
/* -------------------------------------------------------------------------- */

export function TrackOrder() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlOrderNumber = searchParams.get('order') ?? '';

  const root = useRef<HTMLDivElement>(null);
  const autoLooked = useRef(false);
  const autoOpened = useRef(false);
  const shouldScroll = useRef(false);

  const [orderNumber, setOrderNumber] = useState(urlOrderNumber);
  const [email, setEmail] = useState(() => {
    const fromUrl = searchParams.get('email');
    if (fromUrl) return fromUrl;
    try {
      return localStorage.getItem(LAST_EMAIL_KEY) ?? '';
    } catch {
      return '';
    }
  });
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [items, setItems] = useState<TrackedOrderItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Cancel modal
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
  const [cancelNote, setCancelNote] = useState('');
  const [cancelSubmitting, setCancelSubmitting] = useState(false);

  // Return modal
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnReason, setReturnReason] = useState(RETURN_REASONS[0]);
  const [returnNote, setReturnNote] = useState('');
  const [returnSubmitting, setReturnSubmitting] = useState(false);

  /* ---------------------------- lookup ---------------------------- */

  const handleLookup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (e) shouldScroll.current = true;

    const trimmedOrder = orderNumber.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedOrder) {
      setError('Order number is required');
      return;
    }
    if (!trimmedEmail) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);
    setItems([]);

    try {
      const result = await trackOrderApi(trimmedOrder, trimmedEmail);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setOrder(result.data.order);
      setItems(result.data.items);

      try {
        localStorage.setItem(LAST_EMAIL_KEY, trimmedEmail);
      } catch {
        // ignore
      }

      const params = new URLSearchParams(searchParams);
      params.set('order', trimmedOrder);
      setSearchParams(params, { replace: true });
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-lookup if the URL has an order number (e.g. from checkout)
  useEffect(() => {
    if (autoLooked.current) return;
    autoLooked.current = true;
    if (urlOrderNumber && email) void handleLookup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-open cancel modal once if ?action=cancel
  useEffect(() => {
    if (autoOpened.current) return;
    const action = searchParams.get('action');
    if (action === 'cancel' && order && (order.status === 'placed' || order.status === 'confirmed')) {
      autoOpened.current = true;
      setCancelOpen(true);
    }
  }, [order, searchParams]);

  /* ---------------------------- actions ---------------------------- */

  const handleCancel = async () => {
    if (!order) return;
    setCancelSubmitting(true);

    try {
      const result = await cancelOrderApi(
        order.orderNumber,
        order.buyer.email,
        cancelReason,
        cancelNote || undefined,
      );

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success('Order cancelled');
      setOrder({ ...order, ...result.data.order });
      setCancelOpen(false);
      setCancelReason(CANCEL_REASONS[0]);
      setCancelNote('');
    } catch {
      toast.error('Could not cancel the order. Try again.');
    } finally {
      setCancelSubmitting(false);
    }
  };

  const handleReturn = async () => {
    if (!order) return;
    setReturnSubmitting(true);

    try {
      const result = await requestReturnApi(
        order.orderNumber,
        order.buyer.email,
        returnReason,
        returnNote || undefined,
      );

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success('Return request submitted');
      setOrder({ ...order, ...result.data.order });
      setReturnOpen(false);
      setReturnReason(RETURN_REASONS[0]);
      setReturnNote('');
    } catch {
      toast.error('Could not submit the return. Try again.');
    } finally {
      setReturnSubmitting(false);
    }
  };

  /* ---------------------------- derived ---------------------------- */

  const canCancel = !!order && (order.status === 'placed' || order.status === 'confirmed');
  const canReturn = !!order && order.status === 'delivered' && !order.returnStatus;

  const resultKey = order && !loading ? order.orderNumber : '';
  const currentIdx = order ? STATUS_STEPS.indexOf(order.status) : -1;
  const progressTarget = currentIdx <= 0 ? 0 : currentIdx / (STATUS_STEPS.length - 1);
  const alertKey = `${order?.status}|${order?.returnStatus}|${order?.refundStatus}`;
  const prevAlert = useRef({ key: '', num: '' });

  /* ----------------------------- motion ----------------------------- */

  // page entrance
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap
        .timeline({ defaults: { ease: 'expo.out' } })
        .from('.to-word', { yPercent: 120, rotate: 5, duration: 1.2, stagger: 0.07 }, 0)
        .from(
          '.to-fade',
          { y: 24, opacity: 0, duration: 1, stagger: 0.08, clearProps: 'opacity,transform' },
          0.15,
        );
    },
    { scope: root },
  );

  // result entrance
  useGSAP(
    () => {
      if (!resultKey) return;

      if (shouldScroll.current) {
        shouldScroll.current = false;
        window.setTimeout(() => {
          document.getElementById('track-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
      }

      if (prefersReducedMotion()) return;

      gsap.fromTo(
        '.to-card',
        { y: 44, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.1,
          ease: 'expo.out',
          stagger: 0.12,
          clearProps: 'opacity,transform',
        },
      );

      gsap.fromTo(
        '.to-step',
        { scale: 0.6, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: 'back.out(2)',
          stagger: 0.1,
          delay: 0.3,
          clearProps: 'opacity,transform',
        },
      );

      gsap.fromTo(
        '.to-item',
        { y: 18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.07,
          delay: 0.45,
          clearProps: 'opacity,transform',
        },
      );
    },
    { scope: root, dependencies: [resultKey] },
  );

  // tracker progress line
  useGSAP(
    () => {
      if (!resultKey) return;
      if (!root.current?.querySelector('.to-progress')) return;

      if (prefersReducedMotion()) {
        gsap.set('.to-progress', { scaleX: progressTarget });
        return;
      }

      gsap.fromTo(
        '.to-progress',
        { scaleX: 0 },
        { scaleX: progressTarget, duration: 1.4, ease: 'power3.inOut', delay: 0.5 },
      );
    },
    { scope: root, dependencies: [resultKey, progressTarget] },
  );

  // status / return alerts drop in when they change (e.g. right after cancelling)
  useGSAP(
    () => {
      if (!resultKey) return;
      const p = prevAlert.current;
      const changed = p.num === resultKey && p.key !== alertKey;
      prevAlert.current = { key: alertKey, num: resultKey };

      if (!changed || prefersReducedMotion()) return;

      gsap.fromTo(
        '.to-alert',
        { y: -14, opacity: 0, scale: 0.97 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: 'back.out(1.8)',
          clearProps: 'opacity,transform',
        },
      );
    },
    { scope: root, dependencies: [alertKey, resultKey] },
  );

  // lookup error shakes in
  useGSAP(
    () => {
      if (!error || prefersReducedMotion()) return;
      gsap.fromTo(
        '.to-error',
        { x: -10, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'elastic.out(1, 0.35)',
          clearProps: 'opacity,transform',
        },
      );
    },
    { scope: root, dependencies: [error] },
  );

  /* ------------------------------ view ------------------------------ */

  return (
    <div
      ref={root}
      className="roboexpert-track relative min-h-screen overflow-x-clip bg-[#faf9f6] pb-20 text-[#20221d]"
    >
      <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 sm:pt-12 lg:px-10">
        {/* Heading */}
        <div className="mb-10 sm:mb-14">
          <p className="to-fade mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#7d8c60]">
            Order tracking
          </p>
          <h1 className="font-serif text-5xl font-medium tracking-[-0.055em] sm:text-6xl lg:text-7xl">
            {["Where's", 'my', 'order?'].map((w, i) => (
              <span
                key={i}
                className="-mb-[0.12em] mr-[0.22em] inline-block overflow-hidden pb-[0.12em] align-top"
              >
                <span className="to-word inline-block">{w}</span>
              </span>
            ))}
          </h1>
          <p className="to-fade mt-5 max-w-md text-sm leading-7 text-[#555951] sm:text-base">
            Enter your order number and the email you used at checkout. You'll find both in your
            confirmation email.
          </p>
        </div>

        {/* Lookup form */}
        <form
          onSubmit={handleLookup}
          noValidate
          className="to-fade rounded-[1.75rem] border border-[#e5e4dc] bg-white p-6 shadow-[0_40px_90px_-50px_rgba(32,37,27,0.45)] sm:p-9"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-[#7d8c60]">
                Order number
              </span>
              <input
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                placeholder="ORD-2026-XXXXXX"
                autoFocus
                className={`${fieldBase} border-[#dcdbd2] font-mono tracking-[0.08em] placeholder:font-sans placeholder:tracking-normal focus:border-[#1d211a]`}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-[#7d8c60]">
                Email address
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className={`${fieldBase} border-[#dcdbd2] focus:border-[#1d211a]`}
              />
            </label>
          </div>

          {error && (
            <div className="to-error mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="to-shine group relative mt-6 flex h-14 w-full items-center justify-between overflow-hidden rounded-full bg-[#1d211a] py-2 pl-7 pr-2 text-sm font-semibold text-white shadow-[0_18px_40px_-18px_rgba(29,33,26,0.7)] transition-colors duration-300 hover:bg-[#343a2d] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:min-w-[300px]"
          >
            {loading ? 'Finding your order…' : 'Find my order'}
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c9f06b] text-[#1d211a] transition-transform duration-500 group-hover:rotate-[-35deg]">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </span>
          </button>
        </form>

        {/* ------------------------- Result ------------------------- */}
        {order && !loading && (
          <div id="track-result" className="mt-12 scroll-mt-24 space-y-6 sm:mt-16">
            {/* Status card */}
            <section className="to-card rounded-[1.75rem] border border-[#e5e4dc] bg-white p-6 sm:p-9">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#7d8c60]">
                    Order number
                  </p>
                  <p className="mt-1.5 font-serif text-3xl font-medium tracking-[-0.04em] sm:text-4xl">
                    {order.orderNumber}
                  </p>
                  <p className="mt-2 text-sm text-[#85877e]">
                    Placed on{' '}
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <span
                  className={`inline-flex items-center rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] ${
                    statusStyles[order.status] ?? 'border-[#dcdbd2] bg-[#f4f5ee] text-[#555951]'
                  }`}
                >
                  {cap(order.status)}
                </span>
              </div>

              {/* Tracker */}
              {order.status !== 'cancelled' && (
                <div className="relative mt-10">
                  <div className="absolute left-[12.5%] right-[12.5%] top-[22px] h-[3px] overflow-hidden rounded-full bg-[#e5e4dc]">
                    <div className="to-progress h-full origin-left scale-x-0 rounded-full bg-gradient-to-r from-[#a8d530] to-[#c9f06b]" />
                  </div>

                  <ol className="relative grid grid-cols-4">
                    {STATUS_STEPS.map((step, idx) => {
                      const isDone = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;
                      const Icon = STEP_ICONS[idx];
                      const isFinal = step === 'delivered' && isCurrent;

                      return (
                        <li key={step} className="flex flex-col items-center text-center">
                          <div className="relative h-11 w-11">
                            {isCurrent && !isFinal && (
                              <span className="absolute inset-0 animate-ping rounded-full bg-[#a8d530]/40" />
                            )}
                            <span
                              className={`to-step absolute inset-0 flex items-center justify-center rounded-full border-2 transition-colors duration-500 ${
                                isFinal
                                  ? 'border-[#c9f06b] bg-[#c9f06b] text-[#1d211a]'
                                  : isDone
                                  ? 'border-[#1d211a] bg-[#1d211a] text-[#c9f06b]'
                                  : 'border-[#dcdbd2] bg-white text-[#a5a69d]'
                              }`}
                            >
                              <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                            </span>
                          </div>
                          <span
                            className={`mt-3 text-xs font-semibold capitalize sm:text-sm ${
                              isDone ? 'text-[#20221d]' : 'text-[#a5a69d]'
                            }`}
                          >
                            {step}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}

              {/* Cancelled */}
              {order.status === 'cancelled' && (
                <div className="to-alert mt-8 rounded-2xl border border-red-200 bg-red-50 p-5">
                  <p className="text-sm font-semibold text-red-800">This order was cancelled</p>
                  {order.cancellationReason && (
                    <p className="mt-1.5 text-xs text-red-700">Reason: {order.cancellationReason}</p>
                  )}
                  {order.cancellationNote && (
                    <p className="mt-1 text-xs text-red-700">Note: {order.cancellationNote}</p>
                  )}
                </div>
              )}

              {/* Return + refund */}
              {order.returnStatus && (
                <div className="to-alert mt-8 rounded-2xl border border-[#f0dfa8] bg-[#fff8e6] p-5">
                  <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-[#7a5b00]">
                      Return {cap(order.returnStatus)}
                    </p>
                    {order.refundStatus && (
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${
                          order.refundStatus === 'completed'
                            ? 'bg-[#eff4e5] text-[#4d5f33]'
                            : order.refundStatus === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-[#fdecb0] text-[#7a5b00]'
                        }`}
                      >
                        Refund: {order.refundStatus}
                      </span>
                    )}
                  </div>

                  {order.returnReason && (
                    <p className="text-xs text-[#8a6a10]">Reason: {order.returnReason}</p>
                  )}
                  {order.returnNote && (
                    <p className="mt-1 text-xs text-[#8a6a10]">Note: {order.returnNote}</p>
                  )}

                  {order.returnStatus === 'requested' && (
                    <p className="mt-3 text-xs font-medium text-[#7a5b00]">
                      Waiting for the seller to review your request.
                    </p>
                  )}
                  {order.returnStatus === 'approved' && (
                    <p className="mt-3 text-xs font-medium text-[#7a5b00]">
                      Approved. Please ship the item back to the seller.
                    </p>
                  )}
                  {order.returnStatus === 'rejected' && (
                    <p className="mt-3 text-xs font-medium text-red-700">
                      Your return request was rejected by the seller.
                    </p>
                  )}
                  {order.returnStatus === 'completed' && order.refundStatus === 'completed' && (
                    <p className="mt-3 text-xs font-medium text-[#4d5f33]">
                      Return completed and refund issued
                      {order.refundAmount != null ? `: ₹${fmt(order.refundAmount)}` : ''}
                      {order.refundId ? ` (Refund ID: ${order.refundId})` : ''}.
                    </p>
                  )}
                  {order.returnStatus === 'completed' && order.refundStatus === 'failed' && (
                    <p className="mt-3 text-xs font-medium text-red-700">
                      Return completed, but the refund failed. Please contact support. The seller
                      will retry the refund manually.
                    </p>
                  )}
                  {order.returnStatus === 'completed' &&
                    order.paymentMethod === 'cod' &&
                    order.refundStatus !== 'completed' && (
                      <p className="mt-3 text-xs font-medium text-[#4d5f33]">
                        Return completed. No refund needed for Cash on Delivery orders.
                      </p>
                    )}
                </div>
              )}

              {/* Actions */}
              <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-[#eeede6] pt-6">
                <a
                  href={getInvoiceUrl(order.orderNumber, order.buyer.email)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex h-12 items-center gap-2 rounded-full border border-[#dcdbd2] bg-white px-6 text-sm font-semibold text-[#343a2d] transition-colors hover:border-[#1d211a]"
                >
                  <FileText className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-6" />
                  Download invoice
                </a>

                {canCancel && (
                  <button
                    type="button"
                    onClick={() => setCancelOpen(true)}
                    className="inline-flex h-12 items-center gap-2 rounded-full border border-red-200 bg-white px-6 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                    Cancel order
                  </button>
                )}

                {canReturn && (
                  <button
                    type="button"
                    onClick={() => setReturnOpen(true)}
                    className="inline-flex h-12 items-center gap-2 rounded-full border border-[#dcdbd2] bg-white px-6 text-sm font-semibold text-[#343a2d] transition-colors hover:border-[#1d211a]"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Request return
                  </button>
                )}

                {!canCancel && !canReturn && !order.returnStatus && order.status !== 'cancelled' && (
                  <p className="text-sm text-[#85877e]">
                    {order.status === 'shipped'
                      ? 'This order has been shipped and can no longer be cancelled.'
                      : order.status === 'delivered'
                      ? 'The return window for this order has closed.'
                      : ''}
                  </p>
                )}
              </div>
            </section>

            {/* Items */}
            <section className="to-card rounded-[1.75rem] border border-[#e5e4dc] bg-white p-6 sm:p-9">
              <h2 className="font-serif text-3xl font-medium tracking-[-0.05em]">Your items</h2>
              <span className="mt-3 block h-[2px] w-12 bg-[#a8d530]" />

              <ul className="mt-7 divide-y divide-[#eeede6]">
                {items.map((item) => {
                  const attrs = Object.values(item.productSnapshot.variantAttributes ?? {});
                  return (
                    <li key={item._id} className="to-item flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                      <img
                        src={item.productSnapshot.image ?? '/placeholder.svg'}
                        alt={item.productSnapshot.name}
                        className="h-16 w-16 shrink-0 rounded-2xl bg-[#e9e7df] object-cover ring-1 ring-black/5 sm:h-20 sm:w-20"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-semibold leading-snug tracking-[-0.01em] sm:text-base">
                          {item.productSnapshot.name}
                        </p>
                        {attrs.length > 0 && (
                          <p className="mt-1 text-xs text-[#85877e]">{attrs.join(' / ')}</p>
                        )}
                        <p className="mt-0.5 text-xs text-[#85877e]">
                          Qty {item.quantity} × ₹{fmt(item.unitPrice)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold tabular-nums sm:text-base">
                        ₹{fmt(item.lineTotal)}
                      </p>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-7 space-y-3.5 border-t border-[#eeede6] pt-6 text-sm">
                <div className="flex items-center justify-between text-[#555951]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#20221d]">
                    <AnimatedNumber value={order.subtotal} />
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#555951]">
                  <span>Shipping</span>
                  {order.shippingFee === 0 ? (
                    <span className="rounded-full bg-[#eff4e5] px-2.5 py-1 text-xs font-semibold text-[#4d5f33]">
                      Free
                    </span>
                  ) : (
                    <span className="font-semibold text-[#20221d]">₹{fmt(order.shippingFee)}</span>
                  )}
                </div>

                {order.packagingFee > 0 && (
                  <div className="flex items-center justify-between text-[#555951]">
                    <span>Packaging charges</span>
                    <span className="font-semibold text-[#20221d]">₹{fmt(order.packagingFee)}</span>
                  </div>
                )}
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
                    <AnimatedNumber value={order.total} />
                  </p>
                </div>
              </div>
            </section>

            {/* Shipping address */}
            <section className="to-card rounded-[1.75rem] border border-[#e5e4dc] bg-white p-6 sm:p-9">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eff4e5] text-[#414b30]">
                  <MapPin className="h-5 w-5" strokeWidth={1.7} />
                </span>
                <h2 className="font-serif text-2xl font-medium tracking-[-0.04em] sm:text-3xl">
                  Delivering to
                </h2>
              </div>

              <div className="mt-6 rounded-2xl bg-[#f4f5ee] p-5 text-sm leading-7 text-[#555951]">
                <p className="font-semibold text-[#20221d]">{order.buyer.name}</p>
                <p>{order.shippingAddress.line1}</p>
                {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                  {order.shippingAddress.pincode}
                </p>
                <p className="text-[#85877e]">{order.buyer.phone}</p>
              </div>
            </section>

            <div className="to-card text-center">
              <Link
                to="/"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-[#343a2d]"
              >
                <ArrowRight className="h-4 w-4 rotate-180 transition-transform duration-300 group-hover:-translate-x-1.5" />
                Continue shopping
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Cancel modal */}
      {cancelOpen && order && (
        <ReasonModal
          title="Cancel order"
          subtitle={`Order ${order.orderNumber} · ₹${fmt(order.total)}`}
          reasons={CANCEL_REASONS}
          reason={cancelReason}
          onReason={setCancelReason}
          note={cancelNote}
          onNote={setCancelNote}
          notePlaceholder="Anything else you'd like to add..."
          confirmLabel="Cancel order"
          dismissLabel="Keep order"
          onConfirm={handleCancel}
          submitting={cancelSubmitting}
          danger
          onClose={() => setCancelOpen(false)}
        />
      )}

      {/* Return modal */}
      {returnOpen && order && (
        <ReasonModal
          title="Request return"
          subtitle={`Order ${order.orderNumber} · ₹${fmt(order.total)}`}
          reasons={RETURN_REASONS}
          reason={returnReason}
          onReason={setReturnReason}
          note={returnNote}
          onNote={setReturnNote}
          notePlaceholder="Tell the seller what went wrong..."
          confirmLabel="Submit return request"
          dismissLabel="Cancel"
          onConfirm={handleReturn}
          submitting={returnSubmitting}
          onClose={() => setReturnOpen(false)}
        />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap');

        .roboexpert-track {
          font-family: 'DM Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }

        .roboexpert-track .font-serif {
          font-family: 'Playfair Display', Georgia, serif;
        }

        .roboexpert-track ::selection {
          background: #c9f06b;
          color: #1d211a;
        }

        .to-shine::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%);
          transform: translateX(-120%);
          transition: transform 0.9s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .to-shine:not(:disabled):hover::after {
          transform: translateX(120%);
        }
      `}</style>
    </div>
  );
}