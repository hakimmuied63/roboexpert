import { useEffect, useState, useRef, useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useDebounce } from '../../hooks/useDebounce';
import {
  ChevronDown,
  ChevronRight,
  Clock,
  Search,
  Store,
  BadgeCheck,
  X,
  PackageOpen,
} from 'lucide-react';
import { WishlistButton } from '../../components/wishlist/WishlistButton';
import {
  fetchCompanyProducts,
  fetchCompanyCategories,
  fetchProductsByCompanyCategory,
  fetchCompanyById,
  type CatalogResponse,
  type Category,
  type Product,
} from '../../lib/api';

type CategoryWithChildren = Category & {
  children?: Category[];
};

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'name';

export const StorefrontPage = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const categorySlug = searchParams.get('category');
  const searchQuery = searchParams.get('q') ?? '';

  const [data, setData] = useState<CatalogResponse | null>(null);
  const [companyDetails, setCompanyDetails] = useState<any>(null);
  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const [aboutOpen, setAboutOpen] = useState(false);
  const [sort, setSort] = useState<SortKey>('featured');
  const searchContainerRef = useRef<HTMLFormElement>(null);

  const debouncedSearchInput = useDebounce(searchInput, 400);

  const recentKey = useMemo(
    () => (companyId ? `roboexpert_recent_searches_store_${companyId}` : ''),
    [companyId]
  );

  useEffect(() => {
    if (!recentKey) return;
    try {
      const stored = localStorage.getItem(recentKey);
      setRecentSearches(stored ? JSON.parse(stored) : []);
    } catch {
      setRecentSearches([]);
    }
  }, [recentKey]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const load = async () => {
      if (!companyId) {
        setError('No company specified');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const [catalogResult, categoriesResult, companyInfo] = await Promise.all([
        fetchCompanyProducts(companyId),
        fetchCompanyCategories(companyId),
        fetchCompanyById(companyId),
      ]);

      if (!catalogResult || !catalogResult.ok) {
        setError('Store not found');
        setLoading(false);
        return;
      }

      setData(catalogResult);
      setCategories(categoriesResult as CategoryWithChildren[]);
      if (companyInfo) setCompanyDetails(companyInfo);
      setLoading(false);
    };

    load();
  }, [companyId]);

  useEffect(() => {
    const loadFiltered = async () => {
      if (!companyId || !categorySlug) {
        setFilteredProducts(null);
        return;
      }

      const result = await fetchProductsByCompanyCategory(companyId, categorySlug, true);
      if (result && result.ok) {
        setFilteredProducts(result.products);
      } else {
        setFilteredProducts([]);
      }
    };

    loadFiltered();
  }, [companyId, categorySlug]);

  const addRecentSearch = (term: string) => {
    if (!recentKey || !term.trim()) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((t) => t.toLowerCase() !== term.toLowerCase());
      const next = [term, ...filtered].slice(0, 5);
      localStorage.setItem(recentKey, JSON.stringify(next));
      return next;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    if (recentKey) localStorage.removeItem(recentKey);
  };

  const handlePickRecent = (term: string) => {
    setSearchInput(term);
    setDropdownOpen(false);
    const params = new URLSearchParams(searchParams);
    params.set('q', term);
    setSearchParams(params);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (trimmed) addRecentSearch(trimmed);
    setDropdownOpen(false);
    const params = new URLSearchParams(searchParams);
    if (trimmed) params.set('q', trimmed);
    else params.delete('q');
    setSearchParams(params);
  };

  const clearSearch = () => {
    setSearchInput('');
    const params = new URLSearchParams(searchParams);
    params.delete('q');
    setSearchParams(params);
  };

  const handleCategoryClick = (slug: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (slug) params.set('category', slug);
    else params.delete('category');
    params.delete('q');
    setSearchParams(params);
  };

  /* ---------- Loading / error states ---------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="h-40 sm:h-56 lg:h-64 w-full bg-slate-200 animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="-mt-10 sm:-mt-14 flex items-end gap-4">
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-slate-300 animate-pulse border-4 border-slate-50" />
            <div className="pb-2 space-y-2 flex-1">
              <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white border border-slate-100 overflow-hidden">
                <div className="aspect-[4/5] bg-slate-200 animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-slate-200 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-slate-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Store className="w-8 h-8 text-slate-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Store not found</h1>
          <p className="text-slate-500 mb-6">
            The store you're looking for doesn't exist or is no longer active.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  /* ---------- Derived data ---------- */

  const currentCategory = categorySlug ? findCategoryBySlug(categories, categorySlug) : null;
  const activeParent = currentCategory?.parentId
    ? findCategoryById(categories, currentCategory.parentId)
    : currentCategory;
  const subCategories = activeParent?.children ?? [];

  const breadcrumbs: { name: string; slug: string }[] = [];
  if (currentCategory) {
    if (activeParent && activeParent._id !== currentCategory._id) {
      breadcrumbs.push({ name: activeParent.name, slug: activeParent.slug });
    }
    breadcrumbs.push({ name: currentCategory.name, slug: currentCategory.slug });
  }

  const productsToShow = (() => {
    let list: Product[] = filteredProducts !== null ? filteredProducts : data.products;
    const activeQuery = debouncedSearchInput.trim().toLowerCase();
    if (activeQuery) {
      list = list.filter((p) => p.name.toLowerCase().includes(activeQuery));
    }
    const sorted = [...list];
    if (sort === 'price-asc') sorted.sort((a, b) => a.basePrice - b.basePrice);
    else if (sort === 'price-desc') sorted.sort((a, b) => b.basePrice - a.basePrice);
    else if (sort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  })();

  const trimmedInput = searchInput.trim();
  const showRecents = !trimmedInput && recentSearches.length > 0;

  // Dynamic theme & layout (from store settings)
  const primaryColor: string = companyDetails?.primaryColor || '#2563eb';
  const layoutStyle: string = companyDetails?.layoutStyle || 'grid';
  const gridColumns: number = companyDetails?.gridColumns || 4;
  const isList = layoutStyle === 'list';
  const gridClass = isList
    ? 'grid-cols-1 gap-3 sm:gap-4'
    : gridColumns === 2
    ? 'grid-cols-2 gap-3 sm:gap-5'
    : gridColumns === 3
    ? 'grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5'
    : 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5';

  const activeStyle = {
    color: primaryColor,
    backgroundColor: `${primaryColor}14`,
  } as const;

  const aboutText: string | undefined = companyDetails?.aboutText;
  const aboutIsLong = !!aboutText && aboutText.length > 140;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* ================= HERO ================= */}
      <header>
        <div
          className="relative h-40 sm:h-56 lg:h-72 w-full overflow-hidden"
          style={{
            background: companyDetails?.bannerUrl
              ? `url(${companyDetails.bannerUrl}) center/cover`
              : `linear-gradient(120deg, ${primaryColor} 0%, ${primaryColor}99 45%, #0f172a 100%)`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          {!companyDetails?.bannerUrl && (
            <div
              className="absolute -right-16 -top-16 w-72 h-72 rounded-full opacity-20 blur-3xl"
              style={{ backgroundColor: '#fff' }}
            />
          )}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-12 sm:-mt-16 bg-white rounded-3xl shadow-lg shadow-slate-200/60 border border-slate-100 p-4 sm:p-6">
            <div className="flex items-start sm:items-center gap-4 sm:gap-6">
              {/* Logo */}
              <div className="-mt-12 sm:-mt-0 w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-white shadow-md border-4 border-white ring-1 ring-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {companyDetails?.logoUrl ? (
                  <img
                    src={companyDetails.logoUrl}
                    alt={data.company.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Store className="w-9 h-9 sm:w-12 sm:h-12" style={{ color: primaryColor }} />
                )}
              </div>

              {/* Name / tagline */}
              <div className="flex-1 min-w-0 pt-1 sm:pt-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight truncate max-w-full">
                    {data.company.name}
                  </h1>
                  <span
                    className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100"
                    title="Verified Seller"
                  >
                    <BadgeCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                </div>
                {companyDetails?.tagline && (
                  <p className="text-slate-500 text-sm sm:text-base mt-1 line-clamp-2">
                    {companyDetails.tagline}
                  </p>
                )}
                <div className="hidden sm:flex items-center gap-2 mt-3 text-sm text-slate-500">
                  <span
                    className="inline-flex items-center px-3 py-1 rounded-full font-semibold"
                    style={activeStyle}
                  >
                    {data.products.length} {data.products.length === 1 ? 'product' : 'products'}
                  </span>
                  {categories.length > 0 && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 font-medium">
                      {categories.length} {categories.length === 1 ? 'category' : 'categories'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile stats */}
            <div className="flex sm:hidden items-center gap-2 mt-3 text-xs text-slate-500">
              <span className="px-2.5 py-1 rounded-full font-semibold" style={activeStyle}>
                {data.products.length} products
              </span>
              {categories.length > 0 && (
                <span className="px-2.5 py-1 rounded-full bg-slate-100 font-medium">
                  {categories.length} categories
                </span>
              )}
            </div>

            {/* About */}
            {aboutText && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p
                  className={`text-sm text-slate-600 leading-relaxed whitespace-pre-line ${
                    aboutOpen ? '' : 'line-clamp-2'
                  }`}
                >
                  {aboutText}
                </p>
                {aboutIsLong && (
                  <button
                    onClick={() => setAboutOpen((v) => !v)}
                    className="mt-1 text-sm font-semibold hover:underline"
                    style={{ color: primaryColor }}
                  >
                    {aboutOpen ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ================= TOOLBAR (sticky) ================= */}
      <div className="sticky top-0 z-30 mt-5 sm:mt-6 bg-slate-50/90 backdrop-blur border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            {/* Search */}
            <form
              onSubmit={handleSearchSubmit}
              ref={searchContainerRef}
              className="relative flex-1 sm:max-w-xl"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="search"
                inputMode="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={() => setDropdownOpen(true)}
                placeholder={`Search ${data.company.name}`}
                className="w-full pl-11 pr-10 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-full text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-transparent [&::-webkit-search-cancel-button]:hidden"
                style={{ ['--tw-ring-color' as any]: primaryColor }}
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {dropdownOpen && showRecents && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 pt-3 pb-1">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      Recent searches
                    </p>
                    <button
                      type="button"
                      onClick={clearRecentSearches}
                      className="text-xs text-slate-400 hover:text-red-600 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                  <ul className="pb-2">
                    {recentSearches.map((term) => (
                      <li key={term}>
                        <button
                          type="button"
                          onClick={() => handlePickRecent(term)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left transition-colors"
                        >
                          <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span className="text-sm text-slate-700 truncate">{term}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </form>

            {/* Sort */}
            <div className="relative flex-shrink-0">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                aria-label="Sort products"
                className="appearance-none bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700 pl-4 pr-9 py-2.5 sm:py-3 shadow-sm focus:outline-none focus:ring-2 cursor-pointer"
                style={{ ['--tw-ring-color' as any]: primaryColor }}
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="name">Name: A → Z</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Mobile / tablet category chips */}
          {categories.length > 0 && (
            <div className="lg:hidden mt-3 -mx-4 px-4 overflow-x-auto no-scrollbar">
              <div className="flex gap-2 w-max pr-4">
                <Chip
                  label="All"
                  active={!categorySlug}
                  color={primaryColor}
                  onClick={() => handleCategoryClick(null)}
                />
                {categories.map((cat) => (
                  <Chip
                    key={cat._id}
                    label={cat.name}
                    active={activeParent?._id === cat._id}
                    color={primaryColor}
                    onClick={() => handleCategoryClick(cat.slug)}
                  />
                ))}
              </div>
              {subCategories.length > 0 && (
                <div className="flex gap-2 w-max pr-4 mt-2">
                  {subCategories.map((sub) => (
                    <Chip
                      key={sub._id}
                      label={sub.name}
                      small
                      active={categorySlug === sub.slug}
                      color={primaryColor}
                      onClick={() => handleCategoryClick(sub.slug)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ================= BODY ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex gap-8">
        {/* Desktop sidebar */}
        {categories.length > 0 && (
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl border border-slate-200 p-3 shadow-sm">
              <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-3 pt-2 pb-3">
                Categories
              </h2>
              <ul className="space-y-0.5">
                <li>
                  <button
                    onClick={() => handleCategoryClick(null)}
                    style={!categorySlug ? activeStyle : undefined}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${
                      !categorySlug ? 'font-semibold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    All Products
                  </button>
                </li>
                {categories.map((cat) => {
                  const hasChildren = !!cat.children && cat.children.length > 0;
                  const isActive = activeParent?._id === cat._id;
                  const isOpen = expandedCats[cat._id] ?? isActive;

                  return (
                    <li key={cat._id}>
                      <div
                        className={`flex items-center rounded-xl transition-colors ${
                          isActive && categorySlug === cat.slug ? '' : 'hover:bg-slate-50'
                        }`}
                        style={isActive && categorySlug === cat.slug ? activeStyle : undefined}
                      >
                        <button
                          onClick={() => handleCategoryClick(cat.slug)}
                          className={`flex-1 text-left px-3 py-2.5 text-sm ${
                            isActive ? 'font-semibold' : 'text-slate-700'
                          }`}
                          style={isActive ? { color: primaryColor } : undefined}
                        >
                          {cat.name}
                        </button>
                        {hasChildren && (
                          <button
                            onClick={() =>
                              setExpandedCats((s) => ({ ...s, [cat._id]: !isOpen }))
                            }
                            aria-label={isOpen ? 'Collapse' : 'Expand'}
                            className="p-2 mr-1 rounded-lg text-slate-400 hover:text-slate-700"
                          >
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                            />
                          </button>
                        )}
                      </div>

                      {hasChildren && isOpen && (
                        <ul className="ml-4 pl-3 border-l border-slate-200 my-1 space-y-0.5">
                          {cat.children!.map((sub) => (
                            <li key={sub._id}>
                              <button
                                onClick={() => handleCategoryClick(sub.slug)}
                                style={categorySlug === sub.slug ? activeStyle : undefined}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                  categorySlug === sub.slug
                                    ? 'font-semibold'
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                {sub.name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        )}

        {/* Main */}
        <main className="flex-1 min-w-0">
          {/* Breadcrumb + result count */}
          <div className="flex items-center justify-between gap-3 mb-4 min-h-[28px]">
            <nav className="flex items-center gap-1 text-sm text-slate-500 min-w-0 overflow-hidden">
              <button
                onClick={() => handleCategoryClick(null)}
                className="hover:text-slate-900 transition-colors flex-shrink-0"
              >
                All Products
              </button>
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb.slug} className="flex items-center gap-1 min-w-0">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                  <button
                    onClick={() => handleCategoryClick(crumb.slug)}
                    className={`truncate transition-colors ${
                      i === breadcrumbs.length - 1
                        ? 'font-semibold text-slate-900'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    {crumb.name}
                  </button>
                </span>
              ))}
            </nav>
            <p className="text-sm text-slate-500 flex-shrink-0">
              <span className="font-semibold text-slate-900">{productsToShow.length}</span>{' '}
              {productsToShow.length === 1 ? 'item' : 'items'}
            </p>
          </div>

          {/* Products */}
          {productsToShow.length === 0 ? (
            <div className="text-center py-20 sm:py-28 bg-white rounded-3xl border border-dashed border-slate-300">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                <PackageOpen className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-700 text-lg font-semibold px-4">
                {searchQuery
                  ? `No products matching "${searchQuery}"`
                  : categorySlug
                  ? 'No products in this category yet'
                  : 'No products available yet'}
              </p>
              <p className="text-slate-400 text-sm mt-1 px-4">
                Try a different search or browse all products.
              </p>
              {(categorySlug || searchQuery) && (
                <button
                  onClick={() => {
                    setSearchInput('');
                    setSearchParams(new URLSearchParams());
                  }}
                  className="mt-5 inline-flex items-center px-5 py-2.5 rounded-full text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: primaryColor }}
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className={`grid ${gridClass}`}>
              {productsToShow.map((product) => (
                <Link
                  key={product._id}
                  to={`/product/${product._id}`}
                  className={`group relative bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-slate-200/70 hover:border-slate-300 transition-all duration-300 ${
                    isList ? 'flex items-stretch gap-3 sm:gap-5 p-3 sm:p-4' : 'flex flex-col'
                  }`}
                >
                  <div
                    className={`relative bg-slate-100 overflow-hidden ${
                      isList
                        ? 'w-28 h-28 sm:w-44 sm:h-44 flex-shrink-0 rounded-xl'
                        : 'aspect-[4/5] w-full'
                    }`}
                  >
                    <img
                      src={product.images[0] ?? '/placeholder.svg'}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                    <div className="absolute top-2 right-2 z-10 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity">
                      <WishlistButton productId={product._id} size="sm" />
                    </div>
                  </div>

                  <div
                    className={`flex flex-col min-w-0 ${
                      isList ? 'flex-1 py-1' : 'p-3 sm:p-4 flex-1'
                    }`}
                  >
                    <h3
                      className={`font-semibold text-slate-900 line-clamp-2 leading-snug ${
                        isList ? 'text-base sm:text-xl' : 'text-sm sm:text-[15px] min-h-[2.6em]'
                      }`}
                    >
                      {product.name}
                    </h3>

                    {product.description && isList && (
                      <p className="hidden sm:block text-sm text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                        {product.description}
                      </p>
                    )}

                    <div className="mt-auto pt-2 flex items-center justify-between gap-2">
                      <p
                        className={`font-extrabold text-slate-900 ${
                          isList ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'
                        }`}
                      >
                        ₹{product.basePrice.toLocaleString('en-IN')}
                      </p>
                      <span
                        className="hidden sm:inline-flex items-center justify-center rounded-full text-xs font-semibold px-3 py-1.5 transition-colors group-hover:text-white"
                        style={{ color: primaryColor, backgroundColor: `${primaryColor}14` }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = primaryColor;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = `${primaryColor}14`;
                        }}
                      >
                        View
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

/* ---------- Small components ---------- */

const Chip = ({
  label,
  active,
  color,
  onClick,
  small,
}: {
  label: string;
  active: boolean;
  color: string;
  onClick: () => void;
  small?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`whitespace-nowrap rounded-full border font-medium transition-colors ${
      small ? 'text-xs px-3 py-1.5' : 'text-sm px-4 py-2'
    } ${active ? 'text-white border-transparent shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
    style={active ? { backgroundColor: color } : undefined}
  >
    {label}
  </button>
);

/* ---------- Helpers ---------- */

function findCategoryBySlug(
  categories: CategoryWithChildren[],
  slug: string
): CategoryWithChildren | null {
  for (const cat of categories) {
    if (cat.slug === slug) return cat;
    if (cat.children) {
      for (const child of cat.children) {
        if (child.slug === slug) return child as CategoryWithChildren;
      }
    }
  }
  return null;
}

function findCategoryById(
  categories: CategoryWithChildren[],
  id: string
): CategoryWithChildren | null {
  for (const cat of categories) {
    if (cat._id === id) return cat;
    if (cat.children) {
      for (const child of cat.children) {
        if (child._id === id) return child as CategoryWithChildren;
      }
    }
  }
  return null;
}