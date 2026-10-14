import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, X } from 'lucide-react';

const STORAGE_KEY = 'roboexpert_announcement_dismissed';

export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  if (dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore
    }
  };

  return (
    <aside aria-label="Marketplace announcement" className="relative z-50 bg-gradient-to-r from-[#14122B] via-[#1E1A47] to-[#14122B] text-white border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-2 sm:py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2 truncate">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/10 text-[#FF8A3D] shrink-0">
            <Sparkles className="w-3 h-3" aria-hidden />
          </span>
          <p className="font-medium text-white/90 truncate">
            Free shipping on orders above <span className="font-bold text-white">₹999</span> across India
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/seller/signup"
            className="font-semibold text-[#FF8A3D] hover:text-white transition-colors duration-200 underline-offset-4 hover:underline"
          >
            Sell on Roboexpert →
          </Link>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss announcement"
            className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors duration-200 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
