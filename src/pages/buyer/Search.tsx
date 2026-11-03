import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Filter, X } from 'lucide-react';
import { Button, LoadingSpinner, EmptyState } from '../../components/ui';
import { ProductCard } from '../../components/product/ProductCard';
import { searchProducts, fetchAllProducts, type Product } from '../../lib/api';

type PriceFilter = 'all' | 'under500' | '500to1000' | 'over1000';
type RatingFilter = 'all' | '4up' | '3up';

export function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filter State
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (!query) {
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

  const clearFilters = () => {
    setPriceFilter('all');
    setRatingFilter('all');
  };

  // Apply filters to the product list
  const filteredProducts = products.filter((p) => {
    // 1. Price Filter
    if (priceFilter === 'under500' && p.basePrice >= 500) return false;
    if (priceFilter === '500to1000' && (p.basePrice < 500 || p.basePrice > 1000)) return false;
    if (priceFilter === 'over1000' && p.basePrice <= 1000) return false;

    // 2. Rating Filter (using (p as any).ratingAverage because we added it to the Product model)
    const rating = (p as any).ratingAverage || 0;
    if (ratingFilter === '4up' && rating < 4) return false;
    if (ratingFilter === '3up' && rating < 3) return false;

    return true;
  });

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
          <Filter className="w-4 h-4" /> Filters
        </h3>
        {(priceFilter !== 'all' || ratingFilter !== 'all') && (
          <button onClick={clearFilters} className="text-xs text-blue-600 hover:underline font-medium">
            Clear all
          </button>
        )}
      </div>

      {/* Price */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Price</h4>
        <div className="space-y-2">
          {[
            { id: 'all', label: 'All Prices' },
            { id: 'under500', label: 'Under ₹500' },
            { id: '500to1000', label: '₹500 – ₹1,000' },
            { id: 'over1000', label: 'Over ₹1,000' },
          ].map((opt) => (
            <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="price"
                checked={priceFilter === opt.id}
                onChange={() => setPriceFilter(opt.id as PriceFilter)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Customer Rating</h4>
        <div className="space-y-2">
          {[
            { id: 'all', label: 'Any Rating' },
            { id: '4up', label: '4★ & above' },
            { id: '3up', label: '3★ & above' },
          ].map((opt) => (
            <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="rating"
                checked={ratingFilter === opt.id}
                onChange={() => setRatingFilter(opt.id as RatingFilter)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1500px] mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-surface-900">
          {query ? `Search results for "${query}"` : 'All Products'}
        </h2>
        <div className="flex items-center gap-4">
          <p className="text-sm text-surface-500 hidden sm:block">{filteredProducts.length} items found</p>
          
          {/* Mobile Filter Button */}
          <Button 
            variant="outline" 
            size="sm" 
            className="lg:hidden flex items-center gap-2"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <Filter className="w-4 h-4" /> Filters
          </Button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0 bg-white p-5 rounded-xl border border-gray-200 h-fit sticky top-24 shadow-sm">
          <FilterSidebar />
        </div>

        {/* Main Product Grid */}
        <div className="flex-1">
          {loading ? (
            <LoadingSpinner className="min-h-[40vh]" />
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              icon={<SearchIcon className="w-12 h-12 text-surface-400" />}
              title="No results found"
              description={query ? `We couldn't find anything matching "${query}" with these filters.` : "No products match these filters."}
              action={
                <Button variant="outline" onClick={() => { setSearchParams({}); clearFilters(); }}>
                  Clear All
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Overlay */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
          
          {/* Drawer */}
          <div className="relative ml-auto w-80 max-w-full bg-white h-full shadow-xl p-6 overflow-y-auto">
            <button 
              onClick={() => setMobileFiltersOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mt-4">
              <FilterSidebar />
            </div>
            <div className="mt-8 pt-4 border-t border-gray-200">
              <Button className="w-full" onClick={() => setMobileFiltersOpen(false)}>
                Show {filteredProducts.length} results
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}