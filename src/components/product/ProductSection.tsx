import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useRef } from 'react';
import type { Product } from '../../lib/api';
import { EmptyState } from '../ui';
import { ProductCard, ProductCardSkeleton } from './ProductCard';

type Props = {
  title: string;
  badge?: string;
  icon?: React.ReactNode;
  seeAllHref?: string;
  seeAllText?: string;
  products: Product[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  layout?: 'scroll' | 'grid';
};

export function ProductSection({
  title,
  badge,
  icon,
  seeAllHref = '/search',
  seeAllText = 'See All →',
  products,
  loading = false,
  emptyTitle = 'Nothing here yet',
  emptyDescription = 'Check back soon for new listings from sellers.',
  layout = 'scroll',
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -360 : 360;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5 flex-wrap">
          {icon && <div className="text-slate-900 shrink-0">{icon}</div>}
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            {title}
          </h2>
          {badge && (
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-600 border border-red-100">
              {badge}
            </span>
          )}
        </div>
        <Link
          to={seeAllHref}
          className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-amber-800 transition-colors inline-flex items-center gap-1"
        >
          {seeAllText}
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 shadow-sm">
          <EmptyState title={emptyTitle} description={emptyDescription} />
        </div>
      ) : layout === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="relative group/carousel">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="hidden md:flex absolute -left-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 border border-slate-200 shadow-md items-center justify-center text-slate-700 hover:bg-white hover:scale-105 active:scale-95 transition-all opacity-0 group-hover/carousel:opacity-100 cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 lg:grid lg:grid-cols-6 lg:overflow-visible lg:pb-0"
          >
            {products.slice(0, 6).map((product) => (
              <div
                key={product._id}
                className="w-[170px] sm:w-[190px] md:w-[210px] lg:w-auto shrink-0 snap-start"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scroll('right')}
            className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 border border-slate-200 shadow-md items-center justify-center text-slate-700 hover:bg-white hover:scale-105 active:scale-95 transition-all opacity-0 group-hover/carousel:opacity-100 cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  );
}
