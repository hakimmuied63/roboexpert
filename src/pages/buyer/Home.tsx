
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Headphones,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
  Zap,
} from 'lucide-react';
import { Button, EmptyState } from '../../components/ui';
import { CategorySection } from '../../components/home/CategorySection';
import { PromoBanners } from '../../components/home/PromoBanners';
import { ProductSection } from '../../components/product/ProductSection';
import {
  fetchAllProducts,
  fetchAllCompanies,
  type Product,
  type CompanySummary,
  type Category,
} from '../../lib/api';
import { hasUsableImage } from '../../lib/marketplaceUi';

/* -------------------------------------------------------------------------- */
/* Premium hero carousel                                                       */
/* -------------------------------------------------------------------------- */

const SLIDES = [
  {
    eyebrow: 'The everyday upgrade',
    title: 'Good finds.\nBetter living.',
    text: 'Discover independent brands, everyday essentials and little things worth getting excited about.',
    cta: 'Explore the edit',
    href: '/search?filter=trending',
    image:
      'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1400&q=85',
    alt: 'Premium sneaker product photography',
    tag: 'THE NEW SEASON',
    number: '01',
  },
  {
    eyebrow: 'Fresh on the shelves',
    title: 'Meet your\nnext favourite.',
    text: 'New arrivals from sellers with a point of view. Find something different, every time.',
    cta: 'Shop new arrivals',
    href: '/search',
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1400&q=85',
    alt: 'Minimal watch product photography',
    tag: 'JUST LANDED',
    number: '02',
  },
  {
    eyebrow: 'Your business, your way',
    title: 'Make room\nfor your brand.',
    text: 'Bring your products to more people with a storefront that is yours to grow.',
    cta: 'Start selling',
    href: '/sell',
    image:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=85',
    alt: 'Beautifully arranged retail store',
    tag: 'FOR AMBITIOUS SELLERS',
    number: '03',
  },
];

