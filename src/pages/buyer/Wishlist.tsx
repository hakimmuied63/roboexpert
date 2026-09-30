import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { fetchProductById, type Product, type ProductVariant } from '../../lib/api';
import { LoadingSpinner, EmptyState, Button } from '../../components/ui';
import toast from 'react-hot-toast';

type WishlistItem = {
  product: Product;
  variants: ProductVariant[];
};

export function Wishlist() {
  const { items: wishlistIds, removeFromWishlist, clearWishlist } = useWishlist();
  const { addItem } = useCart();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (wishlistIds.length === 0) {
        setWishlistItems([]);
        setLoading(false);
        return;
      }
      setLoading(true);

      const results = await Promise.all(
        wishlistIds.map((id) => fetchProductById(id))
      );

      const items: WishlistItem[] = [];
      for (const result of results) {
        if (result && result.ok) {
          items.push({ product: result.product, variants: result.variants });
        }
      }
      setWishlistItems(items);
      setLoading(false);
    };

    load();
  }, [wishlistIds]);

  const handleMoveToCart = (item: WishlistItem) => {
    // Find first variant with stock > 0
    const availableVariant = item.variants.find((v) => v.stock > 0);
    if (!availableVariant) {
      toast.error('This product is out of stock');
      return;
    }

    addItem(
      item.product,
      availableVariant,
      item.product.company?.name ?? 'Unknown seller',
      1
    );
    removeFromWishlist(item.product._id);
    toast.success('Added to cart');
  };

  const handleRemove = (productId: string, name: string) => {
    removeFromWishlist(productId);
    toast.success(`Removed ${name} from wishlist`);
  };

  const handleClearAll = () => {
    if (window.confirm('Clear your entire wishlist?')) {
      clearWishlist();
      toast.success('Wishlist cleared');
    }
  };

  if (loading) return <LoadingSpinner className="min-h-[50vh]" />;

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={<Heart className="w-12 h-12 text-surface-400" />}
          title="Your wishlist is empty"
          description="Save products you love by clicking the heart icon on any product."
          action={
            <Link to="/">
              <Button>Start shopping</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-surface-900">My Wishlist</h1>
          <p className="text-surface-500 mt-1">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
        <button
          type="button"
          onClick={handleClearAll}
          className="text-sm text-surface-500 hover:text-danger-600 transition-colors cursor-pointer"
        >
          Clear all
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistItems.map(({ product, variants }) => {
          const availableVariant = variants.find((v) => v.stock > 0);
          const inStock = !!availableVariant;
          const displayPrice = availableVariant?.price ?? product.basePrice;

          return (
            <div
              key={product._id}
              className="group bg-white border border-surface-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
            >
              {/* Image */}
              <Link
                to={`/product/${product._id}`}
                className="relative block aspect-square bg-surface-100 overflow-hidden"
              >
                <img
                  src={product.images[0] ?? 'https://picsum.photos/400'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://picsum.photos/400';
                  }}
                />
                {!inStock && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
                    Out of stock
                  </span>
                )}
              </Link>

              {/* Info */}
              <div className="p-4 flex flex-col flex-1">
                {product.company && (
                  <p className="text-xs text-surface-500 uppercase tracking-wide mb-1 truncate">
                    {product.company.name}
                  </p>
                )}
                <Link
                  to={`/product/${product._id}`}
                  className="text-sm font-medium text-surface-900 line-clamp-2 hover:text-primary-600 transition-colors mb-2 min-h-[2.5em]"
                >
                  {product.name}
                </Link>
                <p className="text-lg font-bold text-surface-900 mb-3">
                  ₹{displayPrice.toLocaleString('en-IN')}
                </p>

                {/* Actions */}
                <div className="mt-auto flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<ShoppingCart className="w-3.5 h-3.5" />}
                    onClick={() => handleMoveToCart({ product, variants })}
                    disabled={!inStock}
                    className="flex-1"
                  >
                    Move to cart
                  </Button>
                  <button
                    type="button"
                    onClick={() => handleRemove(product._id, product.name)}
                    className="p-2 rounded-lg text-surface-400 hover:bg-danger-50 hover:text-danger-600 transition-colors cursor-pointer"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}