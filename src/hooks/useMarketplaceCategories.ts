import { useEffect, useState } from 'react';
import { fetchMarketplaceCategories, type Category } from '../lib/api';
import { isVisibleMarketplaceCategory } from '../lib/marketplaceUi';

export function useMarketplaceCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchMarketplaceCategories()
      .then((cats) => {
        if (!cancelled) setCategories(cats.filter(isVisibleMarketplaceCategory));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, loading };
}
