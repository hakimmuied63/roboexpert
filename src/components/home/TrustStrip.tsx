import { ShieldCheck, RotateCcw, BadgeCheck, Headphones } from 'lucide-react';

const ITEMS = [
  {
    icon: ShieldCheck,
    title: 'Secure Payments',
    subtitle: 'Multiple payment options',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    subtitle: 'Hassle-free process',
  },
  {
    icon: BadgeCheck,
    title: 'Verified Sellers',
    subtitle: 'Trusted and genuine',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    subtitle: "We're here to help",
  },
];

export function TrustStrip() {
  return (
    <section className="max-w-7xl mx-auto px-4" aria-label="Customer assurances">
      <div className="rounded-xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:divide-x md:divide-slate-200">
          {ITEMS.map((item, index) => {
            const Icon = item.icon;
            return (
              <li
                key={item.title}
                className={`flex items-center gap-3 ${index > 0 ? 'md:pl-6' : ''}`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate">
                    {item.title}
                  </p>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">
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
