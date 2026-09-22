import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Shield, Truck, Heart, Share2, Info, ChevronRight, ShoppingCart } from 'lucide-react';
import { productService, reviewService } from '../../mocks/services';
import type { Product, Review } from '../../types';
import { Button, Badge, LoadingSpinner, StarRating } from '../../components/ui';
import { useCart } from '../../contexts/CartContext';
import toast from 'react-hot-toast';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  const { addItem } = useCart();

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      const [p, r] = await Promise.all([
        productService.getById(id),
        reviewService.getByProduct(id),
      ]);
      setProduct(p || null);
      setReviews(r);
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

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success('Added to cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex text-sm text-surface-500">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <Link to={`/category/${product.category.toLowerCase()}`} className="hover:text-primary-600">{product.category}</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-surface-900 truncate max-w-xs">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-surface-100 rounded-2xl overflow-hidden border border-surface-200">
            <img
              src={product.images[activeImage]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-4">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === idx ? 'border-primary-600 ring-2 ring-primary-100' : 'border-transparent hover:border-surface-300'
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
            <div className="flex items-center gap-2 mb-2">
              <Link to={`/seller-profile/${product.sellerId}`} className="text-sm font-medium text-primary-600 hover:underline">
                {product.sellerName}
              </Link>
              <Badge variant="success" dot className="bg-success-50 text-success-700">Verified Seller</Badge>
            </div>
            <h1 className="text-3xl font-bold text-surface-900 mb-4">{product.title}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <StarRating rating={product.rating} />
                <span className="text-sm font-medium text-surface-900 ml-1">{product.rating.toFixed(1)}</span>
                <span className="text-sm text-surface-500 underline cursor-pointer" onClick={() => setActiveTab('reviews')}>
                  ({product.reviewCount} reviews)
                </span>
              </div>
              <span className="text-surface-300">|</span>
              <span className="text-sm text-surface-500">{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
            </div>
          </div>

          <div className="py-6 border-y border-surface-200">
            <div className="flex items-end gap-3 mb-2">
              <span className="text-4xl font-bold text-surface-900">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.compareAtPrice && (
                <span className="text-lg text-surface-400 line-through mb-1">
                  ₹{product.compareAtPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <p className="text-sm text-surface-500">Inclusive of all taxes</p>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-surface-300 rounded-lg">
                <button
                  className="px-4 py-3 text-surface-600 hover:bg-surface-50 rounded-l-lg transition-colors"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || product.stock === 0}
                >
                  -
                </button>
                <span className="w-12 text-center font-medium text-surface-900">{quantity}</span>
                <button
                  className="px-4 py-3 text-surface-600 hover:bg-surface-50 rounded-r-lg transition-colors"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock || product.stock === 0}
                >
                  +
                </button>
              </div>
              <Button
                size="lg"
                className="flex-1 text-base shadow-lg shadow-primary-500/20"
                icon={<ShoppingCart className="w-5 h-5" />}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
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

          {/* Trust Guarantees */}
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

      {/* Tabs */}
      <div className="mt-16">
        <div className="flex items-center gap-8 border-b border-surface-200">
          <button
            className={`pb-4 text-base font-medium transition-colors border-b-2 ${
              activeTab === 'details' ? 'border-primary-600 text-primary-600' : 'border-transparent text-surface-500 hover:text-surface-700'
            }`}
            onClick={() => setActiveTab('details')}
          >
            Product Details
          </button>
          <button
            className={`pb-4 text-base font-medium transition-colors border-b-2 ${
              activeTab === 'reviews' ? 'border-primary-600 text-primary-600' : 'border-transparent text-surface-500 hover:text-surface-700'
            }`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({product.reviewCount})
          </button>
        </div>

        <div className="py-8">
          {activeTab === 'details' && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-surface-900 mb-4">Description</h3>
                <p className="text-surface-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-surface-900 mb-4">Specifications</h3>
                <div className="bg-surface-50 rounded-xl border border-surface-200 p-4">
                  <dl className="space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-surface-500">Category</dt>
                      <dd className="col-span-2 text-sm text-surface-900">{product.category}</dd>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-surface-500">Seller</dt>
                      <dd className="col-span-2 text-sm text-surface-900">{product.sellerName}</dd>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-surface-500">Listed On</dt>
                      <dd className="col-span-2 text-sm text-surface-900">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </dd>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-surface-500">Tags</dt>
                      <dd className="col-span-2 text-sm text-surface-900 flex flex-wrap gap-2">
                        {product.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-white border border-surface-200 rounded-md text-xs">
                            {tag}
                          </span>
                        ))}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="max-w-3xl space-y-8">
              {/* Review Summary */}
              <div className="flex items-center gap-8 bg-surface-50 rounded-xl border border-surface-200 p-6">
                <div className="text-center">
                  <p className="text-5xl font-bold text-surface-900">{product.rating.toFixed(1)}</p>
                  <div className="my-2"><StarRating rating={product.rating} /></div>
                  <p className="text-sm text-surface-500">Based on {product.reviewCount} reviews</p>
                </div>
                <div className="flex-1 border-l border-surface-200 pl-8">
                  {/* Mock progress bars */}
                  {[5, 4, 3, 2, 1].map(r => (
                    <div key={r} className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-surface-600 w-3">{r}</span>
                      <Star className="w-4 h-4 text-warning-500 fill-warning-500" />
                      <div className="flex-1 h-2 bg-surface-200 rounded-full overflow-hidden">
                        <div className="h-full bg-warning-500 rounded-full" style={{ width: `${Math.random() * 80 + 10}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review List */}
              <div className="space-y-6">
                {reviews.length === 0 ? (
                  <p className="text-surface-500">No reviews yet for this product.</p>
                ) : (
                  reviews.map(review => (
                    <div key={review.id} className="border-b border-surface-200 pb-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <img src={review.userAvatar} alt="" className="w-10 h-10 rounded-full bg-surface-200" />
                          <div>
                            <p className="font-medium text-surface-900">{review.userName}</p>
                            <p className="text-xs text-surface-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <StarRating rating={review.rating} size="sm" />
                      </div>
                      <h4 className="font-semibold text-surface-900 mb-1">{review.title}</h4>
                      <p className="text-surface-600 text-sm">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
