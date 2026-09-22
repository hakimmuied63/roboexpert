import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, MapPin, Calendar, Star, Package } from 'lucide-react';
import { sellerService, productService } from '../../mocks/services';
import type { Seller, Product } from '../../types';
import { Button, LoadingSpinner, EmptyState, Badge } from '../../components/ui';
import { StarRating } from '../../components/ui/StarRating';

export function SellerProfile() {
  const { id } = useParams<{ id: string }>();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      const [s, p] = await Promise.all([
        sellerService.getById(id),
        productService.getAll({ sellerId: id }),
      ]);
      setSeller(s || null);
      setProducts(p);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <LoadingSpinner className="min-h-[50vh]" />;

  if (!seller) {
    return (
      <EmptyState
        title="Seller Not Found"
        description="The seller profile you are looking for doesn't exist."
        action={<Button onClick={() => window.location.href = '/'}>Go back home</Button>}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Cover & Profile Header */}
      <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-sm">
        <div className="h-48 bg-gradient-to-r from-primary-600 to-primary-400 relative">
          <div className="absolute inset-0 bg-black/10" />
        </div>
        
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-16 sm:-mt-20 relative z-10 mb-6">
            <div className="flex items-end gap-6">
              <div className="w-32 h-32 rounded-2xl border-4 border-white shadow-md bg-white overflow-hidden flex-shrink-0">
                <img src={seller.avatar} alt={seller.name} className="w-full h-full object-cover" />
              </div>
              <div className="mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-bold text-surface-900">{seller.businessName}</h1>
                  {seller.verified && (
                    <Badge variant="success" dot className="bg-success-50 text-success-700">Verified</Badge>
                  )}
                </div>
                <p className="text-surface-500 font-medium">Owned by {seller.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <Button variant="outline" icon={<Star className="w-4 h-4" />}>Save Seller</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-surface-900 mb-2">About this seller</h3>
                <p className="text-surface-600 leading-relaxed">
                  {seller.description || 'This seller has not provided a description yet.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-6 text-sm text-surface-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-surface-400" />
                  Joined {new Date(seller.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-surface-400" />
                  India
                </div>
              </div>
            </div>
            
            <div className="bg-surface-50 rounded-xl p-6 border border-surface-200">
              <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wider mb-4">
                Seller Performance
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-surface-600">Overall Rating</span>
                  <div className="flex items-center gap-1 font-bold text-surface-900">
                    {seller.rating.toFixed(1)} <Star className="w-4 h-4 text-warning-500 fill-warning-500" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-surface-600">Products Listed</span>
                  <span className="font-bold text-surface-900">{products.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-surface-600">Total Sales</span>
                  <span className="font-bold text-surface-900">{seller.totalSales}</span>
                </div>
              </div>
              
              {seller.verified && (
                <div className="mt-6 pt-4 border-t border-surface-200">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-success-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-surface-900">Roboexpert Verified Maker</p>
                      <p className="text-xs text-surface-500 mt-0.5">This seller meets our highest standards for quality and shipping speed.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Seller's Products */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Package className="w-5 h-5 text-primary-600" />
          <h2 className="text-2xl font-bold text-surface-900">All Products</h2>
        </div>

        {products.length === 0 ? (
          <EmptyState
            title="No products yet"
            description="This seller hasn't listed any products."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                      {product.category}
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
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
