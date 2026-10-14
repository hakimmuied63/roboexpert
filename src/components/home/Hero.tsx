import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Sparkles } from 'lucide-react';
import type { Product } from '../../lib/api';

type Props = {
  products?: Product[];
};

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80',
];

export function Hero({ products = [] }: Props) {
  // Extract real product images with usable images
  const productImages = products
    .filter((p) => p.images && p.images.length > 0)
    .map((p) => ({
      src: p.images[0],
      name: p.name,
      price: p.basePrice,
    }));

  const img1 = productImages[0] || {
    src: FALLBACK_IMAGES[0],
    name: 'Smart Device',
    price: 2499,
  };
  const img2 = productImages[1] || {
    src: FALLBACK_IMAGES[1],
    name: 'Wireless Audio',
    price: 1899,
  };
  const img3 = productImages[2] || {
    src: FALLBACK_IMAGES[2],
    name: 'Sneakers & Sport',
    price: 3299,
  };

  return (
    <section className="max-w-7xl mx-auto px-4 pt-4 sm:pt-6" aria-label="Hero showcase">
      <div className="relative overflow-hidden rounded-[32px] sm:rounded-[36px] bg-gradient-to-br from-[#14122B] via-[#1B1745] to-[#120F2B] text-white border border-white/10 shadow-[0_25px_60px_-15px_rgba(20,18,43,0.5)]">
        {/* Glowing aura lights */}
        <div
          className="absolute top-1/4 -right-16 w-80 sm:w-[460px] h-80 sm:h-[460px] rounded-full bg-gradient-to-br from-[#FF6A2B]/25 to-[#FF8A3D]/10 blur-[110px] pointer-events-none"
          aria-hidden
        />
        <div
          className="absolute -bottom-20 left-1/4 w-[380px] sm:w-[520px] h-[380px] sm:h-[520px] rounded-full bg-gradient-to-tr from-[#4F46FF]/35 to-[#7A5CFF]/20 blur-[120px] pointer-events-none"
          aria-hidden
        />

        <div className="relative z-10 grid lg:grid-cols-12 gap-10 lg:gap-8 items-center px-6 sm:px-10 lg:px-14 py-12 sm:py-16 lg:py-20">
          {/* Left Column: Headlines & CTA buttons */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Pill chip */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold uppercase tracking-wider text-white/90 backdrop-blur-md mb-6">
              <Sparkles className="w-3.5 h-3.5 text-[#FF8A3D]" aria-hidden />
              <span>India’s Open Marketplace</span>
            </div>

            {/* 72px headline */}
            <h1 className="font-display text-4xl sm:text-6xl lg:text-[72px] font-extrabold leading-[1.04] tracking-tight text-white mb-6">
              Shop what you love.
              <br />
              <span className="bg-gradient-to-r from-[#FF6A2B] via-[#FF8A3D] to-[#FFA768] bg-clip-text text-transparent">
                Sell what you make.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-white/80 max-w-xl mb-8 leading-relaxed font-normal">
              Discover unique finds from independent creators and verified sellers across India. Buy directly with trust, or launch your own storefront in minutes with zero lock-in.
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
              <Link
                to="/search"
                className="inline-flex items-center justify-center px-7 sm:px-8 py-3.5 sm:py-4 rounded-full bg-white text-[#14122B] hover:text-[#14122B] font-bold text-sm sm:text-base shadow-[0_8px_20px_rgba(255,255,255,0.2)] hover:bg-surface-50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                Start shopping
              </Link>
              <Link
                to="/seller/signup"
                className="inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-[#FF6A2B] to-[#FF8A3D] text-white font-bold text-sm sm:text-base shadow-[0_10px_26px_rgba(255,106,43,0.35)] hover:shadow-[0_14px_32px_rgba(255,106,43,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                Start selling
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mini trust perks below */}
            <div className="flex flex-wrap items-center gap-5 sm:gap-7 mt-8 sm:mt-10 pt-6 border-t border-white/10 text-xs sm:text-sm text-white/70">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Zero setup fees
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7A5CFF]" />
                Direct payments
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF8A3D]" />
                Free shipping on ₹999+
              </span>
            </div>
          </div>

          {/* Right Column: Floating Collage of real products */}
          <div className="lg:col-span-5 relative flex items-center justify-center pt-4 lg:pt-0">
            <div className="relative w-full max-w-[380px] sm:max-w-[420px] h-[340px] sm:h-[400px]">
              {/* Product Card 1 - Main Center Card with float animation */}
              <div
                className="absolute left-2 sm:left-4 top-6 w-48 sm:w-56 aspect-[4/5] rounded-[24px] sm:rounded-[28px] overflow-hidden border-[4px] border-white shadow-[0_22px_45px_rgba(0,0,0,0.5)] animate-float-1 z-10 bg-surface-900 group"
              >
                <img
                  src={img1.src}
                  alt={img1.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
                  <p className="text-xs font-semibold truncate leading-tight">{img1.name}</p>
                  <p className="text-xs font-extrabold text-[#7A5CFF]">₹{img1.price.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Product Card 2 - Top Right Offset Card */}
              <div
                className="absolute right-0 top-0 w-44 sm:w-50 aspect-[4/5] rounded-[24px] sm:rounded-[28px] overflow-hidden border-[4px] border-white shadow-[0_20px_45px_rgba(0,0,0,0.45)] animate-float-2 z-0 bg-surface-900 group"
              >
                <img
                  src={img2.src}
                  alt={img2.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
                  <p className="text-xs font-semibold truncate leading-tight">{img2.name}</p>
                  <p className="text-xs font-extrabold text-[#FF8A3D]">₹{img2.price.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Product Card 3 - Bottom Right Accent Card */}
              <div
                className="absolute right-4 bottom-2 w-36 sm:w-42 aspect-square rounded-[20px] sm:rounded-[24px] overflow-hidden border-[4px] border-white shadow-[0_16px_36px_rgba(0,0,0,0.4)] animate-float-3 z-10 bg-surface-900 group hidden sm:block"
              >
                <img
                  src={img3.src}
                  alt={img3.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Floating chip: Verified sellers */}
              <div
                className="absolute -bottom-3 left-0 sm:left-6 z-20 inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/95 backdrop-blur-md border border-white shadow-[0_12px_30px_rgba(0,0,0,0.28)] text-[#14122B] animate-float-3"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <BadgeCheck className="w-5 h-5 fill-emerald-600 text-white" aria-hidden />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold font-display leading-tight text-[#14122B]">
                    Verified sellers
                  </span>
                  <span className="text-[10px] text-surface-500 font-medium">
                    100% authentic makers
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
