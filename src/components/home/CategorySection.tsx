import { Link } from 'react-router-dom';
import { useRef } from 'react';
import {
  Shirt,
  Smartphone,
  Home,
  Sparkles,
  Dumbbell,
  BookOpen,
  Gamepad2,
  Heart,
  Car,
  ChevronRight,
  ChevronLeft,
  Package,
} from 'lucide-react';
import type { Category } from '../../lib/api';
import { isVisibleMarketplaceCategory } from '../../lib/marketplaceUi';

type Props = {
  categories?: Category[];
};

// Map real categories to appropriate clean Lucide icons
function getCategoryIcon(name: string) {
  const lower = name.toLowerCase();
  if (/cloth|shirt|pant|fashion|wear|apparel|boot|sandal|sneaker/i.test(lower)) return Shirt;
  if (/tech|electron|phone|gadget|tv|television/i.test(lower)) return Smartphone;
  if (/home|kitchen|decor|living/i.test(lower)) return Home;
  if (/beauty|care|cosmetic/i.test(lower)) return Sparkles;
  if (/sport|fitness|running|gym/i.test(lower)) return Dumbbell;
  if (/book|read|study/i.test(lower)) return BookOpen;
  if (/toy|game/i.test(lower)) return Gamepad2;
  if (/health|wellness|pharma/i.test(lower)) return Heart;
  if (/auto|car|vehicle/i.test(lower)) return Car;
  return Package;
}

export function CategorySection({ categories = [] }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filter visible categories
  const validCategories = categories.filter(isVisibleMarketplaceCategory);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  if (validCategories.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4" aria-labelledby="shop-by-category-title">
      <div className="flex items-center justify-between mb-5">
        <h2
          id="shop-by-category-title"
          className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight"
        >
          Shop by Category
        </h2>
      </div>

      <div className="relative group/categories">
        <button
          type="button"
          onClick={() => scroll('left')}
          className="hidden md:flex absolute -left-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center text-slate-700 hover:bg-slate-50 active:scale-95 transition-all opacity-0 group-hover/categories:opacity-100 cursor-pointer"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div
          ref={scrollRef}
          className="flex items-center gap-6 sm:gap-8 overflow-x-auto scrollbar-hide py-2 px-1 snap-x"
        >
          {validCategories.map((cat) => {
            const Icon = getCategoryIcon(cat.name);
            return (
              <Link
                key={cat._id}
                to={`/category/${cat.slug}`}
                className="flex flex-col items-center gap-2.5 shrink-0 group snap-start"
              >
                {/* Circular Icon Container */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex items-center justify-center text-slate-700 group-hover:border-slate-400 group-hover:text-amber-800 group-hover:shadow-md transition-all duration-200 group-hover:scale-105">
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.5]" />
                </div>
                {/* Category Name Label */}
                <span className="text-xs sm:text-sm font-medium text-slate-700 group-hover:text-amber-800 text-center capitalize max-w-[85px] truncate">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => scroll('right')}
          className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center text-slate-700 hover:bg-slate-50 active:scale-95 transition-all opacity-0 group-hover/categories:opacity-100 cursor-pointer"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
