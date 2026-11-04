import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  ArrowRight,
  Check,
  Loader2,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Store,
  Tag,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { validateCartCoupon, fetchCartCoupons } from '../../lib/api';
import toast from 'react-hot-toast';

gsap.registerPlugin(useGSAP);

const FREE_SHIPPING_MIN = 999;
const SHIPPING_FEE = 99;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const fmt = (n: number) => n.toLocaleString('en-IN');

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
/* Cart                                                                        */
/* -------------------------------------------------------------------------- */

export function Cart() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  const root = useRef<HTMLDivElement>(null);
  const checkoutBtn = useRef<HTMLButtonElement>(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [showBar, setShowBar] = useState(false);

  const isEmpty = items.length === 0;

  // Group items by companyId
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.companyId]) acc[item.companyId] = [];
    acc[item.companyId].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  const companyIds = Object.keys(groupedItems);
  const companyKey = companyIds.join(',');
  const firstCompanyId = companyIds[0];
  const companySubtotal = firstCompanyId
    ? groupedItems[firstCompanyId].reduce((sum, i) => sum + i.price * i.quantity, 0)
    : 0;

  const appliedRef = useRef(appliedCoupon);
  appliedRef.current = appliedCoupon;

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const subtotal = totalPrice;
  const shipping = subtotal > FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
  const total = Math.max(0, subtotal + shipping - discountAmount);

  const remainingForFree = Math.max(0, FREE_SHIPPING_MIN + 1 - subtotal);
  const shipProgress = Math.min(1, subtotal / (FREE_SHIPPING_MIN + 1));
  const freeShipping = shipping === 0;

  /* ------------------------------ data ------------------------------ */

  // Load available coupons for the sellers in the cart
  useEffect(() => {
    if (!companyKey) {
      setAvailableCoupons([]);
      return;
    }
    let cancelled = false;
    fetchCartCoupons(companyKey.split(','))
      .then((c) => {
        if (!cancelled) setAvailableCoupons(c ?? []);
      })
      .catch(() => {
        /* offers are optional */
      });
    return () => {
      cancelled = true;
    };
  }, [companyKey]);

  // Re-validate an applied coupon when the seller subtotal changes
  useEffect(() => {
    const current = appliedRef.current;
    if (!current || !firstCompanyId) return;

    let cancelled = false;
    validateCartCoupon(current.coupon.code, firstCompanyId, companySubtotal)
      .then((res) => {
        if (cancelled) return;
        if (!res.ok) {
          setAppliedCoupon(null);
          toast.error(`Coupon ${current.coupon.code} no longer applies`);
        } else {
          setAppliedCoupon(res);
        }
      })
      .catch(() => {
        /* keep the current discount if the check fails */
      });

    return () => {
      cancelled = true;
    };
  }, [firstCompanyId, companySubtotal]);

  /* ----------------------------- effects ---------------------------- */

  // sticky mobile checkout bar once the main button leaves the viewport
  useEffect(() => {
    const el = checkoutBtn.current;
    if (!el) {
      setShowBar(false);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => setShowBar(!entry.isIntersecting),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [isEmpty]);

  // entrance (only replays when switching between empty / filled)
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

      tl.from('.cart-word', { yPercent: 120, rotate: 5, duration: 1.2, stagger: 0.07 }, 0)
        .from('.cart-fade', { y: 26, opacity: 0, duration: 1, stagger: 0.09 }, 0.2)
        .from('.cart-group', { y: 50, opacity: 0, duration: 1.1, stagger: 0.12 }, 0.35)
        .from('.cart-row', { y: 24, opacity: 0, duration: 0.9, stagger: 0.07 }, 0.5)
        .from('.cart-summary', { y: 50, opacity: 0, duration: 1.2 }, 0.45);

      if (isEmpty) {
        gsap.to('.cart-float', {
          y: -12,
          duration: 2.2,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
        });
      }
    },
    { scope: root, dependencies: [isEmpty] },
  );

  // free-shipping bar fill
  useGSAP(
    () => {
      if (isEmpty) return;
      if (prefersReducedMotion()) {
        gsap.set('.ship-bar', { scaleX: shipProgress });
        return;
      }
      gsap.to('.ship-bar', { scaleX: shipProgress, duration: 1, ease: 'power3.out' });
    },
    { scope: root, dependencies: [shipProgress, isEmpty] },
  );

  // applied coupon ticket drops in
  useGSAP(
    () => {
      if (!appliedCoupon || prefersReducedMotion()) return;
      gsap.fromTo(
        '.coupon-applied',
        { y: -14, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.8)' },
      );
    },
    { scope: root, dependencies: [appliedCoupon?.coupon?.code] },
  );

  /* ---------------------------- handlers ---------------------------- */

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = codeToApply || couponCode;
    if (!code.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    if (!firstCompanyId) return;

    setCheckingCoupon(true);
    try {
      const res = await validateCartCoupon(code.trim(), firstCompanyId, companySubtotal);

      if (!res.ok) {
        toast.error(res.error || 'Invalid coupon');
        return;
      }

      setAppliedCoupon(res);
      setCouponCode('');
      toast.success(`Coupon ${res.coupon.code} applied!`);
    } catch {
      toast.error('Could not apply coupon. Try again.');
    } finally {
      setCheckingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.success('Coupon removed');
  };

  const handleCheckout = () => {
    navigate('/checkout', { state: { coupon: appliedCoupon } });
  };

  // collapse the row, then actually remove it
  const handleRemoveItem = (variantId: string, e: React.MouseEvent<HTMLButtonElement>) => {
    const row = e.currentTarget.closest('li') as HTMLElement | null;

    if (!row || prefersReducedMotion()) {
      removeItem(variantId);
      return;
    }

    gsap.to(row, {
      x: -60,
      opacity: 0,
      height: 0,
      paddingTop: 0,
      paddingBottom: 0,
      duration: 0.6,
      ease: 'power3.inOut',
      onComplete: () => removeItem(variantId),
    });
  };

  /* ------------------------------ empty ----------------------------- */

  if (isEmpty) {
    return (
      <div
        ref={root}
        className="roboexpert-cart relative min-h-[70vh] overflow-x-clip bg-[#faf9f6] text-[#20221d]"
      >
        <div className="mx-auto flex max-w-[1440px] flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-32 lg:px-10">
          <div className="cart-float relative flex h-28 w-28 items-center justify-center rounded-full bg-[#eff4e5]">
            <span className="absolute inset-0 rounded-full border border-[#c9f06b]" />
            <ShoppingBag className="h-11 w-11 text-[#414b30]" strokeWidth={1.4} />
          </div>

          <p className="cart-fade mt-10 text-[10px] font-bold uppercase tracking-[0.22em] text-[#7d8c60]">
            Shopping cart
          </p>

          <h1 className="mt-3 font-serif text-5xl font-medium tracking-[-0.05em] sm:text-6xl">
            {['Nothing', 'here', 'yet.'].map((w, i) => (
              <span
                key={i}
                className="-mb-[0.12em] mr-[0.22em] inline-block overflow-hidden pb-[0.12em] align-top"
              >
                <span className="cart-word inline-block">{w}</span>
              </span>
            ))}
          </h1>

          <p className="cart-fade mt-5 max-w-sm text-sm leading-7 text-[#555951] sm:text-base">
            Your cart is waiting for something good. Go find a little something worth
            getting excited about.
          </p>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="cart-fade group mt-9 inline-flex items-center gap-4 rounded-full bg-[#1d211a] py-2 pl-6 pr-2 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#343a2d]"
          >
            Continue shopping
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c9f06b] text-[#1d211a] transition-transform duration-500 group-hover:rotate-[-35deg]">
              <ArrowRight className="h-4 w-4" />
            </span>
          </button>
        </div>

        <CartStyles />
      </div>
    );
  }

  /* ------------------------------ view ------------------------------ */

  return (
    <div
      ref={root}
      className="roboexpert-cart relative min-h-screen overflow-x-clip bg-[#faf9f6] pb-28 text-[#20221d] lg:pb-20"
    >
      <div className="mx-auto max-w-[1440px] px-4 pt-6 sm:px-6 sm:pt-10 lg:px-10">
        {/* Heading */}
        <div className="mb-8 sm:mb-12">
          <p className="cart-fade mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#7d8c60]">
            Shopping cart · {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </p>
          <h1 className="font-serif text-5xl font-medium tracking-[-0.055em] sm:text-6xl lg:text-7xl">
            {['Your', 'bag.'].map((w, i) => (
              <span
                key={i}
                className="-mb-[0.12em] mr-[0.22em] inline-block overflow-hidden pb-[0.12em] align-top"
              >
                <span className="cart-word inline-block">{w}</span>
              </span>
            ))}
          </h1>
        </div>

        <div className="flex flex-col items-start gap-8 lg:flex-row lg:gap-12">
          {/* ------------------------ Items ------------------------ */}
          <div className="w-full flex-1 space-y-6">
            {/* Free shipping meter */}
            <div className="cart-fade rounded-3xl border border-[#e5e4dc] bg-white p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-500 ${
                    freeShipping ? 'bg-[#c9f06b] text-[#1d211a]' : 'bg-[#eff4e5] text-[#414b30]'
                  }`}
                >
                  {freeShipping ? (
                    <Check className="h-[18px] w-[18px]" />
                  ) : (
                    <Truck className="h-[18px] w-[18px]" strokeWidth={1.7} />
                  )}
                </span>
                <p className="text-sm font-semibold tracking-[-0.01em] text-[#242720] sm:text-base">
                  {freeShipping ? (
                    'You unlocked free shipping.'
                  ) : (
                    <>
                      Add <span className="text-[#4d5f33]">₹{fmt(remainingForFree)}</span> more
                      for free shipping
                    </>
                  )}
                </p>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#eef0e6]">
                <div className="ship-bar h-full origin-left scale-x-0 rounded-full bg-gradient-to-r from-[#a8d530] to-[#c9f06b]" />
              </div>
            </div>

            {/* Seller groups */}
            {Object.entries(groupedItems).map(([companyId, group]) => (
              <section
                key={companyId}
                className="cart-group overflow-hidden rounded-[1.75rem] border border-[#e5e4dc] bg-white"
              >
                <div className="flex items-center gap-3 border-b border-[#e5e4dc] bg-[#f4f5ee] px-5 py-4 sm:px-7">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eff4e5] text-[#414b30]">
                    <Store className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7d8c60]">
                      Sold by
                    </p>
                    <Link
                      to={`/shop/${companyId}`}
                      className="block truncate text-sm font-semibold text-[#20221d] underline-offset-4 hover:underline"
                    >
                      {group[0].companyName}
                    </Link>
                  </div>
                  <span className="text-xs text-[#85877e]">
                    {group.length} {group.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                <ul className="divide-y divide-[#eeede6]">
                  {group.map((item) => {
                    const attrs = Object.entries(item.variantAttributes ?? {});
                    const lineTotal = item.price * item.quantity;

                    return (
                      <li
                        key={item.variantId}
                        className="cart-row overflow-hidden px-5 py-5 sm:px-7 sm:py-6"
                      >
                        <div className="flex gap-4 sm:gap-6">
                          <Link
                            to={`/product/${item.productId}`}
                            className="group h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#e9e7df] ring-1 ring-black/5 sm:h-32 sm:w-32"
                          >
                            <img
                              src={item.image ?? '/placeholder.svg'}
                              alt={item.productName}
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                              }}
                            />
                          </Link>

                          <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <Link
                                  to={`/product/${item.productId}`}
                                  className="line-clamp-2 text-sm font-semibold leading-snug tracking-[-0.01em] text-[#20221d] transition-colors hover:text-[#4d5f33] sm:text-base"
                                >
                                  {item.productName}
                                </Link>

                                {attrs.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {attrs.map(([k, v]) => (
                                      <span
                                        key={k}
                                        className="rounded-full border border-[#e5e4dc] bg-[#faf9f6] px-2.5 py-1 text-[11px] text-[#555951]"
                                      >
                                        <span className="text-[#85877e]">{k}:</span> {String(v)}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                <p className="mt-2 text-xs text-[#85877e]">
                                  ₹{fmt(item.price)} each
                                </p>
                              </div>

                              <p className="hidden shrink-0 font-serif text-2xl font-medium tracking-[-0.03em] text-[#1f261a] sm:block">
                                <AnimatedNumber value={lineTotal} />
                              </p>
                            </div>

                            <div className="flex items-center justify-between gap-3">
                              <div className="flex h-11 items-center rounded-full border border-[#dcdbd2] bg-white px-1">
                                <button
                                  type="button"
                                  aria-label="Decrease quantity"
                                  disabled={item.quantity <= 1}
                                  onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                  className="flex h-9 w-9 items-center justify-center rounded-full text-[#343a2d] transition-colors hover:bg-[#eff4e5] disabled:opacity-40"
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="w-8 text-center text-sm font-semibold tabular-nums">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  aria-label="Increase quantity"
                                  onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                  className="flex h-9 w-9 items-center justify-center rounded-full text-[#343a2d] transition-colors hover:bg-[#eff4e5]"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              <p className="font-serif text-xl font-medium tracking-[-0.03em] text-[#1f261a] sm:hidden">
                                ₹{fmt(lineTotal)}
                              </p>

                              <button
                                type="button"
                                onClick={(e) => handleRemoveItem(item.variantId, e)}
                                className="group inline-flex items-center gap-1.5 text-xs font-semibold text-[#85877e] transition-colors hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-12" />
                                <span className="hidden sm:inline">Remove</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}

            <Link
              to="/search"
              className="cart-fade group inline-flex items-center gap-2 text-sm font-semibold text-[#343a2d]"
            >
              <ArrowRight className="h-4 w-4 rotate-180 transition-transform duration-300 group-hover:-translate-x-1.5" />
              Keep browsing
            </Link>
          </div>

          {/* ----------------------- Summary ----------------------- */}
          <aside className="cart-summary w-full shrink-0 lg:sticky lg:top-24 lg:w-[400px]">
            <div className="rounded-[1.75rem] border border-[#e5e4dc] bg-white p-6 shadow-[0_40px_90px_-50px_rgba(32,37,27,0.45)] sm:p-7">
              <h2 className="font-serif text-3xl font-medium tracking-[-0.05em]">
                Order summary
              </h2>
              <span className="mt-3 block h-[2px] w-12 bg-[#a8d530]" />

              {/* Coupons */}
              <div className="mt-7 border-b border-[#eeede6] pb-7">
                <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#7d8c60]">
                  <Tag className="h-4 w-4" />
                  Coupon
                </p>

                {appliedCoupon ? (
                  <div className="coupon-applied flex items-center justify-between gap-3 rounded-2xl border border-dashed border-[#a8c56e] bg-[#f4f9e6] px-4 py-3.5">
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-bold tracking-[0.18em] text-[#3f4d2a]">
                        {appliedCoupon.coupon.code}
                      </p>
                      <p className="mt-0.5 text-xs text-[#5c6b46]">
                        You saved ₹{fmt(appliedCoupon.discountAmount)}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label="Remove coupon"
                      onClick={handleRemoveCoupon}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#3f4d2a] transition-colors hover:bg-[#1d211a] hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availableCoupons.length > 0 && (
                      <ul className="space-y-2">
                        {availableCoupons.map((c) => (
                          <li
                            key={c.code}
                            className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-[#a8c56e] bg-[#f4f9e6] px-4 py-3"
                          >
                            <div className="min-w-0">
                              <p className="font-mono text-xs font-bold tracking-[0.18em] text-[#3f4d2a]">
                                {c.code}
                              </p>
                              <p className="mt-0.5 text-xs text-[#5c6b46]">
                                {c.discountType === 'percentage'
                                  ? `${c.discountValue}% off`
                                  : `₹${c.discountValue} off`}
                              </p>
                            </div>
                            <button
                              type="button"
                              disabled={checkingCoupon}
                              onClick={() => handleApplyCoupon(c.code)}
                              className="shrink-0 rounded-full bg-[#1d211a] px-4 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-[#343a2d] disabled:opacity-50"
                            >
                              Apply
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleApplyCoupon();
                      }}
                      className="flex h-12 items-center rounded-full border border-[#dcdbd2] bg-white pl-5 pr-1.5 transition-colors focus-within:border-[#1d211a]"
                    >
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        className="min-w-0 flex-1 bg-transparent font-mono text-sm tracking-[0.12em] text-[#20221d] placeholder:font-sans placeholder:tracking-normal placeholder:text-[#a5a69d] focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={checkingCoupon}
                        className="flex h-9 min-w-[4.5rem] items-center justify-center rounded-full bg-[#eff4e5] px-4 text-xs font-semibold text-[#3f4d2a] transition-colors hover:bg-[#c9f06b] disabled:opacity-60"
                      >
                        {checkingCoupon ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Apply'
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* Lines */}
              <div className="space-y-3.5 py-6 text-sm">
                <div className="flex items-center justify-between text-[#555951]">
                  <span>
                    Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})
                  </span>
                  <span className="font-semibold text-[#20221d]">
                    <AnimatedNumber value={subtotal} />
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#555951]">
                  <span>Shipping</span>
                  <span className="font-semibold text-[#20221d]">
                    {freeShipping ? (
                      <span className="rounded-full bg-[#eff4e5] px-2.5 py-1 text-xs text-[#4d5f33]">
                        Free
                      </span>
                    ) : (
                      `₹${fmt(shipping)}`
                    )}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex items-center justify-between font-semibold text-[#4d5f33]">
                    <span>Discount</span>
                    <AnimatedNumber value={discountAmount} prefix="− ₹" />
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="relative overflow-hidden rounded-2xl bg-[#20251b] px-5 py-5 text-white">
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

              <button
                ref={checkoutBtn}
                type="button"
                onClick={handleCheckout}
                className="cart-shine group relative mt-5 flex h-14 w-full items-center justify-between overflow-hidden rounded-full bg-[#1d211a] py-2 pl-7 pr-2 text-sm font-semibold text-white shadow-[0_18px_40px_-18px_rgba(29,33,26,0.7)] transition-colors duration-300 hover:bg-[#343a2d]"
              >
                Proceed to checkout
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c9f06b] text-[#1d211a] transition-transform duration-500 group-hover:rotate-[-35deg]">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>

              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-[#eeede6] pt-5">
                <div className="flex items-center gap-2 text-xs text-[#555951]">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-[#4d5f33]" />
                  Secure checkout
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

      {/* Sticky mobile checkout bar */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-[#e5e4dc] bg-[#faf9f6]/90 px-4 py-3 backdrop-blur-xl transition-transform duration-500 lg:hidden ${
          showBar ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-[#85877e]">
              Total · {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </p>
            <p className="font-serif text-xl font-medium tracking-[-0.03em] text-[#1f261a]">
              ₹{fmt(total)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCheckout}
            className="flex h-12 items-center gap-2 rounded-full bg-[#1d211a] px-6 text-sm font-semibold text-white"
          >
            Checkout
            <ArrowRight className="h-4 w-4 text-[#c9f06b]" />
          </button>
        </div>
      </div>

      <CartStyles />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Scoped styles                                                               */
/* -------------------------------------------------------------------------- */

function CartStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap');

      .roboexpert-cart {
        font-family: 'DM Sans', sans-serif;
        -webkit-font-smoothing: antialiased;
        text-rendering: optimizeLegibility;
      }

      .roboexpert-cart .font-serif {
        font-family: 'Playfair Display', Georgia, serif;
      }

      .roboexpert-cart ::selection {
        background: #c9f06b;
        color: #1d211a;
      }

      .cart-shine::after {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%);
        transform: translateX(-120%);
        transition: transform 0.9s cubic-bezier(0.2, 0.8, 0.2, 1);
      }
      .cart-shine:hover::after {
        transform: translateX(120%);
      }
    `}</style>
  );
}