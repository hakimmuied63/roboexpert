import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Filter } from 'lucide-react';
import { LoadingSpinner, EmptyState, Button } from '../../components/ui';
import { ProductCard } from '../../components/product/ProductCard';
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
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {sortedProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}