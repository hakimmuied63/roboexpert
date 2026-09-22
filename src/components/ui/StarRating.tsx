import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showValue?: boolean;
  reviewCount?: number;
}

const sizeMap = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  showValue = false,
  reviewCount,
}: StarRatingProps) {
  return (
    <div className="inline-flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, i) => {
          const filled = i < Math.floor(rating);
          const halfFilled = !filled && i < rating;

          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange?.(i + 1)}
              className={`
                ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
                disabled:cursor-default
              `}
              aria-label={`${i + 1} star${i + 1 > 1 ? 's' : ''}`}
            >
              <Star
                className={`
                  ${sizeMap[size]}
                  ${filled ? 'fill-warning-500 text-warning-500' : ''}
                  ${halfFilled ? 'fill-warning-500/50 text-warning-500' : ''}
                  ${!filled && !halfFilled ? 'fill-surface-200 text-surface-200' : ''}
                `}
              />
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-surface-700 ml-1">{rating.toFixed(1)}</span>
      )}
      {reviewCount !== undefined && (
        <span className="text-sm text-surface-400 ml-0.5">({reviewCount})</span>
      )}
    </div>
  );
}
