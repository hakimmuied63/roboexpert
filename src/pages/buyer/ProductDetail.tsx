import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Minus,
  Plus,
  RotateCcw,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  Tag,
  Truck,
} from 'lucide-react';
import { LoadingSpinner } from '../../components/ui';
import { useCart } from '../../contexts/CartContext';
import { WishlistButton } from '../../components/wishlist/WishlistButton';
import { ReviewsSection } from '../../components/product/ReviewsSection';
import {
  fetchProductById,
  fetchPublicCoupons,
  type Product,
  type ProductVariant,
} from '../../lib/api';
import toast from 'react-hot-toast';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const fmt = (n: number) => n.toLocaleString('en-IN');

// case-insensitive attribute lookup
const getAttr = (attrs: any, key: string) => {
  if (!attrs) return undefined;
  const foundKey = Object.keys(attrs).find(
    (k) => k.toLowerCase() === key.toLowerCase(),
  );
  return foundKey ? attrs[foundKey] : undefined;
};

const isCssColor = (c: string) =>
  typeof CSS !== 'undefined' &&
  typeof CSS.supports === 'function' &&
  CSS.supports('color', c);

const TRUST = [
  { icon: RotateCcw, title: '7-Day Returns', sub: 'Money back guarantee' },
  { icon: Truck, title: 'Direct Shipping', sub: 'Shipped by seller' },
  { icon: ShieldCheck, title: 'Secure Checkout', sub: 'Protected payments' },
];

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showBar, setShowBar] = useState(false);

  const root = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const ctaWrap = useRef<HTMLDivElement>(null);
  const ctaBtn = useRef<HTMLButtonElement>(null);
  const priceRef = useRef<HTMLSpanElement>(null);
  const shownPrice = useRef<number | null>(null);
  const prevImage = useRef(0);

  const { addItem } = useCart();

  /* ------------------------------ data ------------------------------ */

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!id) return;
      setLoading(true);
      setCoupons([]);
      setActiveImage(0);
      setQuantity(1);
      shownPrice.current = null;
      prevImage.current = 0;

      try {
        const data = await fetchProductById(id);
        if (cancelled) return;

        if (data && data.ok) {
          setProduct(data.product);
          setVariants(data.variants);
          setSelectedVariantId(data.variants[0]?._id ?? null);

          if (data.product.company?._id) {
            try {
              const c = await fetchPublicCoupons(data.product.company._id);
              if (!cancelled) setCoupons(c);
            } catch {
              /* coupons are optional */
            }
          }
        } else {
          setProduct(null);
        }
      } catch {
        if (!cancelled) setProduct(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  /* ---------------------------- derived ----------------------------- */

  const selectedVariant = variants.find((v) => v._id === selectedVariantId) ?? null;
  const displayPrice = selectedVariant?.price ?? product?.basePrice ?? 0;
  const availableStock = selectedVariant?.stock ?? 0;
  const canBuy = availableStock > 0;

  const colors = Array.from(
    new Set(variants.map((v) => getAttr(v.attributes, 'color') || 'Default')),
  );
  const selectedColor =
    getAttr(selectedVariant?.attributes, 'color') ||
    (colors.length > 0 ? colors[0] : null);

  const availableSizes = variants
    .filter((v) => (getAttr(v.attributes, 'color') || 'Default') === selectedColor)
    .map((v) => getAttr(v.attributes, 'size'))
    .filter(Boolean);

  const ratingAvg = (selectedVariant as any)?.ratingAverage ?? 0;
  const ratingCount = (selectedVariant as any)?.ratingCount ?? 0;

  /* ----------------------------- effects ---------------------------- */

  // keep quantity within the selected variant's stock
  useEffect(() => {
    setQuantity((q) => Math.max(1, Math.min(q, availableStock || 1)));
  }, [availableStock]);

  // price counts to its new value when the variant changes
  useEffect(() => {
    const el = priceRef.current;
    if (!el) return;

    if (shownPrice.current === null || prefersReducedMotion()) {
      el.textContent = fmt(displayPrice);
      shownPrice.current = displayPrice;
      return;
    }

    const obj = { v: shownPrice.current };
    const tween = gsap.to(obj, {
      v: displayPrice,
      duration: 0.7,
      ease: 'power3.out',
      onUpdate: () => {
        shownPrice.current = obj.v;
        el.textContent = fmt(Math.round(obj.v));
      },
      onComplete: () => {
        shownPrice.current = displayPrice;
        el.textContent = fmt(displayPrice);
      },
    });

    return () => {
      tween.kill();
    };
  }, [displayPrice, loading, product?._id]);

  // show the sticky mobile bar once the main CTA leaves the viewport
  useEffect(() => {
    const el = ctaWrap.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => setShowBar(!entry.isIntersecting),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loading, product?._id]);

  // entrance timeline + scroll reveals
  useGSAP(
    () => {
      if (!root.current || loading || !product || prefersReducedMotion()) return;

      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

      tl.from('.pdp-crumb', { y: -14, opacity: 0, duration: 0.8 }, 0)
        .fromTo(
          '.pdp-main',
          { clipPath: 'inset(100% 0% 0% 0% round 28px)' },
          {
            clipPath: 'inset(0% 0% 0% 0% round 28px)',
            duration: 1.5,
            ease: 'expo.inOut',
          },
          0.05,
        )
        .from(
          '.pdp-thumb',
          {
            scale: 0.6,
            opacity: 0,
            duration: 0.8,
            stagger: 0.07,
            ease: 'back.out(2)',
          },
          0.6,
        )
        .from(
          '.pdp-word',
          { yPercent: 120, rotate: 5, duration: 1.2, stagger: 0.06 },
          0.2,
        )
        .from(
          '.pdp-fade',
          { y: 26, opacity: 0, duration: 1, stagger: 0.08 },
          0.45,
        );

      gsap.from('.pdp-trust-item', {
        y: 24,
        opacity: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.pdp-trust', start: 'top 95%', once: true },
      });

      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          y: 50,
          opacity: 0,
          duration: 1.1,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      });

      const t = window.setTimeout(() => ScrollTrigger.refresh(), 300);
      return () => window.clearTimeout(t);
    },
    { scope: root, dependencies: [loading, product?._id] },
  );

  // main image crossfade when the active image changes
  useGSAP(
    () => {
      if (!root.current || prefersReducedMotion()) return;
      if (prevImage.current === activeImage) return;
      prevImage.current = activeImage;

      gsap.fromTo(
        '.pdp-img',
        { opacity: 0, scale: 1.08 },
        { opacity: 1, scale: 1, duration: 0.9, ease: 'expo.out' },
      );
    },
    { scope: root, dependencies: [activeImage] },
  );

  /* ----------------------------- states ----------------------------- */

  if (loading) return <LoadingSpinner className="min-h-[50vh]" />;

  if (!product) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-24 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#7d8c60]">
          404
        </p>
        <h2 className="mt-3 font-serif text-4xl font-medium tracking-[-0.04em] text-[#20221d]">
          Product not found
        </h2>
        <Link
          to="/"
          className="group mt-8 inline-flex items-center gap-4 rounded-full bg-[#1d211a] py-2 pl-6 pr-2 text-sm font-semibold text-white transition-colors hover:bg-[#343a2d]"
        >
          Return to home
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c9f06b] text-[#1d211a] transition-transform duration-500 group-hover:rotate-[-35deg]">
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </div>
    );
  }

  /* ---------------------------- handlers ---------------------------- */

  const images = product.images ?? [];
  const imgCount = images.length;

  const nextImage = () => setActiveImage((i) => (i + 1) % imgCount);
  const prevImageFn = () => setActiveImage((i) => (i - 1 + imgCount) % imgCount);

  const onZoomMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!zoomRef.current || !window.matchMedia('(pointer: fine)').matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    gsap.to(zoomRef.current, {
      scale: 1.8,
      transformOrigin: `${x}% ${y}%`,
      duration: 0.6,
      ease: 'power3.out',
      overwrite: 'auto',
    });
  };

  const onZoomLeave = () => {
    if (!zoomRef.current) return;
    gsap.to(zoomRef.current, {
      scale: 1,
      duration: 0.7,
      ease: 'power3.out',
      overwrite: 'auto',
    });
  };

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error('Please select a variant');
      return;
    }
    if (!canBuy) {
      toast.error('Out of stock');
      return;
    }
    addItem(product, selectedVariant, product.company?.name ?? 'Unknown seller', quantity);
    toast.success(`Added ${quantity} × ${product.name}`);

    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1800);

    if (ctaBtn.current && !prefersReducedMotion()) {
      gsap.fromTo(
        ctaBtn.current,
        { scale: 0.95 },
        { scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.45)' },
      );
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied');
      }
    } catch {
      /* share dismissed */
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success(`Code ${code} copied`);
      window.setTimeout(() => setCopiedCode(null), 1500);
    } catch {
      toast.error('Could not copy code');
    }
  };

  const titleWords = product.name.split(' ');
  const lowStock = canBuy && availableStock <= 5;

  /* ------------------------------ view ------------------------------ */

  return (
    <div
      ref={root}
      className="roboexpert-pdp relative min-h-screen overflow-x-clip bg-[#faf9f6] pb-28 text-[#20221d] lg:pb-20"
    >
      <div className="mx-auto max-w-[1440px] space-y-16 px-4 pt-5 sm:space-y-20 sm:px-6 sm:pt-8 lg:px-10">
        {/* Breadcrumb */}
        <nav className="pdp-crumb flex flex-wrap items-center text-xs text-[#85877e] sm:text-sm">
          <Link to="/" className="transition-colors hover:text-[#20221d]">
            Home
          </Link>
          <ChevronRight className="mx-2 h-3.5 w-3.5 text-[#c3c3ba]" />
          {product.company && (
            <>
              <Link
                to={`/shop/${product.company._id}`}
                className="transition-colors hover:text-[#20221d]"
              >
                {product.company.name}
              </Link>
              <ChevronRight className="mx-2 h-3.5 w-3.5 text-[#c3c3ba]" />
            </>
          )}
          <span className="max-w-[16rem] truncate font-medium text-[#20221d]">
            {product.name}
          </span>
        </nav>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          {/* ------------------------- Gallery ------------------------- */}
          <div className="flex flex-col-reverse gap-4 lg:sticky lg:top-24 lg:flex-row">
            {imgCount > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1 lg:max-h-[640px] lg:flex-col lg:overflow-y-auto lg:overflow-x-visible lg:pb-0">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`Show image ${idx + 1}`}
                    onClick={() => setActiveImage(idx)}
                    className={`pdp-thumb h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 transition-all duration-300 lg:h-20 lg:w-20 ${
                      activeImage === idx
                        ? 'border-[#1d211a]'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div
              className="pdp-main relative aspect-[4/5] flex-1 cursor-zoom-in overflow-hidden rounded-[1.75rem] bg-[#e9e7df] shadow-[0_40px_90px_-45px_rgba(32,37,27,0.5)] ring-1 ring-black/5"
              onMouseMove={onZoomMove}
              onMouseLeave={onZoomLeave}
            >
              <div ref={zoomRef} className="absolute inset-0 will-change-transform">
                <img
                  src={images[activeImage] ?? '/placeholder.svg'}
                  alt={product.name}
                  className="pdp-img h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>

              {imgCount > 1 && (
                <>
                  <div className="absolute left-4 top-4 rounded-full border border-white/50 bg-white/75 px-3 py-1.5 font-mono text-[11px] tracking-widest text-[#242720] backdrop-blur-md">
                    {String(activeImage + 1).padStart(2, '0')} /{' '}
                    {String(imgCount).padStart(2, '0')}
                  </div>

                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <button
                      type="button"
                      aria-label="Previous image"
                      onClick={prevImageFn}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/70 text-[#1d211a] backdrop-blur transition hover:scale-110 hover:bg-white"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Next image"
                      onClick={nextImage}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/70 text-[#1d211a] backdrop-blur transition hover:scale-110 hover:bg-white"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* --------------------------- Info -------------------------- */}
          <div className="space-y-7">
            <div className="space-y-5">
              {product.company && (
                <div className="pdp-fade flex flex-wrap items-center gap-3">
                  <Link
                    to={`/shop/${product.company._id}`}
                    className="group inline-flex items-center gap-2.5 text-sm font-semibold text-[#343a2d]"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eff4e5] text-[#414b30] transition-colors group-hover:bg-[#c9f06b]">
                      <Store className="h-4 w-4" />
                    </span>
                    <span className="underline-offset-4 group-hover:underline">
                      {product.company.name}
                    </span>
                  </Link>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d6e6b4] bg-[#f4f9e6] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#4d5f33]">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verified seller
                  </span>
                </div>
              )}

              <h1 className="font-serif text-4xl font-medium leading-[1.02] tracking-[-0.045em] sm:text-5xl">
                {titleWords.map((word, i) => (
                  <span
                    key={i}
                    className="-mb-[0.12em] mr-[0.22em] inline-block overflow-hidden pb-[0.12em] align-top"
                  >
                    <span className="pdp-word inline-block origin-left will-change-transform">
                      {word}
                    </span>
                  </span>
                ))}
              </h1>

              <div className="pdp-fade flex flex-wrap items-center gap-x-5 gap-y-3">
                {selectedVariant && (
                  <a
                    href="#reviews"
                    className="inline-flex items-center gap-2 text-sm text-[#555951]"
                  >
                    <span className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.round(ratingAvg)
                              ? 'fill-[#f2b705] text-[#f2b705]'
                              : 'fill-transparent text-[#cfcfc6]'
                          }`}
                        />
                      ))}
                    </span>
                    <span className="font-semibold text-[#20221d]">
                      {Number(ratingAvg).toFixed(1)}
                    </span>
                    <span className="text-[#85877e]">({ratingCount} reviews)</span>
                  </a>
                )}

                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                    !canBuy
                      ? 'bg-red-50 text-red-600'
                      : lowStock
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-[#eff4e5] text-[#4d5f33]'
                  }`}
                >
                  <span className="relative flex h-2 w-2">
                    {canBuy && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-50" />
                    )}
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
                  </span>
                  {!canBuy
                    ? 'Out of stock'
                    : lowStock
                    ? `Only ${availableStock} left`
                    : `In stock (${availableStock})`}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="pdp-fade border-y border-[#e5e4dc] py-6">
              <div className="flex items-end gap-1">
                <span className="font-serif text-4xl font-medium tracking-[-0.04em] text-[#1f261a] sm:text-5xl">
                  ₹<span ref={priceRef} className="tabular-nums" />
                </span>
              </div>
              <p className="mt-2 text-xs text-[#85877e]">Inclusive of all taxes</p>
            </div>

            {/* Offers */}
            {coupons.length > 0 && (
              <div className="pdp-fade rounded-3xl border border-[#e5e4dc] bg-white p-5">
                <h3 className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#7d8c60]">
                  <Tag className="h-4 w-4" />
                  Available offers
                </h3>
                <ul className="space-y-2.5">
                  {coupons.map((c) => (
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
                          {c.minOrderAmount > 0 && ` on orders above ₹${c.minOrderAmount}`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyCode(c.code)}
                        className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#1d211a] px-3.5 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-[#343a2d]"
                      >
                        {copiedCode === c.code ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        {copiedCode === c.code ? 'Copied' : 'Copy'}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Variant selectors */}
            {variants.length > 0 && (
              <div className="pdp-fade space-y-6">
                {colors.length > 1 && (
                  <div>
                    <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#7d8c60]">
                      Colour{' '}
                      <span className="ml-1 font-semibold normal-case tracking-normal text-[#20221d]">
                        {selectedColor}
                      </span>
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      {colors.map((color) => {
                        const isSelected = selectedColor === color;
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => {
                              const first = variants.find(
                                (v) =>
                                  (getAttr(v.attributes, 'color') || 'Default') === color,
                              );
                              if (first) setSelectedVariantId(first._id);
                            }}
                            className={`inline-flex items-center gap-2.5 rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                              isSelected
                                ? 'border-[#1d211a] bg-[#1d211a] text-white'
                                : 'border-[#dcdbd2] bg-white text-[#343a2d] hover:border-[#1d211a]'
                            }`}
                          >
                            {isCssColor(color) && (
                              <span
                                className="h-4 w-4 rounded-full ring-1 ring-black/15"
                                style={{ backgroundColor: color }}
                              />
                            )}
                            {color}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {availableSizes.length > 0 && (
                  <div>
                    <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#7d8c60]">
                      Size
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      {availableSizes.map((size) => {
                        const matched = variants.find(
                          (v) =>
                            (getAttr(v.attributes, 'color') || 'Default') ===
                              selectedColor && getAttr(v.attributes, 'size') === size,
                        );
                        const isSelected = selectedVariantId === matched?._id;
                        const outOfStock = (matched?.stock ?? 0) <= 0;

                        return (
                          <button
                            key={size}
                            type="button"
                            disabled={outOfStock}
                            onClick={() => matched && setSelectedVariantId(matched._id)}
                            className={`h-12 min-w-[3.25rem] rounded-2xl border px-4 text-sm font-semibold transition-all duration-300 ${
                              isSelected
                                ? 'border-[#1d211a] bg-[#1d211a] text-white'
                                : outOfStock
                                ? 'cursor-not-allowed border-dashed border-[#dcdbd2] bg-transparent text-[#b5b6ad] line-through'
                                : 'border-[#dcdbd2] bg-white text-[#343a2d] hover:border-[#1d211a]'
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="pdp-fade space-y-3">
              <div ref={ctaWrap} className="flex items-center gap-3">
                <div className="flex h-14 items-center rounded-full border border-[#dcdbd2] bg-white px-1.5">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || !canBuy}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-[#343a2d] transition-colors hover:bg-[#eff4e5] disabled:opacity-40"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-9 text-center font-semibold tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                    disabled={quantity >= availableStock || !canBuy}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-[#343a2d] transition-colors hover:bg-[#eff4e5] disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <button
                  ref={ctaBtn}
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!canBuy}
                  className="pdp-shine group relative flex h-14 flex-1 items-center justify-between overflow-hidden rounded-full bg-[#1d211a] py-2 pl-7 pr-2 text-sm font-semibold text-white shadow-[0_18px_40px_-18px_rgba(29,33,26,0.7)] transition-colors duration-300 hover:bg-[#343a2d] disabled:cursor-not-allowed disabled:bg-[#d9d8cf] disabled:text-[#85877e] disabled:shadow-none"
                >
                  <span>
                    {!canBuy ? 'Out of stock' : justAdded ? 'Added to cart' : 'Add to cart'}
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c9f06b] text-[#1d211a] transition-transform duration-500 group-hover:scale-110">
                    {justAdded ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <ShoppingBag className="h-4 w-4" />
                    )}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <WishlistButton productId={product._id} showLabel className="flex-1" />
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-[#dcdbd2] bg-white text-sm font-semibold text-[#343a2d] transition-colors hover:border-[#1d211a]"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
            </div>

            {/* Trust */}
            <div className="pdp-trust grid grid-cols-1 gap-4 border-t border-[#e5e4dc] pt-6 sm:grid-cols-3">
              {TRUST.map(({ icon: Icon, title, sub }) => (
                <div key={title} className="pdp-trust-item group flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eff4e5] text-[#414b30] transition-colors duration-500 group-hover:bg-[#c9f06b]">
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.7} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold tracking-[-0.01em] text-[#242720]">
                      {title}
                    </p>
                    <p className="mt-0.5 text-xs text-[#85877e]">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ------------------------ Description ------------------------ */}
        <section
          data-reveal
          className="grid gap-8 border-t border-[#e5e4dc] pt-14 lg:grid-cols-[1fr_2fr] lg:gap-16"
        >
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#7d8c60]">
              The details
            </p>
            <h2 className="font-serif text-3xl font-medium tracking-[-0.05em] sm:text-4xl">
              About this piece.
            </h2>
            <span className="mt-3 block h-[2px] w-16 bg-[#a8d530]" />

            {product.company && (
              <Link
                to={`/shop/${product.company._id}`}
                className="group mt-8 flex items-center gap-4 rounded-2xl border border-[#e5e4dc] bg-white p-4 transition-colors hover:border-[#1d211a]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eff4e5] text-[#414b30] transition-colors group-hover:bg-[#c9f06b]">
                  <Store className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#7d8c60]">
                    Sold by
                  </span>
                  <span className="block truncate font-semibold text-[#20221d]">
                    {product.company.name}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 text-[#343a2d] transition-transform duration-300 group-hover:translate-x-1.5" />
              </Link>
            )}
          </div>

          <div>
            {product.description ? (
              <p className="whitespace-pre-line text-base leading-8 text-[#555951] sm:text-lg sm:leading-9">
                {product.description}
              </p>
            ) : (
              <p className="text-[#85877e]">No description provided.</p>
            )}
          </div>
        </section>

        {/* --------------------------- Reviews ------------------------- */}
        <div id="reviews" data-reveal className="scroll-mt-24">
          <ReviewsSection
            productId={product._id}
            variantId={selectedVariantId || undefined}
            ratingAverage={ratingAvg}
            ratingCount={ratingCount}
          />
        </div>
      </div>

      {/* Sticky mobile buy bar */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-[#e5e4dc] bg-[#faf9f6]/90 px-4 py-3 backdrop-blur-xl transition-transform duration-500 lg:hidden ${
          showBar ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-[#85877e]">{product.name}</p>
            <p className="font-serif text-xl font-medium tracking-[-0.03em] text-[#1f261a]">
              ₹{fmt(displayPrice)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!canBuy}
            className="flex h-12 items-center gap-2 rounded-full bg-[#1d211a] px-6 text-sm font-semibold text-white disabled:bg-[#d9d8cf] disabled:text-[#85877e]"
          >
            <ShoppingBag className="h-4 w-4 text-[#c9f06b]" />
            {canBuy ? 'Add to cart' : 'Out of stock'}
          </button>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap');

        .roboexpert-pdp {
          font-family: 'DM Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }

        .roboexpert-pdp .font-serif {
          font-family: 'Playfair Display', Georgia, serif;
        }

        .roboexpert-pdp ::selection {
          background: #c9f06b;
          color: #1d211a;
        }

        .pdp-shine::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%);
          transform: translateX(-120%);
          transition: transform 0.9s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .pdp-shine:not(:disabled):hover::after {
          transform: translateX(120%);
        }
      `}</style>
    </div>
  );
}