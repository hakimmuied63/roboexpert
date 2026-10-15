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
      <div className="flex items-center rounded-full border border-[#E6E6F0] bg-[#F4F3FB]/80 hover:bg-[#F4F3FB] focus-within:bg-white focus-within:border-[#4F46FF] focus-within:ring-2 focus-within:ring-[#4F46FF]/15 transition-all duration-200 overflow-hidden p-1 pl-3 sm:pl-4">
        {categories.length > 0 && (
          <div className="hidden md:flex items-center shrink-0">
            <label className="sr-only" htmlFor="header-search-category">
              Search in category
            </label>
            <select
              id="header-search-category"
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="max-w-[8.5rem] shrink-0 bg-transparent text-xs font-semibold text-[#14122B] border-0 border-r border-[#E6E6F0] pr-2 py-2 cursor-pointer focus:outline-none focus:ring-0"
            >
              <option value="">All Categories</option>
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
          placeholder="Search products"
          className="w-full min-w-0 pl-2.5 pr-2 py-1.5 sm:py-2 bg-transparent text-sm text-[#14122B] placeholder:text-surface-600 focus:outline-none"
          aria-label="Search products"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-1.5 tap-target px-3 sm:px-5 rounded-full bg-gradient-to-r from-[#4F46FF] to-[#7A5CFF] text-white text-xs sm:text-sm font-semibold shadow-[0_4px_12px_rgba(79,70,255,0.25)] hover:shadow-[0_6px_16px_rgba(79,70,255,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all shrink-0 cursor-pointer"
          aria-label="Search"
        >
          <Search className="w-3.5 h-3.5" aria-hidden />
          <span className="hidden sm:inline">Search</span>
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

  const iconBtn =
    'relative inline-flex items-center justify-center tap-target rounded-full text-[#14122B] hover:bg-[#F4F3FB] hover:text-[#4F46FF] transition-all duration-200';

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-[#E6E6F0] shadow-[0_4px_25px_rgba(79,70,255,0.06)] relative z-40">
      <div className="page-wrap">
        <div className="flex flex-nowrap items-center gap-1 sm:gap-3 h-16 max-h-16">
          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center tap-target rounded-full text-[#14122B] hover:bg-[#F4F3FB] shrink-0 cursor-pointer"
            aria-label={navOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={navOpen}
            onClick={() => setNavOpen((open) => !open)}
          >
            {navOpen ? <X className="w-5 h-5" aria-hidden /> : <Menu className="w-5 h-5" aria-hidden />}
          </button>

          <Link to="/" className="flex items-center gap-2 shrink-0 min-w-0 group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-tr from-[#4F46FF] to-[#7A5CFF] flex items-center justify-center text-white shadow-[0_4px_14px_rgba(79,70,255,0.35)] group-hover:shadow-[0_6px_18px_rgba(79,70,255,0.45)] transition-all">
              <Store className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden />
            </div>
            <span className="hidden min-[380px]:inline text-base sm:text-xl font-extrabold tracking-tight font-display text-[#14122B] truncate">
              roboexpert<span className="hidden sm:inline text-[#4F46FF]">.in</span>
            </span>
          </Link>

          {!isStorefront && (
            <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-2xl min-w-0">
              {searchField}
            </form>
          )}

          <div className="flex items-center gap-0 sm:gap-1 ml-auto shrink-0">
            <Link to="/wishlist" className={iconBtn} aria-label="Wishlist">
              <Heart className="w-5 h-5" aria-hidden />
              {wishlistItems.length > 0 && (
                <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-gradient-to-r from-[#FF6A2B] to-[#FF8A3D] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistItems.length > 9 ? '9+' : wishlistItems.length}
                </span>
              )}
            </Link>

            <Link to="/cart" className={iconBtn} aria-label="Shopping cart">
              <ShoppingCart className="w-5 h-5" aria-hidden />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-gradient-to-r from-[#4F46FF] to-[#7A5CFF] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center justify-center gap-2 tap-target rounded-full hover:bg-[#F4F3FB] transition-all duration-200 cursor-pointer"
                  aria-label="Account menu"
                  aria-expanded={userMenuOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4F46FF]/15 to-[#7A5CFF]/15 text-[#4F46FF] flex items-center justify-center font-bold text-xs">
                    {user.name?.charAt(0).toUpperCase() || <User className="w-4 h-4 text-[#4F46FF]" />}
                  </div>
                  <span className="hidden lg:block text-sm font-semibold text-[#14122B]">
                    {user.name}
                  </span>
                  <ChevronDown className="hidden lg:block w-4 h-4 text-surface-600" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-[#E6E6F0] shadow-card-hover py-1.5 z-50">
                    <div className="px-4 py-3 border-b border-[#E6E6F0]">
                      <p className="text-sm font-bold text-[#14122B] font-display">{user.name}</p>
                      <p className="text-xs text-surface-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1.5 px-2.5 py-0.5 text-[10px] font-bold bg-[#EEF0FF] text-[#4F46FF] rounded-full uppercase tracking-wider">
                        {user.role}
                      </span>
                    </div>

                    {user.role === 'seller' && (
                      <Link
                        to="/seller"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#14122B] hover:bg-[#F4F3FB] hover:text-[#4F46FF] transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Seller Dashboard
                      </Link>
                    )}

                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#14122B] hover:bg-[#F4F3FB] hover:text-[#4F46FF] transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-danger-600 hover:bg-danger-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-0 sm:gap-1">
                <Link
                  to="/login"
                  className="hidden sm:inline-flex min-h-11 items-center px-4 py-2 text-sm font-semibold text-[#14122B] hover:text-[#4F46FF] hover:bg-[#F4F3FB] rounded-full transition-all duration-200"
                >
                  Log In
                </Link>
                <Link to="/login" className={`sm:hidden ${iconBtn}`} aria-label="Account">
                  <User className="w-5 h-5" aria-hidden />
                </Link>
                <Link
                  to="/seller/signup"
                  className="inline-flex items-center justify-center tap-target sm:min-w-0 sm:px-5 rounded-full text-white bg-gradient-to-r from-[#FF6A2B] to-[#FF8A3D] shadow-[0_4px_14px_rgba(255,106,43,0.3)] hover:shadow-[0_8px_22px_rgba(255,106,43,0.4)] transition-all duration-200"
                  aria-label="Sell"
                >
                  <Store className="w-4 h-4" aria-hidden />
                  <span className="hidden sm:inline text-sm font-bold ml-1.5">Sell</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {!isStorefront && (
        <div className="md:hidden border-t border-[#E6E6F0] py-2">
          <form onSubmit={handleSearch} className="page-wrap">
            {searchField}
          </form>
        </div>
      )}

      {navOpen && (
        <div className="lg:hidden border-t border-[#E6E6F0] bg-white">
          <nav className="page-wrap py-3 flex flex-col gap-1" aria-label="Mobile menu">
            <Link
              to="/search"
              onClick={() => setNavOpen(false)}
              className="flex items-center gap-3 min-h-11 px-2 rounded-xl text-sm font-semibold text-[#14122B] hover:bg-[#F4F3FB]"
            >
              <Search className="w-4 h-4 text-[#4F46FF]" aria-hidden />
              Browse products
            </Link>
            <Link
              to="/track-order"
              onClick={() => setNavOpen(false)}
              className="flex items-center gap-3 min-h-11 px-2 rounded-xl text-sm font-semibold text-[#14122B] hover:bg-[#F4F3FB]"
            >
              <Package className="w-4 h-4 text-[#4F46FF]" aria-hidden />
              Track order
            </Link>
            <Link
              to="/seller/signup"
              onClick={() => setNavOpen(false)}
              className="flex items-center gap-3 min-h-11 px-2 rounded-xl text-sm font-semibold text-[#14122B] hover:bg-[#F4F3FB]"
            >
              <Store className="w-4 h-4 text-[#FF6A2B]" aria-hidden />
              Sell on Roboexpert
            </Link>
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat._id}
                to={`/category/${cat.slug}`}
                onClick={() => setNavOpen(false)}
                className="flex items-center min-h-11 px-2 rounded-xl text-sm font-medium text-surface-700 hover:bg-[#F4F3FB]"
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

export { Header as Navbar };
