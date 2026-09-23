import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  fetchCompanyProducts,
  fetchCompanyCategories,
  fetchProductsByCompanyCategory,
  type CatalogResponse,
  type Category,
  type Product,
} from '../../lib/api';

export const StorefrontPage = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const categorySlug = searchParams.get('category');
  const searchQuery = searchParams.get('q') ?? '';

  const [data, setData] = useState<CatalogResponse | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(searchQuery);

  // Sync search input when URL changes
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // Load company + products + categories
  useEffect(() => {
    const load = async () => {
      if (!companyId) {
        setError('No company specified');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const [catalogResult, categoriesResult] = await Promise.all([
        fetchCompanyProducts(companyId),
        fetchCompanyCategories(companyId),
      ]);

      if (!catalogResult || !catalogResult.ok) {
        setError('Store not found');
        setLoading(false);
        return;
      }

      setData(catalogResult);
      setCategories(categoriesResult);
      setLoading(false);
    };

    load();
  }, [companyId]);

  // Load filtered products when category changes
  useEffect(() => {
    const loadFiltered = async () => {
      if (!companyId || !categorySlug) {
        setFilteredProducts(null);
        return;
      }

      const result = await fetchProductsByCompanyCategory(companyId, categorySlug);
      if (result && result.ok) {
        setFilteredProducts(result.products);
      } else {
        setFilteredProducts([]);
      }
    };

    loadFiltered();
  }, [companyId, categorySlug]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      params.set('q', searchInput.trim());
    } else {
      params.delete('q');
    }
    setSearchParams(params);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading store...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Store not found</h1>
          <p className="text-gray-600 mb-6">
            The store you're looking for doesn't exist or is no longer active.
          </p>
          <Link
            to="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Determine which products to show
  let productsToShow = data.products;
  if (filteredProducts !== null) {
    productsToShow = filteredProducts;
  }
  if (searchQuery) {
    productsToShow = productsToShow.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Store header */}
      <div className="mb-6 border-b pb-6">
        <p className="text-sm text-gray-500 mb-2">Store</p>
        <h1 className="text-4xl font-bold text-gray-900">{data.company.name}</h1>
        <p className="text-gray-600 mt-2">
          {productsToShow.length} {productsToShow.length === 1 ? 'product' : 'products'}
          {categorySlug && ` in ${categorySlug.replace(/-/g, ' ')}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearchSubmit} className="mb-6">
        <div className="flex gap-2 max-w-xl">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search in this store..."
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold"
          >
            Search
          </button>
        </div>
      </form>

      {/* Category chips */}
      {categories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            to={`/shop/${companyId}`}
            className={`px-4 py-2 text-sm rounded-full transition-colors ${
              !categorySlug
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/shop/${companyId}?category=${cat.slug}`}
              className={`px-4 py-2 text-sm rounded-full transition-colors ${
                categorySlug === cat.slug
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {/* Empty state */}
      {productsToShow.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">
            {categorySlug
              ? 'No products in this category yet.'
              : searchQuery
              ? `No products matching "${searchQuery}".`
              : 'No products available yet.'}
          </p>
          {(categorySlug || searchQuery) && (
            <Link
              to={`/shop/${companyId}`}
              className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filters
            </Link>
          )}
        </div>
      )}

      {/* Product grid */}
      {productsToShow.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productsToShow.map((product) => (
            <Link
              key={product._id}
              to={`/product/${product._id}`}
              className="group bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-square bg-gray-100 overflow-hidden">
                <img
                  src={product.images[0] ?? 'https://via.placeholder.com/400'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://via.placeholder.com/400?text=No+Image';
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 truncate">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                )}
                <p className="text-lg font-bold text-gray-900">
                  ₹{product.basePrice.toLocaleString('en-IN')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};