import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ImageOff, Star, ShoppingCart } from 'lucide-react';
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
} from '../../lib/marketplaceUi';

type Props = {
  product: Product;
};

export function ProductCard({ product }: Props) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [imgError, setImgError] = useState(false);
  const [adding, setAdding] = useState(false);

  const src = product.images?.[0];
  const compareAt = getCompareAtPrice(product);
  const discount = getDiscountPercent(product);
  const rating = getProductRating(product);
  const reviews = getReviewCount(product);

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
      <div className="group flex h-full flex-col rounded-xl bg-white border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden p-3 sm:p-3.5">
        {/* Product Image Area */}
        <div className="relative aspect-square w-full rounded-lg bg-slate-50/70 overflow-hidden flex items-center justify-center mb-2.5">
          {src && !imgError ? (
            <Link to={`/product/${product._id}`} className="w-full h-full flex items-center justify-center p-2">
              <img
                src={src}
                alt={product.name}
                loading="lazy"
                className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                onError={() => setImgError(true)}
              />
            </Link>
          ) : (
            <Link to={`/product/${product._id}`} className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-slate-400">
              <ImageOff className="w-8 h-8 stroke-1" aria-hidden />
              <span className="text-[11px] font-medium">No image</span>
            </Link>
          )}

          {/* Discount Badge on Top-Left */}
          {discount !== undefined && discount > 0 ? (
            <div className="absolute top-2 left-2 z-10 pointer-events-none">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#cc0c39] text-white shadow-sm">
                {discount}% off
              </span>
            </div>
          ) : null}
                    {/* Top Rated Badge */}
                    {rating !== undefined && rating >= 4.0 && reviews > 0 && (
            <div className={`absolute left-2 z-10 pointer-events-none ${discount !== undefined && discount > 0 ? 'top-9' : 'top-2'}`}>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#febd69] text-slate-900 shadow-sm uppercase tracking-wide flex items-center gap-1">
                <Star className="w-2.5 h-2.5 fill-slate-900" />
                Top Rated
              </span>
            </div>
          )}

          {/* Wishlist Heart on Top-Right */}
          <div className="absolute top-2 right-2 z-10">
            <WishlistButton
              productId={product._id}
              size="sm"
              className="bg-white/80 hover:bg-white text-slate-400 hover:text-red-500 shadow-sm"
            />
          </div>
        </div>

        {/* Product Details Area */}
        <div className="flex flex-col flex-1">
          {/* Title */}
          <Link
            to={`/product/${product._id}`}
            className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-2 leading-snug group-hover:text-amber-800 transition-colors mb-1 min-h-[2.4em]"
            title={product.name}
          >
            {product.name}
          </Link>

          {/* Seller Name */}
          <p className="text-[11px] sm:text-xs text-slate-500 truncate mb-1.5">
            {product.company?.name || 'Verified Seller'}
          </p>

                  {/* Star Rating & Review Count */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-2">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-current text-amber-500" aria-hidden />
            </div>
            <span className="font-semibold text-slate-800 text-[11px] sm:text-xs">
              {(rating ?? 0).toFixed(1)}
            </span>
            <span className="text-slate-400 text-[11px]">
              ({reviews ?? 0})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-auto mb-3">
            <span className="text-sm sm:text-base font-extrabold text-slate-900">
              {formatInr(product.basePrice)}
            </span>
            {compareAt !== undefined && (
              <span className="text-xs text-slate-400 line-through">
                {formatInr(compareAt)}
              </span>
            )}
          </div>

          {/* Yellow "Add to Cart" Button */}
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={adding}
            className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 sm:py-2 px-3 rounded-lg bg-[#ffd814] hover:bg-[#f7ca00] active:bg-[#f0b800] text-slate-900 text-xs sm:text-sm font-semibold shadow-sm transition-all duration-150 cursor-pointer disabled:opacity-60 active:scale-[0.98]"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{adding ? 'Adding...' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-3.5 shadow-sm space-y-3">
      <div className="aspect-square bg-slate-100 animate-pulse rounded-lg" />
      <div className="space-y-2">
        <div className="h-3.5 w-5/6 bg-slate-100 animate-pulse rounded" />
        <div className="h-3 w-1/2 bg-slate-100 animate-pulse rounded" />
        <div className="h-3 w-1/3 bg-slate-100 animate-pulse rounded" />
        <div className="h-4 w-2/5 bg-slate-100 animate-pulse rounded" />
        <div className="h-8 w-full bg-slate-200 animate-pulse rounded-lg mt-2" />
      </div>
    </div>
  );
}
