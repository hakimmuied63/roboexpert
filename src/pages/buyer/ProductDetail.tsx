import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, Truck, Heart, Share2, ChevronRight, ShoppingCart } from 'lucide-react';
import { Button, Badge, LoadingSpinner } from '../../components/ui';
import { useCart } from '../../contexts/CartContext';
import {
  fetchProductById,
  type Product,
  type ProductVariant,
  type Company,
} from '../../lib/api';
import toast from 'react-hot-toast';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const { addItem } = useCart();

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      const data = await fetchProductById(id);
      if (data && data.ok) {
        setProduct(data.product);
        setVariants(data.variants);
        if (data.variants.length > 0) {
          setSelectedVariantId(data.variants[0]._id);
        }
      } else {
        setProduct(null);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <LoadingSpinner className="min-h-[50vh]" />;

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-surface-900">Product not found</h2>
        <Link to="/" className="text-primary-600 hover:underline mt-4 inline-block">
          Return to home
        </Link>
      </div>
    );
  }

  const selectedVariant = variants.find((v) => v._id === selectedVariantId) ?? null;
  const displayPrice = selectedVariant?.price ?? product.basePrice;
  const availableStock = selectedVariant?.stock ?? 0;
  const canBuy = availableStock > 0;

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error('Please select a variant');
      return;
    }
    if (!canBuy) {
      toast.error('Out of stock');
      return;
    }
    // Note: cart currently expects a mock-shape product. We'll update this in a later step.
    // For now, this is a placeholder that shows a toast.
    toast.success(`Added ${quantity} × ${product.name}`);
    // addItem(...) — will wire once cart is updated
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex text-sm text-surface-500 flex-wrap">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        {product.company && (
          <>
            <Link
              to={`/shop/${product.company._id}`}
              className="hover:text-primary-600"
            >
              {product.company.name}
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
          </>
        )}
        <span className="text-surface-900 truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-surface-100 rounded-2xl overflow-hidden border border-surface-200">
            <img
              src={product.images[activeImage] ?? 'https://via.placeholder.com/600'}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600?text=No+Image';
              }}
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-4">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === idx
                      ? 'border-primary-600 ring-2 ring-primary-100'
                      : 'border-transparent hover:border-surface-300'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            {product.company && (
              <div className="flex items-center gap-2 mb-2">
                <Link
                  to={`/shop/${product.company._id}`}
                  className="text-sm font-medium text-primary-600 hover:underline"
                >
                  {product.company.name}
                </Link>
                <Badge variant="success" dot className="bg-success-50 text-success-700">
                  Verified Seller
                </Badge>
              </div>
            )}
            <h1 className="text-3xl font-bold text-surface-900 mb-4">{product.name}</h1>
            <p className="text-sm text-surface-500">
              {availableStock > 0 ? `In Stock (${availableStock})` : 'Out of Stock'}
            </p>
          </div>

          <div className="py-6 border-y border-surface-200">
            <div className="flex items-end gap-3 mb-2">
              <span className="text-4xl font-bold text-surface-900">
                ₹{displayPrice.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-sm text-surface-500">Inclusive of all taxes</p>
          </div>

          {/* Variant selector */}
          {variants.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-surface-900">Select variant</p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => {
                  const isSelected = v._id === selectedVariantId;
                  const outOfStock = v.stock <= 0;
                  return (
                    <button
                      key={v._id}
                      type="button"
                      onClick={() => setSelectedVariantId(v._id)}
                      disabled={outOfStock}
                      className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                        isSelected
                          ? 'bg-primary-600 text-white border-primary-600'
                          : outOfStock
                          ? 'bg-surface-100 text-surface-400 border-surface-200 cursor-not-allowed'
                          : 'bg-white text-surface-700 border-surface-300 hover:border-primary-500'
                      }`}
                    >
                      {Object.entries(v.attributes)
                        .map(([key, value]) => `${value}`)
                        .join(' / ')}
                      {outOfStock && ' (out)'}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-surface-300 rounded-lg">
                <button
                  className="px-4 py-3 text-surface-600 hover:bg-surface-50 rounded-l-lg transition-colors disabled:opacity-50"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || !canBuy}
                >
                  −
                </button>
                <span className="w-12 text-center font-medium text-surface-900">{quantity}</span>
                <button
                  className="px-4 py-3 text-surface-600 hover:bg-surface-50 rounded-r-lg transition-colors disabled:opacity-50"
                  onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                  disabled={quantity >= availableStock || !canBuy}
                >
                  +
                </button>
              </div>
              <Button
                size="lg"
                className="flex-1 text-base shadow-lg shadow-primary-500/20"
                icon={<ShoppingCart className="w-5 h-5" />}
                onClick={handleAddToCart}
                disabled={!canBuy}
              >
                {canBuy ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" icon={<Heart className="w-4 h-4" />} className="flex-1">
                Save for later
              </Button>
              <Button variant="outline" icon={<Share2 className="w-4 h-4" />} className="flex-1">
                Share
              </Button>
            </div>
          </div>

          {/* Trust */}
          <div className="grid grid-cols-2 gap-4 pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-surface-100 rounded-lg text-surface-600">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-surface-900">7-Day Returns</p>
                <p className="text-xs text-surface-500">Money back guarantee</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-surface-100 rounded-lg text-surface-600">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-surface-900">Direct Shipping</p>
                <p className="text-xs text-surface-500">Shipped by seller</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-16 max-w-3xl">
        <h2 className="text-lg font-semibold text-surface-900 mb-4">Product Details</h2>
        {product.description ? (
          <p className="text-surface-600 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        ) : (
          <p className="text-surface-500">No description provided.</p>
        )}
      </div>
    </div>
  );
}