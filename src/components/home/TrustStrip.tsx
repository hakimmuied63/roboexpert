import { Truck, ShieldCheck, RotateCcw, BadgeCheck } from 'lucide-react';

const ITEMS = [
  {
    icon: Truck,
    title: 'Free shipping above ₹999',
    subtitle: 'On eligible products across India',
  },
  {
    icon: ShieldCheck,
    title: 'Secure direct payments',
    subtitle: 'UPI, cards & net banking verified',
  },
  {
    icon: RotateCcw,
    title: 'Easy 7-day returns',
    subtitle: 'Hassle-free support & tracking',
  },
  {
    icon: BadgeCheck,
    title: '100% verified sellers',
    subtitle: 'Curated & authentic catalogue',
  },
];

export function TrustStrip() {
  return (
    <section className="max-w-7xl mx-auto px-4" aria-label="Why shop with us">
      {/* One single white rounded bar */}
      <div className="rounded-[28px] sm:rounded-[32px] bg-white border border-[#E6E6F0] p-4 sm:p-6 lg:p-7 shadow-[0_10px_30px_rgba(79,70,255,0.06)]">
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8 lg:divide-x lg:divide-[#E6E6F0]/80">
          {ITEMS.map((item, index) => {
            const Icon = item.icon;
            return (
              <li
                key={item.title}
                className={`flex items-center gap-3.5 sm:gap-4 group ${
                  index > 0 ? 'lg:pl-6' : ''
                }`}
              >
                {/* Icon tile */}
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4F46FF]/10 to-[#7A5CFF]/10 text-[#4F46FF] border border-[#4F46FF]/15 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 group-hover:bg-[#4F46FF] group-hover:text-white transition-all duration-300">
                  <Icon className="w-5 h-5 transition-colors" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-sm sm:text-base font-bold text-[#14122B] font-display leading-tight truncate">
                    {item.title}
                  </p>
                  <p className="text-xs text-surface-500 mt-1 truncate">
                    {item.subtitle}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
