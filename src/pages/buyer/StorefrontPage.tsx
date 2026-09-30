import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { WishlistButton } from '../../components/wishlist/WishlistButton';
import {
  fetchCompanyProducts,
  fetchCompanyCategories,
  fetchProductsByCompanyCategory,
  type CatalogResponse,
  type Category,
  type Product,
} from '../../lib/api';

type CategoryWithChildren = Category & {
  children?: Category[];
};

export const StorefrontPage = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const categorySlug = searchParams.get('category');
  const searchQuery = searchParams.get('q') ?? '';

  const [data, setData] = useState<CatalogResponse | null>(null);
  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

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

      const [catalogResult, categoriesResult] = await Promise.all([
        fetchCompanyProducts(companyId),
        fetchCompanyCategories(companyId),
      ]);

      if (!catalogResult || !catalogResult.ok) {
        setError('Store not found');
        setLoading(false);
        return;
      }

      setData(catalogResult);
      setCategories(categoriesResult as CategoryWithChildren[]);
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      params.set('q', searchInput.trim());
    } else {
      params.delete('q');
    }
    setSearchParams(params);
  };

  const handleCategoryClick = (slug: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (slug) {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    params.delete('q');
    setSearchParams(params);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading store...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Store not found</h1>
          <p className="text-gray-600 mb-6">
            The store you're looking for doesn't exist or is no longer active.
          </p>
          <Link
            to="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const currentCategory = categorySlug
    ? findCategoryBySlug(categories, categorySlug)
    : null;

  const breadcrumbs: { name: string; slug: string }[] = [];
  if (currentCategory) {
    if (currentCategory.parentId) {
      const parent = findCategoryById(categories, currentCategory.parentId);
      if (parent) {
        breadcrumbs.push({ name: parent.name, slug: parent.slug });
      }
    }
    breadcrumbs.push({ name: currentCategory.name, slug: currentCategory.slug });
  }

  const productsToShow = (() => {
    let list: Product[];
    if (filteredProducts !== null) {
      list = filteredProducts;
    } else {
      list = data.products;
    }
    if (searchQuery) {
      list = list.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return list;
  })();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Store header */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Store</p>
        <h1 className="text-2xl font-bold text-gray-900">{data.company.name}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {productsToShow.length} {productsToShow.length === 1 ? 'product' : 'products'}
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearchSubmit} className="mb-4">
        <div className="flex gap-2 max-w-md">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search in this store..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-sm font-medium"
          >
            Search
          </button>
        </div>
      </form>

      {/* Category nav with hover dropdowns */}
      <div className="border-b border-gray-200 mb-6 relative z-20">
        <div className="flex items-center gap-1 pb-2 -mb-px">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`relative px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
              !categorySlug
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-700 border-transparent hover:text-blue-600'
            }`}
          >
            All
          </button>

          {categories.map((cat) => {
            const hasChildren = cat.children && cat.children.length > 0;
            const isActive =
              categorySlug === cat.slug ||
              (currentCategory?.parentId &&
                findCategoryById(categories, currentCategory.parentId)?.slug === cat.slug);

            return (
              <div
                key={cat._id}
                className="relative"
                onMouseEnter={() => setHoveredCategory(cat._id)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <button
                  onClick={() => handleCategoryClick(cat.slug)}
                  className={`relative px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 flex items-center gap-1 ${
                    isActive
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-700 border-transparent hover:text-blue-600'
                  }`}
                >
                  {cat.name}
                  {hasChildren && (
                    <ChevronRight className="w-3 h-3 rotate-90 opacity-60" />
                  )}
                </button>

                {hasChildren && hoveredCategory === cat._id && (
                  <div
                    className="absolute top-full left-0 mt-0 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50 min-w-[180px]"
                    onMouseEnter={() => setHoveredCategory(cat._id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    {cat.children!.map((sub) => (
                      <button
                        key={sub._id}
                        onClick={() => handleCategoryClick(sub.slug)}
                        className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                          categorySlug === sub.slug
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-sm mb-4">
          <button
            onClick={() => handleCategoryClick(null)}
            className="text-gray-500 hover:text-blue-600 transition-colors"
          >
            All
          </button>
          {breadcrumbs.map((crumb) => (
            <span key={crumb.slug} className="flex items-center gap-1">
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <button
                onClick={() => handleCategoryClick(crumb.slug)}
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                {crumb.name}
              </button>
            </span>
          ))}
        </nav>
      )}

      {/* Products */}
      {productsToShow.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">
            {categorySlug
              ? 'No products in this category yet.'
              : searchQuery
              ? `No products matching "${searchQuery}".`
              : 'No products available yet.'}
          </p>
          {(categorySlug || searchQuery) && (
            <button
              onClick={() => handleCategoryClick(null)}
              className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              View all products
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {productsToShow.map((product) => (
            <Link
              key={product._id}
              to={`/product/${product._id}`}
              className="group bg-white border border-gray-200 rounded-md overflow-hidden hover:shadow-md transition-all"
            >
              <div className="relative aspect-square bg-gray-100 overflow-hidden">
                <img
                  src={product.images[0] ?? 'https://via.placeholder.com/400'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://via.placeholder.com/400?text=No+Image';
                  }}
                />
                <div className="absolute top-2 right-2 z-10">
                  <WishlistButton productId={product._id} size="sm" />
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 min-h-[2.5em]">
                  {product.name}
                </h3>
                <p className="text-base font-bold text-gray-900">
                  ₹{product.basePrice.toLocaleString('en-IN')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

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