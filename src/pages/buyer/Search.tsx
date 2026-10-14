import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { Button, LoadingSpinner, EmptyState } from '../../components/ui';
import { ProductCard } from '../../components/product/ProductCard';
import { searchProducts, fetchAllProducts, type Product } from '../../lib/api';

export function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (!query) {
        // No query — show all products (Browse All mode)
        const all = await fetchAllProducts();
        setProducts(all);
      } else {
        const results = await searchProducts(query);
        setProducts(results);
      }
      setLoading(false);
    }
    load();
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
      <h2 className="text-xl font-bold text-surface-900">
          {query ? `Search results for "${query}"` : 'All Products'}
        </h2>
        {query && <p className="text-sm text-surface-500">{products.length} items found</p>}
      </div>

      {loading ? (
        <LoadingSpinner className="min-h-[40vh]" />
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}