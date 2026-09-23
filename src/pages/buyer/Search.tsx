import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { Button, LoadingSpinner, EmptyState } from '../../components/ui';
import { searchProducts, type Product } from '../../lib/api';

export function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [localQuery, setLocalQuery] = useState(query);

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  useEffect(() => {
    async function load() {
      if (!query) {
        setProducts([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const results = await searchProducts(query);
      setProducts(results);
      setLoading(false);
    }
    load();
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      setSearchParams({ q: localQuery.trim() });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Search Header */}
      <div className="bg-white rounded-2xl border border-surface-200 p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-surface-400 group-focus-within:text-primary-600 transition-colors" />
          </div>
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            className="block w-full pl-12 pr-32 py-4 text-base bg-surface-50 border-2 border-surface-200 rounded-xl
              focus:bg-white focus:ring-0 focus:border-primary-500 transition-all"
            placeholder="Search products, brands, or categories..."
          />
          <div className="absolute inset-y-2 right-2">
            <Button type="submit" className="h-full px-6">
              Search
            </Button>
          </div>
        </form>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-surface-900">
          {query ? `Search results for "${query}"` : 'Start typing to search'}
        </h2>
        {query && <p className="text-sm text-surface-500">{products.length} items found</p>}
      </div>

      {loading ? (
        <LoadingSpinner className="min-h-[40vh]" />
      ) : !query ? (
        <EmptyState
          icon={<SearchIcon className="w-12 h-12 text-surface-400" />}
          title="Search for products"
          description="Type a product name, brand, or keyword above."
        />
      ) : products.length === 0 ? (
        <EmptyState
          icon={<SearchIcon className="w-12 h-12 text-surface-400" />}
          title="No results found"
          description={`We couldn't find anything matching "${query}". Try different keywords.`}
          action={
            <Button variant="outline" onClick={() => setSearchParams({})}>
              Clear Search
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
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