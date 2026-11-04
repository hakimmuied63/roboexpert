import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';
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

gsap.registerPlugin(useGSAP, ScrollTrigger);

const BRAND = 'Roboexpert';
const INTRO_KEY = 'home-intro-seen';
const INTRO_HERO_DELAY = 1.7;
const DARK_FINALE = true; // page fades to dark behind the seller CTA
const CARD_SELECTOR = '[data-cards] [data-card], [data-cards] article';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* -------------------------------------------------------------------------- */
/* Intro curtain                                                               */
/* -------------------------------------------------------------------------- */

function Intro({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const counter = { v: 0 };

      const tl = gsap.timeline({ onComplete: onDone });

      tl.fromTo(
        '.i-char',
        { yPercent: 115 },
        { yPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.05 },
        0,
      )
        .fromTo(
          '.i-bar',
          { scaleX: 0 },
          { scaleX: 1, duration: 1.2, ease: 'power3.inOut' },
          0.1,
        )
        .to(
          counter,
          {
            v: 100,
            duration: 1.2,
            ease: 'power3.inOut',
            onUpdate: () => {
              if (count.current) {
                count.current.textContent = String(
                  Math.round(counter.v),
                ).padStart(3, '0');
              }
            },
          },
          0.1,
        )
        .to(
          '.i-content',
          { yPercent: -25, opacity: 0, duration: 0.5, ease: 'power2.in' },
          1.45,
        )
        .to(
          root.current,
          { yPercent: -100, duration: 1, ease: 'expo.inOut' },
          1.55,
        );
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      aria-hidden
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#1d211a] text-[#faf9f6]"
    >
      <div className="i-content flex flex-col items-center">
        <div className="flex overflow-hidden pb-3 font-serif text-5xl font-medium tracking-[-0.05em] sm:text-8xl">
          {BRAND.split('').map((char, i) => (
            <span key={i} className="i-char inline-block">
              {char}
            </span>
          ))}
        </div>

        <div className="mt-6 h-px w-48 overflow-hidden bg-white/15">
          <span className="i-bar block h-full origin-left bg-[#c9f06b]" />
        </div>

        <p className="mt-4 font-mono text-[11px] tracking-[0.3em] text-white/50">
          <span ref={count}>000</span>
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Custom cursor                                                               */
/* -------------------------------------------------------------------------- */

function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const both = [ring.current, dot.current];
    gsap.set(both, { xPercent: -50, yPercent: -50, opacity: 0 });

    const rx = gsap.quickTo(ring.current, 'x', {
      duration: 0.55,
      ease: 'power3.out',
    });
    const ry = gsap.quickTo(ring.current, 'y', {
      duration: 0.55,
      ease: 'power3.out',
    });

    let shown = false;

    const move = (e: MouseEvent) => {
      if (!shown) {
        shown = true;
        gsap.set(ring.current, { x: e.clientX, y: e.clientY });
        gsap.to(both, { opacity: 1, duration: 0.3 });
      }
      gsap.set(dot.current, { x: e.clientX, y: e.clientY });
      rx(e.clientX);
      ry(e.clientY);
    };

    const over = (e: MouseEvent) => {
      const hot = (e.target as Element | null)?.closest?.(
        'a, button, input, [data-magnetic]',
      );
      gsap.to(ring.current, {
        scale: hot ? 2.4 : 1,
        duration: 0.4,
        ease: 'power3.out',
        overwrite: 'auto',
      });
      gsap.to(dot.current, {
        scale: hot ? 0 : 1,
        duration: 0.25,
        overwrite: 'auto',
      });
    };

    const leave = () => {
      shown = false;
      gsap.to(both, { opacity: 0, duration: 0.3 });
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseover', over);
    document.documentElement.addEventListener('mouseleave', leave);

    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', over);
      document.documentElement.removeEventListener('mouseleave', leave);
    };
  });

  return (
    <>
      <div
        ref={ring}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[150] h-9 w-9 rounded-full border border-white opacity-0 mix-blend-difference [@media(pointer:coarse)]:hidden"
      />
      <div
        ref={dot}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[150] h-1.5 w-1.5 rounded-full bg-white opacity-0 mix-blend-difference [@media(pointer:coarse)]:hidden"
      />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Premium hero carousel                                                       */
/* -------------------------------------------------------------------------- */

const SLIDE_SECONDS = 6.5;

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

function HeroCarousel({ startDelay }: { startDelay: number }) {
  const [index, setIndex] = useState(0);
  const section = useRef<HTMLElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const imageWrap = useRef<HTMLDivElement>(null);
  const progress = useRef<gsap.core.Tween | null>(null);
  const hasPlayed = useRef(false);

  const next = useCallback(
    () => setIndex((current) => (current + 1) % SLIDES.length),
    [],
  );
  const prev = () =>
    setIndex((current) => (current - 1 + SLIDES.length) % SLIDES.length);

  const slide = SLIDES[index];

  // Slide-in timeline + GSAP-driven autoplay progress
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      // only the very first play waits for the intro curtain
      const d = hasPlayed.current ? 0 : startDelay;

      progress.current?.kill();

      const tl = gsap.timeline({
        delay: d,
        defaults: { ease: 'expo.out' },
        onStart: () => {
          hasPlayed.current = true;
        },
      });

      // big wipe-in from the right with a zoom settle
      tl.fromTo(
        '.h-img',
        { clipPath: 'inset(0% 0% 0% 100%)', scale: 1.35 },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          scale: 1,
          duration: 1.6,
          ease: 'expo.inOut',
        },
        0,
      )
        .fromTo(
          '.h-eyebrow',
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9 },
          0.1,
        )
        // letter-by-letter flip up
        .fromTo(
          '.h-char',
          { yPercent: 130, rotate: 10, opacity: 0 },
          {
            yPercent: 0,
            rotate: 0,
            opacity: 1,
            duration: 1.1,
            stagger: 0.025,
          },
          0.2,
        )
        .fromTo(
          '.h-text',
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, duration: 1 },
          0.8,
        )
        .fromTo(
          '.h-cta',
          { y: 28, opacity: 0, scale: 0.94 },
          { y: 0, opacity: 1, scale: 1, duration: 1 },
          0.95,
        )
        .fromTo(
          '.h-meta',
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          1.1,
        )
        .fromTo(
          '.h-tag',
          { x: -24, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.9 },
          1.05,
        )
        .fromTo(
          '.h-badge',
          { x: 24, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.9 },
          1.15,
        )
        .fromTo(
          '.h-nav',
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.8,
            ease: 'back.out(2)',
            stagger: 0.08,
          },
          1.2,
        );

      // slow Ken Burns zoom
      gsap.fromTo(
        '.h-kb',
        { scale: 1 },
        {
          scale: 1.12,
          duration: SLIDE_SECONDS + 3,
          ease: 'none',
          delay: d,
        },
      );

      // floating badge + spinning sparkle
      gsap.to('.h-badge', {
        y: -7,
        duration: 2.2,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        delay: d + 1.6,
      });
      gsap.to('.h-spark', {
        rotate: 360,
        duration: 7,
        repeat: -1,
        ease: 'none',
      });

      progress.current = gsap.fromTo(
        '.h-progress',
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: SLIDE_SECONDS,
          ease: 'none',
          delay: d,
          onComplete: next,
        },
      );
    },
    { scope: root, dependencies: [index], revertOnUpdate: true },
  );

  // Mouse parallax on the hero image
  useGSAP(
    () => {
      const wrap = imageWrap.current;
      if (!wrap || prefersReducedMotion()) return;
      if (!window.matchMedia('(pointer: fine)').matches) return;

      const xTo = gsap.quickTo('.h-parallax', 'x', {
        duration: 0.9,
        ease: 'power3.out',
      });
      const yTo = gsap.quickTo('.h-parallax', 'y', {
        duration: 0.9,
        ease: 'power3.out',
      });

      const move = (e: MouseEvent) => {
        const r = wrap.getBoundingClientRect();
        xTo(((e.clientX - r.left) / r.width - 0.5) * -26);
        yTo(((e.clientY - r.top) / r.height - 0.5) * -26);
      };
      const leave = () => {
        xTo(0);
        yTo(0);
      };

      wrap.addEventListener('mousemove', move);
      wrap.addEventListener('mouseleave', leave);
      return () => {
        wrap.removeEventListener('mousemove', move);
        wrap.removeEventListener('mouseleave', leave);
      };
    },
    { scope: root },
  );

  // Hero card shrinks slightly as you scroll away
  useGSAP(
    () => {
      if (prefersReducedMotion() || !root.current) return;

      gsap.to(root.current, {
        scale: 0.94,
        y: 36,
        transformOrigin: 'center top',
        ease: 'none',
        scrollTrigger: {
          trigger: section.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    },
    { scope: section },
  );

  const lines = slide.title.split('\n');

  return (
    <section
      ref={section}
      className="mx-auto max-w-[1440px] px-4 pt-4 sm:px-6 sm:pt-6 lg:px-10"
    >
      <div
        ref={root}
        className="relative isolate overflow-hidden rounded-[1.75rem] bg-[#e9e7df] text-[#191b18] shadow-[0_40px_90px_-40px_rgba(32,37,27,0.45)] ring-1 ring-black/5 sm:rounded-[2.25rem]"
        onMouseEnter={() => progress.current?.pause()}
        onMouseLeave={() => progress.current?.resume()}
      >
        <div className="grid min-h-[510px] grid-cols-1 md:min-h-[600px] md:grid-cols-[0.95fr_1.05fr]">
          <div className="relative z-10 flex flex-col items-start justify-center px-6 pb-10 pt-10 sm:px-10 md:px-12 lg:px-16 lg:py-16">
            <div className="h-eyebrow inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/55 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#a8d530]" />
              {slide.eyebrow}
            </div>

            <h1
              aria-label={lines.join(' ')}
              className="mt-7 font-serif text-[3.5rem] font-medium leading-[0.95] tracking-[-0.065em] sm:text-7xl lg:text-[6.25rem]"
            >
              {lines.map((line, li) => (
                <span key={li} aria-hidden className="block">
                  {line.split(' ').map((word, wi) => (
                    <span
                      key={wi}
                      className="mr-[0.2em] inline-block -mb-[0.14em] overflow-hidden pb-[0.14em] align-top"
                    >
                      {word.split('').map((char, ci) => (
                        <span
                          key={ci}
                          className="h-char inline-block origin-bottom-left will-change-transform"
                        >
                          {char}
                        </span>
                      ))}
                    </span>
                  ))}
                </span>
              ))}
            </h1>

            <p className="h-text mt-6 max-w-md text-sm leading-7 text-[#555951] sm:text-base sm:leading-8">
              {slide.text}
            </p>

            <Link
              to={slide.href}
              data-magnetic
              className="h-cta group mt-8 inline-flex items-center gap-4 rounded-full bg-[#1d211a] py-2 pl-6 pr-2 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#343a2d]"
            >
              {slide.cta}
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c9f06b] text-[#1d211a] transition-transform duration-500 group-hover:rotate-[-35deg]">
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>

            <div className="h-meta mt-12 flex items-center gap-4">
              <span className="font-mono text-xs tracking-widest text-[#777b70]">
                {slide.number}
              </span>

              <div className="flex gap-2">
                {SLIDES.map((item, idx) => (
                  <button
                    key={item.number}
                    type="button"
                    aria-label={`Go to slide ${idx + 1}`}
                    onClick={() => setIndex(idx)}
                    className="relative h-[3px] w-12 overflow-hidden rounded-full bg-black/15"
                  >
                    {idx === index && (
                      <span className="h-progress absolute inset-0 origin-left scale-x-0 bg-[#1d211a]" />
                    )}
                  </button>
                ))}
              </div>

              <span className="font-mono text-xs tracking-widest text-[#777b70]">
                0{SLIDES.length}
              </span>
            </div>
          </div>

          <div
            ref={imageWrap}
            className="relative min-h-[320px] overflow-hidden md:min-h-full"
          >
            <div key={slide.image} className="h-img absolute inset-0">
              <div className="h-kb absolute inset-0 will-change-transform">
                <div
                  className="h-parallax absolute -inset-8 will-change-transform"
                  style={{
                    backgroundImage: `linear-gradient(90deg, rgba(233,231,223,0.18), transparent 35%), url("${slide.image}")`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                  }}
                  role="img"
                  aria-label={slide.alt}
                />
              </div>
            </div>

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent md:bg-gradient-to-l md:from-transparent md:to-[#e9e7df]/10" />

            <div className="h-tag absolute left-5 top-5 rounded-full border border-white/50 bg-white/75 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-[#242720] backdrop-blur-md sm:left-8 sm:top-8">
              {slide.tag}
            </div>

            <div className="h-badge absolute bottom-5 right-5 flex items-center gap-2 rounded-full border border-white/40 bg-black/25 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md sm:bottom-8 sm:right-8">
              Curated for you
              <Sparkles className="h-spark h-3.5 w-3.5 text-[#c9f06b]" />
            </div>

            <div className="absolute bottom-5 left-5 flex gap-2 md:bottom-8 md:left-auto md:right-52">
              <button
                type="button"
                aria-label="Previous slide"
                onClick={prev}
                className="h-nav flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/65 text-[#1d211a] backdrop-blur transition hover:scale-110 hover:bg-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                aria-label="Next slide"
                onClick={next}
                className="h-nav flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/65 text-[#1d211a] backdrop-blur transition hover:scale-110 hover:bg-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
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
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap.from('.trust-icon', {
        scale: 0,
        rotate: -45,
        duration: 0.9,
        ease: 'back.out(2.2)',
        stagger: 0.12,
        scrollTrigger: { trigger: root.current, start: 'top 94%', once: true },
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10"
    >
      <div
        data-stagger
        className="grid grid-cols-2 border-y border-[#e5e4dc] md:grid-cols-4"
      >
        {TRUST.map(({ icon: Icon, title, sub }, index) => (
          <div
            key={title}
            className={`group flex items-center gap-3 py-5 sm:gap-4 sm:py-6 ${
              index % 2 === 0 ? 'pr-3' : 'pl-3'
            } ${index < 2 ? 'border-b border-[#e5e4dc] md:border-b-0' : ''} ${
              index % 2 === 1
                ? 'md:border-l md:border-[#e5e4dc] md:pl-6'
                : 'md:pl-0'
            }`}
          >
            <span className="trust-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eff4e5] text-[#414b30] transition-colors duration-500 group-hover:bg-[#c9f06b] sm:h-11 sm:w-11">
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
/* Marquee (reacts to scroll velocity)                                         */
/* -------------------------------------------------------------------------- */

const MARQUEE_WORDS = [
  'Independent brands',
  'Everyday essentials',
  'Made by sellers you can trust',
  'Delivered across India',
  'Little things worth loving',
];

function Marquee() {
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = track.current;
      if (prefersReducedMotion() || !el) return;

      const tween = gsap.to(el, {
        xPercent: -50,
        duration: 40,
        ease: 'none',
        repeat: -1,
      });

      let hovering = false;
      const rest = () => (hovering ? 0.2 : 1);
      let boost: gsap.core.Timeline | null = null;

      const enter = () => {
        hovering = true;
        gsap.to(tween, { timeScale: 0.2, duration: 0.6, overwrite: true });
      };
      const leave = () => {
        hovering = false;
        gsap.to(tween, { timeScale: 1, duration: 0.6, overwrite: true });
      };

      el.addEventListener('mouseenter', enter);
      el.addEventListener('mouseleave', leave);

      const st = ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          const v = self.getVelocity();
          const speed = Math.min(Math.abs(v) / 250, 6);
          const skew = gsap.utils.clamp(-6, 6, -v / 300);

          boost?.kill();
          boost = gsap
            .timeline()
            .to(tween, { timeScale: rest() + speed, duration: 0.2 }, 0)
            .to(el, { skewX: skew, duration: 0.2 }, 0)
            .to(tween, { timeScale: rest(), duration: 1.1 }, 0.2)
            .to(el, { skewX: 0, duration: 1.1 }, 0.2);
        },
      });

      return () => {
        st.kill();
        boost?.kill();
        el.removeEventListener('mouseenter', enter);
        el.removeEventListener('mouseleave', leave);
      };
    },
    { scope: track },
  );

  const items = [...MARQUEE_WORDS, ...MARQUEE_WORDS];

  return (
    <div
      data-reveal
      className="overflow-hidden border-y border-[#e5e4dc] py-5 sm:py-7"
    >
      <div ref={track} className="flex w-max items-center whitespace-nowrap">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center">
            {items.map((word, i) => (
              <span
                key={`${copy}-${i}`}
                className="flex items-center font-serif text-3xl font-medium tracking-[-0.04em] text-[#20221d]/80 sm:text-5xl"
              >
                {word}
                <Sparkles className="mx-6 h-5 w-5 text-[#a8d530] sm:mx-10 sm:h-7 sm:w-7" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Giant scroll-scrubbed brand type                                            */
/* -------------------------------------------------------------------------- */

function BigType() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const st = {
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      };

      gsap.fromTo('.bt-a', { xPercent: 6 }, { xPercent: -38, ease: 'none', scrollTrigger: st });
      gsap.fromTo('.bt-b', { xPercent: -38 }, { xPercent: 4, ease: 'none', scrollTrigger: st });
    },
    { scope: root },
  );

  const text = `${BRAND} — ${BRAND} — ${BRAND}`;

  return (
    <div
      ref={root}
      aria-hidden
      className="select-none overflow-hidden py-2 sm:py-4"
    >
      <div className="bt-a w-max whitespace-nowrap font-serif text-[20vw] font-medium leading-[0.95] tracking-[-0.06em] text-[#20221d]">
        {text}
      </div>
      <div
        className="bt-b w-max whitespace-nowrap font-serif text-[20vw] font-medium leading-[0.95] tracking-[-0.06em]"
        style={{ color: 'transparent', WebkitTextStroke: '1.5px #20221d' }}
      >
        {text}
      </div>
    </div>
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
  const secRef = useRef<HTMLSpanElement>(null);
  const pad = (value: number) => String(value).padStart(2, '0');

  // tick flip on the seconds digit
  useGSAP(
    () => {
      if (prefersReducedMotion() || !secRef.current) return;
      gsap.fromTo(
        secRef.current,
        { yPercent: -40, opacity: 0.2 },
        { yPercent: 0, opacity: 1, duration: 0.45, ease: 'power3.out' },
      );
    },
    { dependencies: [s] },
  );

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
      <div className="relative flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-2xl bg-[#20251b] px-5 py-4 text-white shadow-[0_24px_60px_-30px_rgba(32,37,27,0.9)] sm:px-7">
        <div className="pointer-events-none absolute -left-10 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-[#c9f06b]/20 blur-3xl" />

        <div className="relative flex items-center gap-3">
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

        <div className="relative flex items-center gap-2 font-mono text-sm tabular-nums">
          {[h, m, s].map((value, index) => (
            <span key={index} className="flex items-center gap-2">
              <span className="min-w-[2.5rem] overflow-hidden rounded-lg border border-white/10 bg-white/[0.07] px-2.5 py-2 text-center">
                <span
                  ref={index === 2 ? secRef : undefined}
                  className="block"
                >
                  {pad(value)}
                </span>
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
/* Animated counter + stats                                                    */
/* -------------------------------------------------------------------------- */

function Counter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      if (prefersReducedMotion()) {
        el.textContent = value.toLocaleString('en-IN');
        return;
      }

      const obj = { v: 0 };
      gsap.to(obj, {
        v: value,
        duration: 2.2,
        ease: 'power3.out',
        snap: { v: 1 },
        onUpdate: () => {
          el.textContent = obj.v.toLocaleString('en-IN');
        },
        scrollTrigger: { trigger: el, start: 'top 95%', once: true },
      });
    },
    { dependencies: [value], revertOnUpdate: true },
  );

  return <span ref={ref}>0</span>;
}

function StatsBand({
  products,
  sellers,
}: {
  products: number;
  sellers: number;
}) {
  return (
    <section
      data-reveal
      className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10"
    >
      <div className="grid grid-cols-1 divide-y divide-[#e5e4dc] rounded-[1.75rem] border border-[#e5e4dc] bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {[
          { label: 'Products to discover', node: <Counter value={products} /> },
          {
            label: sellers === 1 ? 'Independent seller' : 'Independent sellers',
            node: <Counter value={sellers} />,
          },
          { label: 'Delivering across', node: <span>India</span> },
        ].map((stat) => (
          <div key={stat.label} className="px-6 py-7 sm:px-9 sm:py-10">
            <p className="font-serif text-5xl font-medium tracking-[-0.05em] text-[#1f261a] sm:text-6xl">
              {stat.node}
            </p>
            <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#7d8c60]">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Seller call to action                                                       */
/* -------------------------------------------------------------------------- */

function SellerCta({ sellers }: { sellers: number }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap.to('.cta-ring', {
        yPercent: 22,
        rotate: 40,
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });

      gsap.to('.cta-blob', {
        yPercent: -45,
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        },
      });

      gsap.from('.cta-item', {
        y: 50,
        opacity: 0,
        duration: 1.1,
        stagger: 0.14,
        ease: 'expo.out',
        scrollTrigger: { trigger: root.current, start: 'top 75%', once: true },
      });

      // pulse ring on the arrow button
      gsap.fromTo(
        '.cta-pulse',
        { scale: 1, opacity: 0.8 },
        {
          scale: 1.9,
          opacity: 0,
          duration: 1.8,
          repeat: -1,
          ease: 'power2.out',
        },
      );
    },
    { scope: root },
  );

  return (
    <section
      id="seller-cta"
      ref={root}
      className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10"
    >
      <div className="relative isolate overflow-hidden rounded-[1.75rem] bg-[#d8efad] px-6 py-9 sm:rounded-[2.25rem] sm:px-10 sm:py-12 lg:px-16 lg:py-16">
        <div className="cta-ring absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full border-[45px] border-white/25 sm:h-96 sm:w-96 sm:border-[60px]" />
        <div className="cta-blob absolute -bottom-20 right-[25%] -z-10 h-52 w-52 rounded-full bg-white/30 blur-2xl" />

        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="cta-item inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#465735]">
              <Store className="h-4 w-4" />
              The seller's corner
            </div>

            <h2 className="cta-item mt-5 font-serif text-4xl font-medium leading-[0.98] tracking-[-0.055em] text-[#1f261a] sm:text-5xl lg:text-6xl">
              Your products deserve
              <br className="hidden sm:block" /> a bigger stage.
            </h2>

            <p className="cta-item mt-5 max-w-lg text-sm leading-7 text-[#526046] sm:text-base">
              {sellers > 0
                ? `Join ${sellers} ${sellers === 1 ? 'seller' : 'sellers'} and put your products in front of more customers.`
                : 'Open your store, show the world what you make, and build your business on your terms.'}
            </p>
          </div>

          <Link
            to="/sell"
            data-magnetic
            className="cta-item group inline-flex w-full items-center justify-between gap-8 rounded-full bg-[#20251b] py-2 pl-6 pr-2 text-sm font-semibold text-white transition-colors hover:bg-[#343c2c] md:w-auto"
          >
            Start your store
            <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#20251b] transition-transform duration-500 group-hover:rotate-[-35deg]">
              <span className="cta-pulse pointer-events-none absolute inset-0 rounded-full border border-white/80" />
              <ArrowDownRight className="h-5 w-5" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Section heading                                                             */
/* -------------------------------------------------------------------------- */

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#7d8c60]">
        {eyebrow}
      </p>
      <h2 className="overflow-hidden pb-1 font-serif text-3xl font-medium tracking-[-0.05em] sm:text-4xl">
        <span data-heading className="block will-change-transform">
          {title}
        </span>
      </h2>
      <span
        data-line
        className="mt-2 block h-[2px] w-16 origin-left bg-[#a8d530]"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Homepage                                                                    */
/* -------------------------------------------------------------------------- */

export function Home() {
  const { categories = [] } =
    useOutletContext<{ categories?: Category[] }>() || {};

  const root = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // show the intro curtain once per session
  const [intro, setIntro] = useState(() => {
    if (typeof window === 'undefined' || prefersReducedMotion()) return false;
    try {
      return !sessionStorage.getItem(INTRO_KEY);
    } catch {
      return true;
    }
  });
  const introAtMount = useRef(intro);

  const finishIntro = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_KEY, '1');
    } catch {
      /* ignore */
    }
    setIntro(false);
    lenisRef.current?.start();
    window.setTimeout(() => ScrollTrigger.refresh(), 100);
  }, []);

  // lock scroll while the curtain is up
  useEffect(() => {
    if (!intro) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [intro]);

  // buttery smooth scroll, synced with GSAP
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95 });
    lenisRef.current = lenis;
    if (introAtMount.current) lenis.stop();

    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

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

  // Scroll progress bar + magnetic buttons (run once)
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap.to('.scroll-progress', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: document.documentElement,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.3,
        },
      });

      if (!window.matchMedia('(pointer: fine)').matches) return;

      const cleanups: Array<() => void> = [];

      gsap.utils.toArray<HTMLElement>('[data-magnetic]').forEach((el) => {
        const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
        const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });

        const move = (e: MouseEvent) => {
          const r = el.getBoundingClientRect();
          xTo((e.clientX - (r.left + r.width / 2)) * 0.25);
          yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
        };
        const leave = () => {
          xTo(0);
          yTo(0);
        };

        el.addEventListener('mousemove', move);
        el.addEventListener('mouseleave', leave);
        cleanups.push(() => {
          el.removeEventListener('mousemove', move);
          el.removeEventListener('mouseleave', leave);
        });
      });

      return () => cleanups.forEach((fn) => fn());
    },
    { scope: root },
  );

  // Page fades to dark behind the seller CTA
  useGSAP(
    () => {
      if (!DARK_FINALE || prefersReducedMotion() || error) return;

      gsap.to(root.current, {
        backgroundColor: '#14170f',
        ease: 'none',
        scrollTrigger: {
          trigger: '#seller-cta',
          start: 'top 85%',
          end: 'top 35%',
          scrub: true,
        },
      });
    },
    { scope: root, dependencies: [error], revertOnUpdate: true },
  );

  // Scroll reveals, image parallax, card tilt
  // re-scans when content swaps (loading/error), skips already-animated nodes
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        if (el.dataset.done) return;
        el.dataset.done = '1';

        gsap.from(el, {
          y: 56,
          opacity: 0,
          duration: 1.1,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-heading]').forEach((el) => {
        if (el.dataset.done) return;
        el.dataset.done = '1';

        gsap.from(el, {
          yPercent: 110,
          duration: 1.1,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-line]').forEach((el) => {
        if (el.dataset.done) return;
        el.dataset.done = '1';

        gsap.from(el, {
          scaleX: 0,
          duration: 1.2,
          delay: 0.25,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-stagger]').forEach((el) => {
        if (el.dataset.done) return;
        el.dataset.done = '1';

        gsap.from(el.children, {
          y: 30,
          opacity: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        });
      });

      // product cards: batched stagger + 3D tilt on hover
      const cleanups: Array<() => void> = [];
      const cards = gsap.utils
        .toArray<HTMLElement>(CARD_SELECTOR)
        .filter((el) => !el.dataset.done);

      if (cards.length) {
        cards.forEach((el) => {
          el.dataset.done = '1';
        });

        gsap.set(cards, { opacity: 0, y: 70, scale: 0.94 });

        ScrollTrigger.batch(cards, {
          start: 'top 92%',
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 1.1,
              ease: 'expo.out',
              stagger: 0.09,
              overwrite: 'auto',
            }),
        });

        if (window.matchMedia('(pointer: fine)').matches) {
          cards.forEach((card) => {
            const rx = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3.out' });
            const ry = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3.out' });
            gsap.set(card, { transformPerspective: 900 });

            const move = (e: MouseEvent) => {
              const r = card.getBoundingClientRect();
              ry(((e.clientX - r.left) / r.width - 0.5) * 9);
              rx(((e.clientY - r.top) / r.height - 0.5) * -9);
            };
            const leave = () => {
              rx(0);
              ry(0);
            };

            card.addEventListener('mousemove', move);
            card.addEventListener('mouseleave', leave);
            cleanups.push(() => {
              card.removeEventListener('mousemove', move);
              card.removeEventListener('mouseleave', leave);
            });
          });
        }
      }

      // image parallax: only on images whose wrapper clips overflow
      gsap.utils
        .toArray<HTMLImageElement>('[data-cards] img, [data-parallax] img')
        .forEach((img) => {
          if (img.dataset.px) return;
          const wrap = img.parentElement;
          if (!wrap || getComputedStyle(wrap).overflow !== 'hidden') return;
          img.dataset.px = '1';

          gsap.fromTo(
            img,
            { scale: 1.22 },
            {
              scale: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: wrap,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            },
          );
        });

      // layout shifts after async data: keep trigger positions accurate
      const t = window.setTimeout(() => ScrollTrigger.refresh(), 400);
      return () => {
        window.clearTimeout(t);
        cleanups.forEach((fn) => fn());
      };
    },
    { scope: root, dependencies: [loading, error] },
  );

  return (
    <div
      ref={root}
      className="roboexpert-home relative min-h-screen space-y-10 overflow-x-hidden bg-[#faf9f6] pb-14 text-[#20221d] sm:space-y-14 sm:pb-20"
    >
      {intro && <Intro onDone={finishIntro} />}

      <Cursor />

      {/* scroll progress */}
      <div className="scroll-progress pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] origin-left scale-x-0 bg-gradient-to-r from-[#a8d530] to-[#c9f06b]" />

      {/* film grain */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[90] opacity-[0.035] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      <HeroCarousel startDelay={intro ? INTRO_HERO_DELAY : 0} />

      <TrustBar />

      <Marquee />

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
            <div data-reveal>
              <DealsCountdown />
            </div>

            <div data-reveal data-cards className="pt-5 sm:pt-7">
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

          <BigType />

          <section className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10">
            <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
              <SectionHeading eyebrow="Browse your way" title="Find your thing." />

              <span className="hidden text-xs text-[#85877e] sm:block">
                A little bit of everything
              </span>
            </div>

            <div data-reveal data-parallax>
              <CategorySection categories={categories} />
            </div>
          </section>

          <div className="space-y-3">
            <div className="mx-auto flex max-w-[1440px] items-end justify-between px-4 sm:px-6 lg:px-10">
              <SectionHeading
                eyebrow="Worth a closer look"
                title="The crowd favourites."
              />

              <Link
                to="/search"
                className="group mb-1 inline-flex items-center gap-2 text-xs font-semibold text-[#343a2d] sm:text-sm"
              >
                View everything
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
              </Link>
            </div>

            <div data-reveal data-cards>
              <ProductSection
                title="Best Sellers"
                products={bestSellers}
                loading={loading}
                seeAllHref="/search"
                seeAllText="View all products"
              />
            </div>
          </div>

          <div data-reveal data-parallax>
            <PromoBanners />
          </div>

          {!loading && companies.length > 0 && (
            <StatsBand products={products.length} sellers={companies.length} />
          )}

          <SellerCta sellers={companies.length} />
        </>
      )}

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

        .roboexpert-home ::selection {
          background: #c9f06b;
          color: #1d211a;
        }

        html.lenis, html.lenis body { height: auto; }
        .lenis.lenis-smooth { scroll-behavior: auto !important; }
        .lenis.lenis-stopped { overflow: hidden; }
      `}</style>
    </div>
  );
}