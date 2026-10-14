import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { Product } from '../../lib/api';
import { EmptyState } from '../ui';
import { ProductCard, ProductCardSkeleton } from './ProductCard';

type Props = {
  title: string;
  seeAllHref?: string;
  products: Product[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  layout?: 'scroll' | 'grid';
};

export function ProductSection({
  title,
  seeAllHref = '/search',
  products,
  loading = false,
  emptyTitle = 'Nothing here yet',
  emptyDescription = 'Check back soon for new listings from sellers.',
  layout = 'scroll',
}: Props) {
  return (
    <section className="max-w-7xl mx-auto px-4">
      {/* Section Header with Outlined Pill "See all" */}
      <div className="flex items-end justify-between gap-3 mb-5">
        <h2 className="text-xl sm:text-2xl font-extrabold font-display text-[#14122B] tracking-tight">
          {title}
        </h2>
        <Link
          to={seeAllHref}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#E6E6F0] bg-white text-xs sm:text-sm font-semibold text-[#14122B] hover:border-[#4F46FF] hover:text-[#4F46FF] hover:bg-[#EEF0FF] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-sm"
        >
          See all
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div
          className={
            layout === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4 md:gap-5'
              : 'flex gap-3.5 sm:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 md:grid md:grid-cols-4 lg:grid-cols-5 md:overflow-visible md:pb-0'
          }
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={layout === 'grid' ? '' : 'w-[44%] sm:w-[32%] md:w-auto shrink-0 snap-start'}
            >
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-[#E6E6F0] bg-white p-6 shadow-sm">
          <EmptyState title={emptyTitle} description={emptyDescription} />
        </div>
      ) : layout === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4 md:gap-5">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex gap-3.5 sm:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 md:grid md:grid-cols-4 lg:grid-cols-5 md:gap-4 lg:gap-5 md:overflow-visible md:pb-0">
          {products.map((product) => (
            <div key={product._id} className="w-[44%] sm:w-[32%] md:w-auto shrink-0 snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
