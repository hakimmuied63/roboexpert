import { Link } from 'react-router-dom';
import { Clock, Search as SearchIcon } from 'lucide-react';
import type { Product } from '../../lib/api';

type Props = {
  query: string;
  results: Product[];
  loading: boolean;
  recentSearches: string[];
  onPickRecent: (term: string) => void;
  onClearRecent: () => void;
  onSeeAll: () => void;
  onClose: () => void;
};

export function SearchDropdown({
  query,
  results,
  loading,
  recentSearches,
  onPickRecent,
  onClearRecent,
  onSeeAll,
  onClose,
}: Props) {
  const trimmedQuery = query.trim();
  const showRecents = !trimmedQuery && recentSearches.length > 0;
  const showResults = trimmedQuery.length >= 2;
  const noResults = showResults && !loading && results.length === 0;

  return (
    <div
      className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl border border-surface-200 shadow-lg z-50 overflow-hidden"
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* Recent searches — only when input is empty */}
      {showRecents && (
        <div>
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide">
              Recent searches
            </p>
            <button
              type="button"
              onClick={onClearRecent}
              className="text-xs text-surface-400 hover:text-danger-600 transition-colors cursor-pointer"
            >
              Clear all
            </button>
          </div>
          <ul className="pb-2">
            {recentSearches.map((term) => (
              <li key={term}>
                <button
                  type="button"
                  onClick={() => onPickRecent(term)}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-surface-50 text-left transition-colors cursor-pointer"
                >
                  <Clock className="w-4 h-4 text-surface-400 flex-shrink-0" />
                  <span className="text-sm text-surface-700 truncate">{term}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Loading */}
      {showResults && loading && (
        <div className="px-4 py-6 text-center">
          <div className="inline-block w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-surface-500 mt-2">Searching...</p>
        </div>
      )}

      {/* No results */}
      {noResults && (
        <div className="px-4 py-6 text-center">
          <p className="text-sm text-surface-600">
            No products found for "<span className="font-medium">{trimmedQuery}</span>"
          </p>
        </div>
      )}

      {/* Results */}
      {showResults && !loading && results.length > 0 && (
        <>
          <ul className="py-2">
            {results.map((product) => (
              <li key={product._id}>
                <Link
                  to={`/product/${product._id}`}
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-surface-50 transition-colors"
                >
                  <img
                    src={product.images[0] ?? 'https://picsum.photos/48'}
                    alt={product.name}
                    className="w-10 h-10 rounded-md object-cover bg-surface-100 flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://picsum.photos/48';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-900 truncate">
                      {product.name}
                    </p>
                    {product.company && (
                      <p className="text-xs text-surface-500 truncate">
                        {product.company.name}
                      </p>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-surface-900 flex-shrink-0">
                    ₹{product.basePrice.toLocaleString('en-IN')}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={onSeeAll}
            className="w-full px-4 py-3 text-sm font-medium text-primary-600 hover:bg-primary-50 border-t border-surface-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <SearchIcon className="w-4 h-4" />
            See all results for "{trimmedQuery}"
          </button>
        </>
      )}
    </div>
  );
}