import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchCompanyProducts, type CatalogResponse } from '../../lib/api';

export const StorefrontPage = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const [data, setData] = useState<CatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!companyId) {
        setError('No company specified');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const result = await fetchCompanyProducts(companyId);

      if (!result || !result.ok) {
        setError('Store not found');
        setLoading(false);
        return;
      }

      setData(result);
      setLoading(false);
    };

    load();
  }, [companyId]);

  // Loading state
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

  // Error state
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

  // Success state
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Store header */}
      <div className="mb-8 border-b pb-6">
        <p className="text-sm text-gray-500 mb-2">Store</p>
        <h1 className="text-4xl font-bold text-gray-900">{data.company.name}</h1>
        <p className="text-gray-600 mt-2">
          {data.products.length} {data.products.length === 1 ? 'product' : 'products'}
        </p>
      </div>

      {/* Empty state */}
      {data.products.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No products available yet.</p>
        </div>
      )}

      {/* Product grid */}
      {data.products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {data.products.map((product) => (
            <div
              key={product._id}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};