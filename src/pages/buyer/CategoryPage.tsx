import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { productService, categoryService } from '../../mocks/services';
import type { Product, Category } from '../../types';
import { Button, LoadingSpinner, EmptyState } from '../../components/ui';
import { StarRating } from '../../components/ui/StarRating';

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'rating'>('newest');

  useEffect(() => {
    async function load() {
      if (!slug) return;
      setLoading(true);
      const cat = await categoryService.getBySlug(slug);
      if (cat) {
        setCategory(cat);
        const prods = await productService.getAll({ category: cat.name, sortBy });
        setProducts(prods);
      }
      setLoading(false);
    }
    load();
  }, [slug, sortBy]);

  if (loading) return <LoadingSpinner className="min-h-[50vh]" />;

  if (!category) {
    return (
      <EmptyState
        title="Category Not Found"
        description="The category you're looking for doesn't exist."
        action={<Button onClick={() => window.history.back()}>Go Back</Button>}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Category Header */}
      <div className="bg-white rounded-2xl border border-surface-200 p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
            style={{ backgroundColor: category.color }}
          >
            {/* generic icon */}
            <Filter className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-surface-900">{category.name}</h1>
            <p className="text-surface-500 mt-1">{category.description}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters (Mock) */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-6 hidden lg:block">
          <div>
            <h3 className="font-semibold text-surface-900 mb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-surface-700 mb-2">Price Range</h4>
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="Min" className="w-full px-3 py-1.5 text-sm border border-surface-200 rounded-lg" />
                  <span>-</span>
                  <input type="number" placeholder="Max" className="w-full px-3 py-1.5 text-sm border border-surface-200 rounded-lg" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-surface-700 mb-2">Minimum Rating</h4>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map(r => (
                    <label key={r} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="rating" className="text-primary-600 focus:ring-primary-500" />
                      <StarRating rating={r} size="sm" />
                      <span className="text-sm text-surface-600">& Up</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-6">Apply Filters</Button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-sm text-surface-600">
              Showing <span className="font-medium text-surface-900">{products.length}</span> products
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-surface-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="text-sm border border-surface-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary-500"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {products.length === 0 ? (
            <EmptyState
              title="No products found"
              description="Check back later for new listings in this category."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map(product => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="bg-white rounded-xl border border-surface-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all group flex flex-col h-full"
                >
                  <div className="relative aspect-[4/3] bg-surface-100 overflow-hidden">
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-surface-500 uppercase">
                        {product.sellerName}
                      </span>
                      <StarRating rating={product.rating} maxRating={1} size="sm" showValue />
                    </div>
                    <h4 className="text-sm font-bold text-surface-900 line-clamp-2 mb-3 flex-1 group-hover:text-primary-600 transition-colors">
                      {product.title}
                    </h4>
                    <div>
                      <p className="text-lg font-bold text-surface-900">
                        ₹{product.price.toLocaleString('en-IN')}
                      </p>
                      {product.compareAtPrice && (
                        <p className="text-xs text-surface-400 line-through">
                          ₹{product.compareAtPrice.toLocaleString('en-IN')}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
