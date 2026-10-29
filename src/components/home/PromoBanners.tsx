import { Link } from 'react-router-dom';
import { ArrowRight, Laptop, Home as HomeIcon } from 'lucide-react';

export function PromoBanners() {
  return (
    <section className="max-w-7xl mx-auto px-4" aria-label="Promotional highlights">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Left Tech Promo Banner */}
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-[#0c1427] via-[#101b33] to-[#0a101f] text-white border border-slate-800 p-6 sm:p-8 flex flex-col justify-between min-h-[220px] shadow-sm group">
          {/* Subtle neon glow effect */}
          <div
            className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"
            aria-hidden
          />

          <div className="relative z-10 max-w-sm">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1.5 leading-snug">
              Latest Tech.
              <br />
              Smarter Living.
            </h3>
            <p className="text-xs sm:text-sm text-cyan-300 font-semibold mb-5">
              Up to 50% Off
            </p>
            <Link
              to="/category/television"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#ffd814] hover:bg-[#f7ca00] text-slate-900 text-xs sm:text-sm font-semibold shadow-sm transition-all duration-150 active:scale-95"
            >
              <span>Shop Electronics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="absolute right-4 bottom-4 opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none">
            <Laptop className="w-24 h-24 sm:w-28 sm:h-28 text-cyan-400 stroke-1" />
          </div>
        </div>

        {/* Right Home Promo Banner */}
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-[#e8decb] via-[#efe8da] to-[#dfd5c0] text-slate-900 border border-amber-200/60 p-6 sm:p-8 flex flex-col justify-between min-h-[220px] shadow-sm group">
          {/* Subtle warm glow effect */}
          <div
            className="absolute top-0 right-0 w-64 h-64 bg-amber-400/15 rounded-full blur-3xl pointer-events-none"
            aria-hidden
          />

          <div className="relative z-10 max-w-sm">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mb-1.5 leading-snug">
              Upgrade Your Home
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-normal mb-5">
              Everything you need, under one roof.
            </p>
            <Link
              to="/search?q=home"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#ffd814] hover:bg-[#f7ca00] text-slate-900 text-xs sm:text-sm font-semibold shadow-sm transition-all duration-150 active:scale-95"
            >
              <span>Shop Home & Kitchen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="absolute right-4 bottom-4 opacity-25 group-hover:opacity-35 transition-opacity pointer-events-none">
            <HomeIcon className="w-24 h-24 sm:w-28 sm:h-28 text-amber-800 stroke-1" />
          </div>
        </div>
      </div>
    </section>
  );
}
