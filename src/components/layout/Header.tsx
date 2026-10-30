import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  User,
  LogOut,
  LayoutDashboard,
  Store,
  ChevronDown,
  Heart,
  Menu,
  X,
  Package,
} from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useDebounce } from '../../hooks/useDebounce';
import { SearchDropdown } from '../search/SearchDropdown';
import { searchProducts as searchProductsApi, type Category, type Product } from '../../lib/api';

const RECENT_SEARCHES_KEY = 'roboexpert_recent_searches';

type Props = {
  categories?: Category[];
};

export function Header({ categories = [] }: Props) {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const isStorefront = location.pathname.startsWith('/shop/');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(searchQuery, 400);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setUserMenuOpen(false);
        setNavOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

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
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (trimmed.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    let cancelled = false;
    setSearchLoading(true);

    searchProductsApi(trimmed)
      .then((res) => {
        if (!cancelled) setSearchResults(res.slice(0, 6));
      })
      .finally(() => {
        if (!cancelled) setSearchLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const addRecentSearch = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter(
        (t) => t.toLowerCase() !== trimmed.toLowerCase()
      );
      const next = [trimmed, ...filtered].slice(0, 5);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  }, []);

  const submitSearch = (query: string) => {
    const trimmed = query.trim();
    if (trimmed) {
      addRecentSearch(trimmed);
      setDropdownOpen(false);
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
      setSearchQuery('');
      return;
    }
    if (searchCategory) {
      setDropdownOpen(false);
      navigate(`/category/${searchCategory}`);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    submitSearch(searchQuery);
  };

  const handleSeeAll = () => submitSearch(searchQuery);

  const handlePickRecent = (term: string) => {
    setSearchQuery(term);
    addRecentSearch(term);
    setDropdownOpen(true);
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const searchField = (
    <div className="relative w-full" ref={searchContainerRef}>
      <div className="flex items-center rounded-md bg-white border-2 border-transparent focus-within:border-[#f3a847] transition-all overflow-hidden h-10 shadow-sm">
        {categories.length > 0 && (
          <div className="hidden lg:flex items-center shrink-0 bg-slate-100 hover:bg-slate-200 border-r border-slate-300 transition-colors h-full px-2.5">
            <label className="sr-only" htmlFor="header-search-category">
              Search in category
            </label>
            <select
              id="header-search-category"
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-800 cursor-pointer focus:outline-none pr-1"
            >
              <option value="">All</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setDropdownOpen(true);
          }}
          onFocus={() => setDropdownOpen(true)}
          placeholder="Search for products, brands and more..."
          className="w-full min-w-0 px-3 py-2 bg-transparent text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none"
          aria-label="Search products"
        />
        <button
          type="submit"
          className="h-full px-4 bg-[#febd69] hover:bg-[#f3a847] text-slate-900 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
          aria-label="Search"
        >
          <Search className="w-4 h-4 stroke-[2.5]" aria-hidden />
        </button>
      </div>
      {dropdownOpen && (
        <SearchDropdown
          query={searchQuery}
          results={searchResults}
          loading={searchLoading}
          recentSearches={recentSearches}
          onPickRecent={handlePickRecent}
          onClearRecent={clearRecentSearches}
          onSeeAll={handleSeeAll}
          onClose={() => setDropdownOpen(false)}
        />
      )}
    </div>
  );

  return (
    <header className="relative z-40 bg-[#131921] text-white">
      {/* Primary Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 sm:gap-6 h-16">
          {/* Mobile menu toggle */}
          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-slate-800 shrink-0 cursor-pointer"
            aria-label={navOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={navOpen}
            onClick={() => setNavOpen((open) => !open)}
          >
            {navOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 py-1 px-1 rounded hover:outline-1 hover:outline-white">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/10 flex items-center justify-center text-white border border-white/20">
              <Store className="w-4 h-4 sm:w-5 sm:h-5 text-[#febd69]" aria-hidden />
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Robo<span className="text-[#febd69]">Expert</span>
            </span>
          </Link>

          {/* Desktop Search Bar */}
          {!isStorefront && (
            <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-3xl min-w-0">
              {searchField}
            </form>
          )}

          {/* Right Header Navigation Items */}
          <div className="flex items-center gap-1 sm:gap-4 ml-auto shrink-0">
            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="hidden sm:flex flex-col items-center justify-center p-1.5 rounded hover:outline-1 hover:outline-white text-white relative text-left"
              aria-label="Wishlist"
            >
              <div className="relative">
                <Heart className="w-5 h-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 bg-[#febd69] text-slate-900 text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </div>
            </Link>

            {/* Account & Lists */}
            {isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex flex-col text-left py-1 px-2 rounded hover:outline-1 hover:outline-white cursor-pointer"
                  aria-label="Account menu"
                  aria-expanded={userMenuOpen}
                >
                  <span className="text-[11px] text-slate-300 leading-tight truncate max-w-[100px]">
                    Hello, {user.name.split(' ')[0]}
                  </span>
                  <span className="flex items-center gap-1 text-xs sm:text-sm font-bold text-white leading-tight">
                    Account & Lists
                    <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-lg border border-slate-200 shadow-xl py-2 z-50 text-slate-900">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-bold truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-800 rounded uppercase">
                        {user.role}
                      </span>
                    </div>

                    {user.role === 'seller' && (
                      <Link
                        to="/seller"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm font-medium hover:bg-slate-50 hover:text-amber-800 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-500" />
                        Seller Dashboard
                      </Link>
                    )}

                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm font-medium hover:bg-slate-50 hover:text-amber-800 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-500" />
                        Admin Panel
                      </Link>
                    )}

                    <Link
                      to="/track-order"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm font-medium hover:bg-slate-50 hover:text-amber-800 transition-colors"
                    >
                      <Package className="w-4 h-4 text-slate-500" />
                      Your Orders
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-4 py-2 text-xs sm:text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer border-t border-slate-100 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex flex-col text-left py-1 px-2 rounded hover:outline-1 hover:outline-white"
              >
                <span className="text-[11px] text-slate-300 leading-tight">Sign in</span>
                <span className="text-xs sm:text-sm font-bold text-white leading-tight">
                  Account & Lists
                </span>
              </Link>
            )}

            {/* Cart Link */}
            <Link
              to="/cart"
              className="flex items-center gap-1.5 py-1 px-2 rounded hover:outline-1 hover:outline-white text-white group"
              aria-label="Shopping cart"
            >
              <div className="relative">
                <ShoppingCart className="w-7 h-7" />
                <span className="absolute -top-1 left-3.5 min-w-4 h-4 px-1 bg-[#febd69] text-slate-900 text-[11px] font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              </div>
              <span className="hidden sm:inline text-xs sm:text-sm font-bold mt-1">Cart</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Search Row */}
      {!isStorefront && (
        <div className="md:hidden px-4 pb-2.5">
          <form onSubmit={handleSearch}>
            {searchField}
          </form>
        </div>
      )}
      
          {/* Secondary Sub-Navigation Bar */}
          {!isStorefront && (
      <div className="bg-[#232f3e] border-t border-slate-700/60">
       <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-xs sm:text-sm h-10">
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                      {/* All Categories Button & Dropdown */}
                      <div 
              className="relative shrink-0"
              onMouseEnter={() => setCategoriesOpen(true)}
              onMouseLeave={() => setCategoriesOpen(false)}
            >
              <button
                type="button"
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className="flex items-center gap-1.5 font-bold py-1 px-1.5 rounded hover:outline-1 hover:outline-white cursor-pointer"
              >
                <Menu className="w-4 h-4" />
                <span>All Categories</span>
              </button>

              {/* Dropdown Menu */}
              {categoriesOpen && (
                                <div className="absolute left-0 top-full mt-1 w-64 bg-white text-slate-900 rounded-lg shadow-2xl border border-slate-200 py-2 z-[110]">
                  <ul className="max-h-[70vh] overflow-y-auto">
                    {categories.map((cat) => (
                      <li key={cat._id}>
                        <Link
                          to={`/category/${cat.slug}`}
                          onClick={() => setCategoriesOpen(false)}
                          className="block px-4 py-2 text-sm hover:bg-slate-50 hover:text-amber-800 transition-colors"
                        >
                          {cat.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Link
              to="/search"
              className="py-1 px-1.5 rounded hover:outline-1 hover:outline-white text-slate-200 hover:text-white shrink-0 font-medium"
            >
              Today's Deals
            </Link>

            <Link
              to="/track-order"
              className="py-1 px-1.5 rounded hover:outline-1 hover:outline-white text-slate-200 hover:text-white shrink-0 font-medium"
            >
              Customer Service
            </Link>

            <Link
              to="/search"
              className="hidden sm:inline-block py-1 px-1.5 rounded hover:outline-1 hover:outline-white text-slate-200 hover:text-white shrink-0 font-medium"
            >
              Gift Cards
            </Link>

            <Link
              to="/seller/signup"
              className="py-1 px-1.5 rounded hover:outline-1 hover:outline-white text-slate-200 hover:text-white shrink-0 font-medium"
            >
              Sell on RoboExpert
            </Link>
          </div>

          {/* Right Side: Deliver to India */}
          <div className="hidden md:flex items-center gap-1.5 py-1 px-2 rounded hover:outline-1 hover:outline-white shrink-0 text-slate-300">
            <svg
              className="w-3.5 h-3.5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-xs font-medium text-white">Deliver to India</span>
          </div>
        </div>
      </div>
       )}

      {/* Mobile Drawer Menu */}
      {navOpen && (
        <div className="lg:hidden border-t border-slate-700 bg-[#232f3e] text-white">
          <nav className="px-4 py-3 flex flex-col gap-1 text-sm font-medium" aria-label="Mobile menu">
            <Link
              to="/search"
              onClick={() => setNavOpen(false)}
              className="flex items-center gap-2.5 py-2 px-2 rounded hover:bg-slate-700"
            >
              <Search className="w-4 h-4 text-[#febd69]" />
              Browse all products
            </Link>
            <Link
              to="/track-order"
              onClick={() => setNavOpen(false)}
              className="flex items-center gap-2.5 py-2 px-2 rounded hover:bg-slate-700"
            >
              <Package className="w-4 h-4 text-[#febd69]" />
              Track order
            </Link>
            <Link
              to="/seller/signup"
              onClick={() => setNavOpen(false)}
              className="flex items-center gap-2.5 py-2 px-2 rounded hover:bg-slate-700 text-[#febd69]"
            >
              <Store className="w-4 h-4" />
              Sell on RoboExpert
            </Link>
            <div className="border-t border-slate-700 my-1 pt-1">
              <p className="px-2 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Categories
              </p>
              {categories.slice(0, 8).map((cat) => (
                <Link
                  key={cat._id}
                  to={`/category/${cat.slug}`}
                  onClick={() => setNavOpen(false)}
                  className="block py-1.5 px-2 text-xs text-slate-300 hover:text-white hover:bg-slate-700 rounded"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export { Header as Navbar };
