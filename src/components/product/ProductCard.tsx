import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BadgeCheck, ImageOff, Plus, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Product } from '../../lib/api';
import { fetchProductById } from '../../lib/api';
import { useCart } from '../../contexts/CartContext';
import { WishlistButton } from '../wishlist/WishlistButton';
import {
  formatInr,
  getCompareAtPrice,
  getDiscountPercent,
  getProductRating,
  getReviewCount,
  isNewProduct,
} from '../../lib/marketplaceUi';

type Props = {
  product: Product;
};

export function ProductCard({ product }: Props) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [imgState, setImgState] = useState<'loading' | 'ready' | 'error'>(
    product.images?.[0] ? 'loading' : 'error'
  );
  const [adding, setAdding] = useState(false);

  const src = product.images?.[0];
  const compareAt = getCompareAtPrice(product);
  const discount = getDiscountPercent(product);
  const rating = getProductRating(product);
  const reviews = getReviewCount(product);
  const isNew = isNewProduct(product);

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (adding) return;
    setAdding(true);
    try {
      const data = await fetchProductById(product._id);
      const variant =
        data?.variants.find((v) => v.isActive && v.stock > 0) ??
        data?.variants.find((v) => v.stock > 0) ??
        data?.variants[0];
      if (!data?.ok || !variant) {
        navigate(`/product/${product._id}`);
        return;
      }
      if (variant.stock <= 0) {
        toast.error('Out of stock');
        return;
      }
      addItem(product, variant, product.company?.name ?? 'Seller');
      toast.success('Added to cart');
    } catch {
      toast.error('Could not add to cart');
    } finally {
      setAdding(false);
    }
  };

  return (
    <article className="h-full">
      <Link
        to={`/product/${product._id}`}
        className="group flex h-full flex-col rounded-[24px] sm:rounded-[28px] bg-white border border-[#E6E6F0] shadow-card overflow-hidden transition-all duration-300 hover:-translate-y-[6px] hover:shadow-card-hover"
      >
        {/* Product Image Area */}
        <div className="relative aspect-[4/5] bg-[#F4F3FB] overflow-hidden">
          {imgState === 'loading' && (
            <div className="absolute inset-0 animate-pulse bg-surface-200" aria-hidden />
          )}
          {src && imgState !== 'error' ? (
            <img
              src={src}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
              onLoad={() => setImgState('ready')}
              onError={() => setImgState('error')}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-surface-400 bg-surface-100">
              <ImageOff className="w-8 h-8" aria-hidden />
              <span className="text-xs font-medium">No image</span>
            </div>
          )}

          {/* Badges: Gradient Discount and Gradient "New" Badge */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
            {discount !== undefined && discount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#FF6A2B] to-[#FF8A3D] text-white text-[11px] font-bold shadow-sm">
                {discount}% off
              </span>
            )}
            {isNew && (
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#4F46FF] to-[#7A5CFF] text-white text-[11px] font-bold shadow-sm">
                New
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <div className="absolute top-3 right-3 z-10">
            <WishlistButton productId={product._id} size="sm" />
          </div>

          {/* Quick Add Button on Hover */}
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={adding}
            className="absolute bottom-3 left-3 right-3 z-10 inline-flex items-center justify-center gap-1.5 rounded-full bg-[#14122B] hover:bg-black text-white text-xs font-semibold py-2.5 px-4 shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 cursor-pointer disabled:opacity-60 hover:-translate-y-0.5"
          >
            <Plus className="w-3.5 h-3.5" />
            {adding ? 'Adding…' : 'Quick add'}
          </button>
        </div>

        {/* Product Details Area */}
        <div className="p-4 flex flex-col flex-1 gap-1.5">
          <h3 className="text-sm font-bold text-[#14122B] font-display line-clamp-2 leading-snug group-hover:text-[#4F46FF] transition-colors duration-150">
            {product.name}
          </h3>

          {rating !== undefined && (
            <div className="flex items-center gap-1 text-xs text-surface-600">
              <Star className="w-3.5 h-3.5 fill-warning-500 text-warning-500" aria-hidden />
              <span className="font-bold text-[#14122B]">{rating.toFixed(1)}</span>
              {reviews !== undefined && (
                <span className="text-surface-400">({reviews})</span>
              )}
            </div>
          )}

          {/* Indigo price */}
          <div className="flex items-baseline gap-2 mt-auto pt-2">
            <p className="text-base sm:text-lg font-extrabold text-[#4F46FF] font-display">
              {formatInr(product.basePrice)}
            </p>
            {compareAt !== undefined && (
              <p className="text-xs text-surface-400 line-through">{formatInr(compareAt)}</p>
            )}
          </div>

          {/* Seller with green verified tick */}
          {product.company && (
            <p className="flex items-center gap-1.5 text-xs text-surface-500 truncate pt-0.5">
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden />
              <span className="truncate font-medium">{product.company.name}</span>
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-[24px] sm:rounded-[28px] border border-[#E6E6F0] overflow-hidden shadow-card">
      <div className="aspect-[4/5] bg-surface-200 animate-pulse" />
      <div className="p-4 space-y-2.5">
        <div className="h-4 w-5/6 bg-surface-200 animate-pulse rounded-full" />
        <div className="h-4 w-1/2 bg-surface-200 animate-pulse rounded-full" />
        <div className="h-5 w-24 bg-surface-200 animate-pulse rounded-full mt-3" />
      </div>
    </div>
  );
}
