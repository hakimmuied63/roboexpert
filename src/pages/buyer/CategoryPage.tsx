import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Filter } from 'lucide-react';
import { LoadingSpinner, EmptyState, Button } from '../../components/ui';
import { WishlistButton } from '../../components/wishlist/WishlistButton';
import { fetchProductsByCategory, type Product } from '../../lib/api';

type SortOption = 'newest' | 'price-asc' | 'price-desc';

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<{ _id: string; name: string; slug: string } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  useEffect(() => {
    async function load() {
      if (!slug) return;
      setLoading(true);
      const data = await fetchProductsByCategory(slug);
      if (data && data.ok) {
        setCategory(data.category);
        setProducts(data.products);
      } else {
        setCategory(null);
        setProducts([]);
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  const sortedProducts = useMemo(() => {
    const copy = [...products];
    if (sortBy === 'price-asc') copy.sort((a, b) => a.basePrice - b.basePrice);
    if (sortBy === 'price-desc') copy.sort((a, b) => b.basePrice - a.basePrice);
    if (sortBy === 'newest') {
      copy.sort((a, b) => new Date(b['createdAt'] as any).getTime() - new Date(a['createdAt'] as any).getTime());
    }
    return copy;
  }, [products, sortBy]);

  if (loading) return <LoadingSpinner className="min-h-[50vh]" />;

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          title="Category Not Found"
          description="The category you're looking for doesn't exist."
          action={<Button onClick={() => window.history.back()}>Go Back</Button>}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-surface-200 p-8 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white bg-primary-600">
            <Filter className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-surface-900">{category.name}</h1>
            <p className="text-surface-500 mt-1">
              {products.length} {products.length === 1 ? 'product' : 'products'}
            </p>
          </div>
        </div>
      </div>

      {/* Sort bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-sm text-surface-600">
          Showing <span className="font-medium text-surface-900">{sortedProducts.length}</span> products
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-surface-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="text-sm border border-surface-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary-500"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {sortedProducts.length === 0 ? (
        <EmptyState
          title="No products yet"
          description={`There are no products listed in ${category.name} right now.`}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedProducts.map((product) => (
            <Link
              key={product._id}
              to={`/product/${product._id}`}
              className="bg-white rounded-xl border border-surface-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all group flex flex-col h-full"
            >
              <div className="relative aspect-[4/3] bg-surface-100 overflow-hidden">
                <img
                  src={product.images[0] ?? 'https://via.placeholder.com/400'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://via.placeholder.com/400?text=No+Image';
                  }}
                />
                <div className="absolute top-2 right-2 z-10">
                  <WishlistButton productId={product._id} size="sm" />
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                {product.company && (
                  <span className="text-xs font-medium text-surface-500 uppercase mb-2">
                    {product.company.name}
                  </span>
                )}
                <h4 className="text-sm font-bold text-surface-900 line-clamp-2 mb-3 flex-1 group-hover:text-primary-600 transition-colors">
                  {product.name}
                </h4>
                <p className="text-lg font-bold text-surface-900">
                  ₹{product.basePrice.toLocaleString('en-IN')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}