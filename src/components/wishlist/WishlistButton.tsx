import { Heart } from 'lucide-react';
import { useWishlist } from '../../contexts/WishlistContext';

type Props = {
  productId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
};

export function WishlistButton({
  productId,
  size = 'md',
  className = '',
  showLabel = false,
}: Props) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const active = isInWishlist(productId);

  const iconSize =
    size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
  const btnSize =
    size === 'sm'
      ? 'w-7 h-7'
      : size === 'lg'
      ? 'w-11 h-11'
      : 'w-9 h-9';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(productId);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`inline-flex items-center gap-2 ${
        showLabel
          ? `px-3 py-2 rounded-lg border transition-colors ${
              active
                ? 'border-danger-300 bg-danger-50 text-danger-600'
                : 'border-surface-300 text-surface-600 hover:border-danger-300 hover:text-danger-600'
            }`
          : `${btnSize} rounded-full flex items-center justify-center transition-colors ${
              active
                ? 'bg-danger-50 text-danger-600 hover:bg-danger-100'
                : 'bg-white/90 hover:bg-white text-surface-500 hover:text-danger-600 shadow-sm'
            }`
      } ${className}`}
    >
      <Heart
        className={`${iconSize} ${active ? 'fill-current' : ''} transition-all`}
      />
      {showLabel && (
        <span className="text-sm font-medium">
          {active ? 'In wishlist' : 'Add to wishlist'}
        </span>
      )}
    </button>
  );
}