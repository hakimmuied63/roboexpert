import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Package, Truck, Store } from 'lucide-react';
import { LoadingSpinner } from '../../components/ui';
import { WishlistButton } from '../../components/wishlist/WishlistButton';
import {
  fetchAllProducts,
  fetchAllCompanies,
  type Product,
  type CompanySummary,
} from '../../lib/api';

const PROMO_BANNERS = [
  {
    id: 1,
    title: 'Electronics sale — up to 40% off',
    subtitle: 'Headphones, keyboards & more from sellers across India',
    href: '/search',
    bg: 'bg-primary-700',
  },
  {
    id: 2,
    title: 'New listings added this week',
    subtitle: 'Fresh picks from our sellers',
    href: '/search',
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

function ProductTile({ product }: { product: Product }) {
  return (
    <Link
      to={`/product/${product._id}`}
      className="bg-white border border-surface-200 hover:border-surface-300 hover:shadow-sm transition-all group flex flex-col h-full"
    >
      <div className="relative aspect-square bg-surface-100 overflow-hidden">
        <img
          src={product.images[0] ?? 'https://via.placeholder.com/400'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://via.placeholder.com/400?text=No+Image';
          }}
        />
        <div className="absolute top-2 right-2 z-10">
          <WishlistButton productId={product._id} size="sm" />
        </div>
      </div>
      <div className="p-3 flex flex-col flex-1 gap-1.5">
        <h3 className="text-sm font-medium text-surface-900 line-clamp-2 group-hover:text-primary-600 transition-colors leading-snug">
          {product.name}
        </h3>
        <p className="text-base font-bold text-surface-900">
          ₹{product.basePrice.toLocaleString('en-IN')}
        </p>
        {product.company && (
          <p className="text-xs text-surface-500 truncate">
            Sold by {product.company.name}
          </p>
        )}
      </div>
    </Link>
  );
}

export function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoIndex, setPromoIndex] = useState(0);

  useEffect(() => {
    async function load() {
      const [prods, comps] = await Promise.all([
        fetchAllProducts(),
        fetchAllCompanies(),
      ]);
      setProducts(prods);
      setCompanies(comps);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setPromoIndex((i) => (i + 1) % PROMO_BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  if (loading) return <LoadingSpinner className="min-h-[40vh]" />;

  const promo = PROMO_BANNERS[promoIndex];

  return (
    <div className="pb-8">
      {/* Promo strip */}
      <div className={`${promo.bg} text-white`}>
        <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3 flex items-center gap-3">
          <button
            type="button"
            aria-label="Previous offer"
            onClick={() =>
              setPromoIndex((i) => (i - 1 + PROMO_BANNERS.length) % PROMO_BANNERS.length)
            }
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
            onClick={() => setPromoIndex((i) => (i + 1) % PROMO_BANNERS.length)}
            className="p-1 rounded hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* All products */}
      <section className="max-w-7xl mx-auto px-4 pt-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-surface-900">All products</h2>
          <Link
            to="/search"
            className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-0.5"
          >
            See all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {products.length === 0 ? (
          <div className="text-center py-12 text-surface-500">
            No products available yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {products.map((product) => (
              <ProductTile key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Bottom strip */}
      <div className="max-w-7xl mx-auto px-4 mt-10 pt-6 border-t border-surface-200">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-surface-500">
          <span className="flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5" />
            {products.length} products listed
          </span>
          <span className="flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5" />
            {companies.length} sellers
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