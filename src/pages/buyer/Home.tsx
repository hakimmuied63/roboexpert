import { useEffect, useMemo, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button, EmptyState } from '../../components/ui';
import { Hero } from '../../components/home/Hero';
import { TrustStrip } from '../../components/home/TrustStrip';
import { SellerCta } from '../../components/home/SellerCta';
import { ProductSection } from '../../components/product/ProductSection';
import {
  fetchAllProducts,
  fetchAllCompanies,
  type Product,
  type CompanySummary,
} from '../../lib/api';
import { hasUsableImage } from '../../lib/marketplaceUi';

export function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const [prods, comps] = await Promise.all([fetchAllProducts(), fetchAllCompanies()]);
      setProducts(prods);
      setCompanies(comps);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);


  const heroProducts = useMemo(
    () => products.filter(hasUsableImage).slice(0, 4),
    [products]
  );

  const newArrivals = useMemo(() => {
    return [...products]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 10);
  }, [products]);

  const trending = useMemo(() => {
    return [...products]
      .sort((a, b) => Number(hasUsableImage(b)) - Number(hasUsableImage(a)))
      .slice(0, 10);
  }, [products]);

  const under999 = useMemo(
    () => products.filter((p) => p.basePrice <= 999).slice(0, 10),
    [products]
  );

  const moreToExplore = useMemo(() => {
    const taken = new Set([
      ...trending.slice(0, 5).map((p) => p._id),
      ...newArrivals.slice(0, 5).map((p) => p._id),
    ]);
    const rest = products.filter((p) => !taken.has(p._id));
    return (rest.length >= 4 ? rest : products).slice(0, 15);
  }, [products, trending, newArrivals]);

  return (
    <div className="pb-16 space-y-10 sm:space-y-12">
      <Hero products={heroProducts} />
      <TrustStrip />

      {error ? (
        <div className="max-w-7xl mx-auto px-4">
          <div className="rounded-xl border border-danger-100 bg-white">
            <EmptyState
              icon={<AlertCircle className="w-8 h-8 text-danger-500" />}
              title="Couldn’t load products"
              description="Please try again. Your cart and account are unaffected."
              action={
                <Button onClick={load} variant="primary">
                  Retry
                </Button>
              }
            />
          </div>
        </div>
      ) : (
        <>
          <ProductSection
            title="Trending now"
            products={trending}
            loading={loading}
            seeAllHref="/search"
          />
          <ProductSection
            title="New arrivals"
            products={newArrivals}
            loading={loading}
            seeAllHref="/search"
          />
          {(loading || under999.length > 0) && (
            <ProductSection
              title="Under ₹999"
              products={under999}
              loading={loading}
              seeAllHref="/search"
              emptyTitle="No products under ₹999"
              emptyDescription="Try trending picks or browse all products."
            />
          )}
          <ProductSection
            title="More to explore"
            products={moreToExplore}
            loading={loading}
            layout="grid"
            seeAllHref="/search"
            emptyTitle="No products yet"
            emptyDescription="Sellers are setting up their shops. Check back soon — or start selling today."
          />
        </>
      )}

      <SellerCta />

      {!loading && companies.length > 0 && (
        <p className="max-w-7xl mx-auto px-4 text-center text-xs text-surface-500">
          {products.length} products from {companies.length}{' '}
          {companies.length === 1 ? 'seller' : 'sellers'} across India
        </p>
      )}
    </div>
  );
}
