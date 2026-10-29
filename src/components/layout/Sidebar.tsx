import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  CreditCard,
  Settings,
  LogOut,
  Store,
  ChevronLeft,
  Users,
  ListChecks,
  BarChart3,
  Tag,
  UserPlus,
  Flag,
  MessageSquare,
  Palette,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchAdminSellers } from '../../lib/api';

interface SidebarLink {
  to: string;
  icon: React.ReactNode;
  label: string;
  badgeKey?: 'pendingSellers';
}

interface SidebarProps {
  type: 'seller' | 'admin';
  collapsible?: boolean;
  onNavigate?: () => void;
}

const sellerLinks: SidebarLink[] = [
  { to: '/seller', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Overview' },
  { to: '/seller/design', icon: <Palette className="w-5 h-5" />, label: 'Store Design' },
  { to: '/seller/products', icon: <Package className="w-5 h-5" />, label: 'Products' },
  { to: '/seller/categories', icon: <Tag className="w-5 h-5" />, label: 'Categories' },
  { to: '/seller/orders', icon: <ShoppingBag className="w-5 h-5" />, label: 'Orders' },
  { to: '/seller/coupons', icon: <Tag className="w-5 h-5" />, label: 'Coupons' },
  { to: '/seller/reviews', icon: <MessageSquare className="w-5 h-5" />, label: 'Reviews' },
  { to: '/seller/payments', icon: <CreditCard className="w-5 h-5" />, label: 'Payments' },
  { to: '/seller/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
];

const adminLinks: SidebarLink[] = [
  { to: '/admin', icon: <BarChart3 className="w-5 h-5" />, label: 'Overview' },
  { to: '/admin/listings', icon: <Package className="w-5 h-5" />, label: 'Listings' },
  { to: '/admin/orders', icon: <ListChecks className="w-5 h-5" />, label: 'Orders' },
  { to: '/admin/sellers', icon: <Users className="w-5 h-5" />, label: 'Sellers', badgeKey: 'pendingSellers' },
  { to: '/admin/users', icon: <Users className="w-5 h-5" />, label: 'Users' },
  { to: '/admin/categories', icon: <Tag className="w-5 h-5" />, label: 'Packaging' },
  { to: '/admin/leads', icon: <UserPlus className="w-5 h-5" />, label: 'Leads' },
  { to: '/admin/reviews', icon: <Flag className="w-5 h-5" />, label: 'Reported Reviews' },
];

export function Sidebar({ type, collapsible = false, onNavigate }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [pendingSellersCount, setPendingSellersCount] = useState(0);

  const isCollapsed = collapsible && collapsed;
  const links = type === 'seller' ? sellerLinks : adminLinks;

  useEffect(() => {
    if (type !== 'admin') return;

    const loadCount = async () => {
      const sellers = await fetchAdminSellers('pending');
      setPendingSellersCount(sellers.length);
    };

    loadCount();
    const interval = setInterval(loadCount, 60000);
    return () => clearInterval(interval);
  }, [type]);

  const handleLogout = () => {
    onNavigate?.();
    logout();
    navigate('/');
  };

  return (
    <div className={`flex h-full flex-col ${isCollapsed ? 'w-[72px]' : 'w-72 lg:w-64'}`}>
      <div className="flex items-center justify-between p-4 border-b border-surface-200">
        <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
            <Store className="w-5 h-5 text-white" aria-hidden />
          </div>
          {!isCollapsed && (
            <div>
              <p className="text-sm font-bold text-surface-900">
                roboexpert<span className="text-primary-600">.in</span>
              </p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-surface-600">
                {type === 'seller' ? 'Seller Panel' : 'Admin Panel'}
              </p>
            </div>
          )}
        </div>
        {collapsible && (
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-surface-600 hover:bg-surface-100 transition-colors cursor-pointer"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {!isCollapsed && user && (
        <div className="p-4 border-b border-surface-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              <span className="text-sm font-medium text-primary-600">
                {user.name.charAt(0)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-surface-900 truncate">{user.name}</p>
              <p className="text-xs text-surface-600 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Dashboard">
        {links.map((link) => {
          const showBadge = link.badgeKey === 'pendingSellers' && pendingSellersCount > 0;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/seller' || link.to === '/admin'}
              onClick={() => onNavigate?.()}
              className={({ isActive }) => `
                relative flex items-center gap-3 min-h-11 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-200
                ${isCollapsed ? 'justify-center' : ''}
                ${isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'}
              `}
              title={isCollapsed ? link.label : undefined}
            >
              <span className="relative">
                {link.icon}
                {isCollapsed && showBadge && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-danger-500 ring-2 ring-white" />
                )}
              </span>

              {!isCollapsed && (
                <>
                  <span className="flex-1">{link.label}</span>
                  {showBadge && (
                    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-danger-500 text-white text-[11px] font-bold">
                      {pendingSellersCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-surface-200">
        <button
          type="button"
          onClick={handleLogout}
          className={`
            flex items-center gap-3 w-full min-h-11 px-3 py-2.5 rounded-lg text-sm font-medium
            text-surface-600 hover:bg-danger-50 hover:text-danger-600 transition-colors
            cursor-pointer
            ${isCollapsed ? 'justify-center' : ''}
          `}
          title={isCollapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );
}