function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(
    () => setIndex((current) => (current + 1) % SLIDES.length),
    [],
  );

  const prev = () =>
    setIndex((current) => (current - 1 + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    if (paused) return;

    const timer = window.setInterval(next, 6000);
    return () => window.clearInterval(timer);
  }, [paused, next]);

  const slide = SLIDES[index];

  return (
    <section className="mx-auto max-w-[1440px] px-4 pt-4 sm:px-6 sm:pt-6 lg:px-10">
      <div
        className="relative isolate overflow-hidden rounded-[1.75rem] bg-[#e9e7df] text-[#191b18] sm:rounded-[2.25rem]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="grid min-h-[510px] grid-cols-1 md:min-h-[570px] md:grid-cols-[0.95fr_1.05fr]">
          <div className="relative z-10 flex flex-col items-start justify-center px-6 pb-10 pt-10 sm:px-10 md:px-12 lg:px-16 lg:py-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/55 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.2em]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#a8d530]" />
              {slide.eyebrow}
            </div>

            <h1 className="mt-7 whitespace-pre-line font-serif text-[3.5rem] font-medium leading-[0.91] tracking-[-0.065em] sm:text-7xl lg:text-[6.25rem]">
              {slide.title}
            </h1>

            <p className="mt-6 max-w-md text-sm leading-7 text-[#555951] sm:text-base sm:leading-8">
              {slide.text}
            </p>

            <Link
              to={slide.href}
              className="group mt-8 inline-flex items-center gap-4 rounded-full bg-[#1d211a] py-2 pl-6 pr-2 text-sm font-semibold text-white transition duration-300 hover:bg-[#343a2d]"
            >
              {slide.cta}
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c9f06b] text-[#1d211a] transition-transform duration-300 group-hover:rotate-[-35deg]">
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>

            <div className="mt-12 flex items-center gap-4">
              <span className="font-mono text-xs tracking-widest text-[#777b70]">
                {slide.number}
              </span>

              <div className="flex gap-1.5">
                {SLIDES.map((item, idx) => (
                  <button
                    key={item.number}
                    type="button"
                    aria-label={`Go to slide ${idx + 1}`}
                    onClick={() => setIndex(idx)}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      idx === index
                        ? 'w-10 bg-[#1d211a]'
                        : 'w-4 bg-black/20 hover:bg-black/40'
                    }`}
                  />
                ))}
              </div>

              <span className="font-mono text-xs tracking-widest text-[#777b70]">
                03
              </span>
            </div>
          </div>

          <div className="relative min-h-[300px] overflow-hidden md:min-h-full">
            <div
              key={slide.image}
              className="absolute inset-0 animate-[fadeIn_500ms_ease-out]"
              style={{
                backgroundImage: `linear-gradient(90deg, rgba(233,231,223,0.15), transparent 35%), url("${slide.image}")`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
              }}
              role="img"
              aria-label={slide.alt}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent md:bg-gradient-to-l md:from-transparent md:to-[#e9e7df]/10" />

            <div className="absolute left-5 top-5 rounded-full border border-white/50 bg-white/75 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-[#242720] backdrop-blur-md sm:left-8 sm:top-8">
              {slide.tag}
            </div>

            <div className="absolute bottom-5 right-5 flex items-center gap-2 rounded-full border border-white/40 bg-black/25 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md sm:bottom-8 sm:right-8">
              Curated for you
              <Sparkles className="h-3.5 w-3.5 text-[#c9f06b]" />
            </div>

            <div className="absolute bottom-5 left-5 flex gap-2 md:bottom-8 md:left-auto md:right-8">
              <button
                type="button"
                aria-label="Previous slide"
                onClick={prev}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/65 text-[#1d211a] backdrop-blur transition hover:bg-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                aria-label="Next slide"
                onClick={next}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/65 text-[#1d211a] backdrop-blur transition hover:bg-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap');

        .roboexpert-home {
          font-family: 'DM Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }

        .roboexpert-home .font-serif {
          font-family: 'Playfair Display', Georgia, serif;
        }

        @keyframes fadeIn {
          from {
            opacity: .35;
            transform: scale(1.025);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .roboexpert-home *,
          .roboexpert-home *::before,
          .roboexpert-home *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Trust strip                                                                 */
/* -------------------------------------------------------------------------- */

const TRUST = [
  { icon: Truck, title: 'Delivery that delivers', sub: 'Across India' },
  { icon: ShieldCheck, title: 'Shop with confidence', sub: 'Secure checkout' },
  { icon: RotateCcw, title: 'A simpler return', sub: 'Easy return process' },
  { icon: Headphones, title: 'Real help, when needed', sub: 'Customer support' },
];

function TrustBar() {
  return (
    <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
      <div className="grid grid-cols-2 border-y border-[#e5e4dc] md:grid-cols-4">
        {TRUST.map(({ icon: Icon, title, sub }, index) => (
          <div
            key={title}
            className={`flex items-center gap-3 py-5 sm:gap-4 sm:py-6 ${
              index % 2 === 0 ? 'pr-3' : 'pl-3'
            } ${
              index < 2
                ? 'border-b border-[#e5e4dc] md:border-b-0'
                : ''
            } ${
              index % 2 === 1
                ? 'md:border-l md:border-[#e5e4dc] md:pl-6'
                : 'md:pl-0'
            }`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eff4e5] text-[#414b30] sm:h-11 sm:w-11">
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.7} />
            </span>

            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-[-0.02em] text-[#242720] sm:text-sm">
                {title}
              </p>
              <p className="mt-1 text-[11px] text-[#85877e] sm:text-xs">
                {sub}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Daily deals countdown                                                       */
/* -------------------------------------------------------------------------- */

function useCountdown() {
  const calculate = () => {
    const now = new Date();
    const end = new Date(now);

    end.setHours(24, 0, 0, 0);

    const seconds = Math.max(
      0,
      Math.floor((end.getTime() - now.getTime()) / 1000),
    );

    return {
      h: Math.floor(seconds / 3600),
      m: Math.floor((seconds % 3600) / 60),
      s: seconds % 60,
    };
  };

  const [time, setTime] = useState(calculate);

  useEffect(() => {
    const timer = window.setInterval(() => setTime(calculate()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return time;
}

function DealsCountdown() {
  const { h, m, s } = useCountdown();
  const pad = (value: number) => String(value).padStart(2, '0');

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#20251b] px-5 py-4 text-white sm:px-7">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#c9f06b] text-[#20251b]">
            <Zap className="h-4 w-4 fill-current" />
          </span>

          <div>
            <p className="text-sm font-semibold tracking-tight sm:text-base">
              The daily edit
            </p>
            <p className="mt-0.5 text-[11px] text-white/55 sm:text-xs">
              Fresh finds, while they last
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-sm tabular-nums">
          {[h, m, s].map((value, index) => (
            <span key={index} className="flex items-center gap-2">
              <span className="min-w-[2.5rem] rounded-lg border border-white/10 bg-white/[0.07] px-2.5 py-2 text-center">
                {pad(value)}
              </span>
              {index < 2 && <span className="text-white/40">:</span>}
            </span>
          ))}
          <span className="ml-1 text-[9px] uppercase tracking-[0.18em] text-white/45">
            left
          </span>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Seller call to action                                                       */
/* -------------------------------------------------------------------------- */

function SellerCta({ sellers }: { sellers: number }) {
  return (
    <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
      <div className="relative isolate overflow-hidden rounded-[1.75rem] bg-[#d8efad] px-6 py-9 sm:rounded-[2.25rem] sm:px-10 sm:py-12 lg:px-16 lg:py-16">
        <div className="absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full border-[45px] border-white/25 sm:h-96 sm:w-96 sm:border-[60px]" />
        <div className="absolute -bottom-20 right-[25%] -z-10 h-52 w-52 rounded-full bg-white/25 blur-2xl" />

        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#465735]">
              <Store className="h-4 w-4" />
              The seller's corner
            </div>

            <h2 className="mt-5 font-serif text-4xl font-medium leading-[0.98] tracking-[-0.055em] text-[#1f261a] sm:text-5xl lg:text-6xl">
              Your products deserve
              <br className="hidden sm:block" /> a bigger stage.
            </h2>

            <p className="mt-5 max-w-lg text-sm leading-7 text-[#526046] sm:text-base">
              {sellers > 0
                ? `Join ${sellers} ${sellers === 1 ? 'seller' : 'sellers'} and put your products in front of more customers.`
                : 'Open your store, show the world what you make, and build your business on your terms.'}
            </p>
          </div>

          <Link
            to="/sell"
            className="group inline-flex w-full items-center justify-between gap-8 rounded-full bg-[#20251b] py-2 pl-6 pr-2 text-sm font-semibold text-white transition hover:bg-[#343c2c] md:w-auto"
          >
            Start your store
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#20251b] transition-transform group-hover:rotate-[-35deg]">
              <ArrowDownRight className="h-5 w-5" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Homepage                                                                    */
/* -------------------------------------------------------------------------- */

export function Home() {
  const { categories = [] } =
    useOutletContext<{ categories?: Category[] }>() || {};

  const [products, setProducts] = useState<Product[]>([]);
  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);

    try {
      const [allProducts, allCompanies] = await Promise.all([
        fetchAllProducts(),
        fetchAllCompanies(),
      ]);

      setProducts(allProducts);
      setCompanies(allCompanies);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const validProducts = useMemo(
    () => products.filter(hasUsableImage),
    [products],
  );

  const todaysDeals = useMemo(
    () => (validProducts.length >= 6 ? validProducts : products).slice(0, 6),
    [validProducts, products],
  );

  const bestSellers = useMemo(() => {
    const list =
      validProducts.length >= 12
        ? validProducts.slice(6, 12)
        : validProducts.slice(0, 6);

    return list.length > 0 ? list : products.slice(0, 6);
  }, [validProducts, products]);

  return (
    <div className="roboexpert-home min-h-screen space-y-10 overflow-x-hidden bg-[#faf9f6] pb-14 text-[#20221d] sm:space-y-14 sm:pb-20">
      <HeroCarousel />

      <TrustBar />

      {error ? (
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
            <EmptyState
              icon={<AlertCircle className="h-8 w-8 text-red-500" />}
              title="Couldn't load products"
              description="Please try again. Your cart and account are unaffected."
              action={
                <Button onClick={load} variant="primary">
                  Try again
                </Button>
              }
            />
          </div>
        </div>
      ) : (
        <>
          <div id="todays-deals" className="space-y-0">
            <DealsCountdown />

            <div className="pt-5 sm:pt-7">
              <ProductSection
                title="Today's Deals"
                badge="Handpicked for you"
                icon={<Zap className="h-5 w-5" />}
                products={todaysDeals}
                loading={loading}
                seeAllHref="/search?filter=trending"
                seeAllText="Explore all deals"
              />
            </div>
          </div>

          <section className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10">
            <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#7d8c60]">
                  Browse your way
                </p>

                <h2 className="font-serif text-3xl font-medium tracking-[-0.05em] sm:text-4xl">
                  Find your thing.
                </h2>
              </div>

              <span className="hidden text-xs text-[#85877e] sm:block">
                A little bit of everything
              </span>
            </div>

            <CategorySection categories={categories} />
          </section>

          <div className="space-y-3">
            <div className="mx-auto flex max-w-[1440px] items-end justify-between px-4 sm:px-6 lg:px-10">
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#7d8c60]">
                  Worth a closer look
                </p>

                <h2 className="font-serif text-3xl font-medium tracking-[-0.05em] sm:text-4xl">
                  The crowd favourites.
                </h2>
              </div>

              <Link
                to="/search"
                className="group mb-1 inline-flex items-center gap-2 text-xs font-semibold text-[#343a2d] sm:text-sm"
              >
                View everything
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <ProductSection
              title="Best Sellers"
              products={bestSellers}
              loading={loading}
              seeAllHref="/search"
              seeAllText="View all products"
            />
          </div>

          <PromoBanners />

          <SellerCta sellers={companies.length} />
        </>
      )}

      {!loading && !error && companies.length > 0 && (
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 text-center text-[11px] tracking-wide text-[#8a8b82] sm:text-xs">
          <span className="h-1 w-1 rounded-full bg-[#a8c56e]" />
          {products.length} products
          <span className="text-[#c3c3ba]">/</span>
          {companies.length} {companies.length === 1 ? 'seller' : 'sellers'}
          <span>across India</span>
        </div>
      )}
    </div>
  );
}
