import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Package, Truck, Store } from 'lucide-react';
import { LoadingSpinner } from '../../components/ui';
import { productService } from '../../mocks/services';
import type { Product } from '../../types';
import { StarRating } from '../../components/ui/StarRating';

const PROMO_BANNERS = [
  {
    id: 1,
    title: 'Electronics sale — up to 40% off',
    subtitle: 'Headphones, keyboards & more from sellers across India',
    href: '/category/electronics',
    bg: 'bg-primary-700',
  },
  {
    id: 2,
    title: 'New home & living listings this week',
    subtitle: 'Fresh picks for your space',
    href: '/category/home-living',
    bg: 'bg-surface-800',
  },
  {
    id: 3,
    title: 'Free shipping on orders above ₹999',
    subtitle: 'Applies to eligible products',
    href: '/search',
    bg: 'bg-primary-800',
  },
];

function deliveryEstimate(productId: string): string {
  // Deterministic mock estimate from product id (no backend field)
  const days = (productId.charCodeAt(0) % 4) + 2;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

function ProductTile({ product }: { product: Product }) {
  return (
    <Link
      to={`/product/${product.id}`}
      className="bg-white border border-surface-200 hover:border-surface-300 hover:shadow-sm transition-all group flex flex-col h-full"
    >
      <div className="relative aspect-square bg-surface-100 overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <div className="p-3 flex flex-col flex-1 gap-1.5">
        <h3 className="text-sm font-medium text-surface-900 line-clamp-2 group-hover:text-primary-600 transition-colors leading-snug">
          {product.title}
        </h3>
        <div className="flex items-baseline gap-2">
          <p className="text-base font-bold text-surface-900">
            ₹{product.price.toLocaleString('en-IN')}
          </p>
          {product.compareAtPrice && (
            <p className="text-xs text-surface-400 line-through">
              ₹{product.compareAtPrice.toLocaleString('en-IN')}
            </p>
          )}
        </div>
        <p className="text-xs text-surface-500 truncate">
          Sold by {product.sellerName}
        </p>
        <div className="mt-auto pt-1 flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <StarRating rating={product.rating} maxRating={1} size="sm" showValue />
            {product.reviewCount > 0 && (
              <span className="text-xs text-surface-400">({product.reviewCount})</span>
            )}
          </div>
          <p className="text-xs text-success-700 flex items-center gap-1">
            <Truck className="w-3 h-3 shrink-0" />
            Get it by {deliveryEstimate(product.id)}
          </p>
        </div>
      </div>
    </Link>
  );
}

function ProductRow({
  title,
  products,
  viewAllHref,
}: {
  title: string;
  products: Product[];
  viewAllHref: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-surface-900">{title}</h2>
        <Link
          to={viewAllHref}
          className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-0.5"
        >
          See all <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {products.map(product => (
          <ProductTile key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export function Home() {
  const navigate = useNavigate();
  const [trending, setTrending] = useState<Product[]>([]);
  const [newListings, setNewListings] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoIndex, setPromoIndex] = useState(0);

  useEffect(() => {
    async function load() {
      const all = await productService.getAll();
      const byRating = [...all].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
      const byDate = [...all].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setTrending(byRating.slice(0, 10));
      setNewListings(byDate.slice(0, 10));
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setPromoIndex(i => (i + 1) % PROMO_BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  if (loading) return <LoadingSpinner className="min-h-[40vh]" />;

  const promo = PROMO_BANNERS[promoIndex];

  return (
    <div className="pb-8">
      {/* Thin promo strip — not a full hero */}
      <div className={`${promo.bg} text-white`}>
        <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3 flex items-center gap-3">
          <button
            type="button"
            aria-label="Previous offer"
            onClick={() => setPromoIndex(i => (i - 1 + PROMO_BANNERS.length) % PROMO_BANNERS.length)}
            className="p-1 rounded hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <Link
            to={promo.href}
            className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-baseline sm:gap-3 text-left"
          >
            <span className="text-sm sm:text-base font-semibold truncate">{promo.title}</span>
            <span className="text-xs sm:text-sm text-white/80 truncate">{promo.subtitle}</span>
          </Link>

          <button
            type="button"
            aria-label="Next offer"
            onClick={() => setPromoIndex(i => (i + 1) % PROMO_BANNERS.length)}
            className="p-1 rounded hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            {PROMO_BANNERS.map((b, i) => (
              <button
                key={b.id}
                type="button"
                aria-label={`Show offer ${i + 1}`}
                onClick={() => setPromoIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition-colors cursor-pointer ${
                  i === promoIndex ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Product grids — visible above the fold */}
      <div className="pt-4 space-y-8">
        <ProductRow
          title="Trending now"
          products={trending}
          viewAllHref="/search?sort=rating"
        />
        <ProductRow
          title="New listings"
          products={newListings}
          viewAllHref="/search?sort=newest"
        />
      </div>

      {/* Low-emphasis aggregate strip above footer */}
      <div className="max-w-7xl mx-auto px-4 mt-10 pt-6 border-t border-surface-200">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-surface-500">
          <span className="flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5" />
            45,000+ products listed
          </span>
          <span className="flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5" />
            Sellers across India
          </span>
          <span className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5" />
            Free shipping on orders above ₹999
          </span>
          <button
            type="button"
            onClick={() => navigate('/seller/signup')}
            className="text-primary-600 hover:text-primary-700 font-medium cursor-pointer ml-auto"
          >
            Sell on Roboexpert
          </button>
        </div>
      </div>
    </div>
  );
}
