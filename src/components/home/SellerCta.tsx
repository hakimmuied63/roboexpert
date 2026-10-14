import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    title: 'Create your shop',
    description:
      'Register in under 2 minutes. Get your branded digital storefront with zero upfront costs or subscription fees.',
  },
  {
    number: '02',
    title: 'List your products',
    description:
      'Upload photos, set your pricing, and manage variants with our swift catalogue and bulk-upload tools.',
  },
  {
    number: '03',
    title: 'Direct bank payouts',
    description:
      'Ship orders to buyers across India and receive instant verified payments deposited straight to your account.',
  },
];

export function SellerCta() {
  return (
    <section className="max-w-7xl mx-auto px-4" aria-label="Become a seller">
      {/* Dark container with orange and indigo glows */}
      <div className="relative overflow-hidden rounded-[32px] sm:rounded-[36px] bg-[#14122B] text-white p-8 sm:p-12 lg:p-16 border border-white/10 shadow-[0_25px_60px_-15px_rgba(20,18,43,0.5)]">
        {/* Glow lights */}
        <div
          className="absolute -top-24 -right-24 w-96 sm:w-[480px] h-96 sm:h-[480px] rounded-full bg-gradient-to-br from-[#FF6A2B]/25 to-[#FF8A3D]/10 blur-[100px] pointer-events-none"
          aria-hidden
        />
        <div
          className="absolute -bottom-24 -left-24 w-96 sm:w-[480px] h-96 sm:h-[480px] rounded-full bg-gradient-to-tr from-[#4F46FF]/30 to-[#7A5CFF]/15 blur-[100px] pointer-events-none"
          aria-hidden
        />

        {/* Top Banner Content */}
        <div className="relative z-10 max-w-3xl">
          {/* "ANYONE CAN SELL" pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#FF6A2B]/15 to-[#FF8A3D]/15 border border-[#FF6A2B]/35 text-[#FF8A3D] text-xs font-bold tracking-widest uppercase mb-5">
            <Sparkles className="w-3.5 h-3.5" aria-hidden />
            ANYONE CAN SELL
          </div>

          {/* 54px headline */}
          <h2 className="font-display text-3xl sm:text-4xl lg:text-[54px] font-extrabold leading-[1.08] tracking-tight text-white mb-5">
            Turn your craft into a thriving business.
          </h2>

          <p className="text-sm sm:text-base text-white/80 max-w-2xl mb-8 leading-relaxed font-normal">
            Reach thousands of active buyers across India. List products in minutes, receive direct customer payments, and scale your brand with zero marketplace lock-in.
          </p>

          <Link
            to="/seller/signup"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-[#FF6A2B] to-[#FF8A3D] text-white font-bold text-sm sm:text-base shadow-[0_10px_26px_rgba(255,106,43,0.35)] hover:shadow-[0_14px_32px_rgba(255,106,43,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            Start selling for free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 3 Numbered Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-14 relative z-10">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="rounded-[24px] sm:rounded-[28px] bg-white/[0.06] backdrop-blur-md border border-white/10 p-6 sm:p-7 hover:bg-white/[0.09] hover:-translate-y-1 transition-all duration-300 group"
            >
              {/* Step number badge */}
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#4F46FF] to-[#7A5CFF] text-white font-display font-extrabold text-sm flex items-center justify-center shadow-md mb-4 group-hover:scale-105 transition-transform">
                {step.number}
              </div>

              <h3 className="font-display font-bold text-lg sm:text-xl text-white mb-2 group-hover:text-[#FF8A3D] transition-colors leading-snug">
                {step.title}
              </h3>

              <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-normal">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
