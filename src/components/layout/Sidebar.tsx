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
  Menu,
  Users,
  ListChecks,
  BarChart3,
  Tag,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarLink {
  to: string;
  icon: React.ReactNode;
  label: string;
}

interface SidebarProps {
  type: 'seller' | 'admin';
}

const sellerLinks: SidebarLink[] = [
  { to: '/seller', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Overview' },
  { to: '/seller/products', icon: <Package className="w-5 h-5" />, label: 'Products' },
  { to: '/seller/categories', icon: <Tag className="w-5 h-5" />, label: 'Categories' },
  { to: '/seller/orders', icon: <ShoppingBag className="w-5 h-5" />, label: 'Orders' },
  { to: '/seller/payments', icon: <CreditCard className="w-5 h-5" />, label: 'Payments' },
  { to: '/seller/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
];

const adminLinks: SidebarLink[] = [
  { to: '/admin', icon: <BarChart3 className="w-5 h-5" />, label: 'Overview' },
  { to: '/admin/listings', icon: <Package className="w-5 h-5" />, label: 'Listings' },
  { to: '/admin/orders', icon: <ListChecks className="w-5 h-5" />, label: 'Orders' },
  { to: '/admin/sellers', icon: <Users className="w-5 h-5" />, label: 'Sellers' },
  { to: '/admin/users', icon: <Users className="w-5 h-5" />, label: 'Users' },
];
export function Sidebar({ type }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = type === 'seller' ? sellerLinks : adminLinks;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-surface-200">
        <div className={`flex items-center gap-2 ${collapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
            <Store className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-bold text-surface-900">
                roboexpert<span className="text-primary-600">.in</span>
              </p>
              <p className="text-[10px] text-surface-400 uppercase tracking-wider">
                {type === 'seller' ? 'Seller Panel' : 'Admin Panel'}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 transition-colors cursor-pointer"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* User info */}
      {!collapsed && user && (
        <div className="p-4 border-b border-surface-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            <span className="text-sm font-medium text-primary-600">
              {user.name.charAt(0)}
             </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-surface-900 truncate">{user.name}</p>
              <p className="text-xs text-surface-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/seller' || link.to === '/admin'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              transition-all duration-200
              ${collapsed ? 'justify-center' : ''}
              ${isActive
                ? 'bg-primary-50 text-primary-700'
                : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'}
            `}
            title={collapsed ? link.label : undefined}
          >
            {link.icon}
            {!collapsed && <span>{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-surface-200">
        <button
          onClick={handleLogout}
          className={`
            flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium
            text-surface-600 hover:bg-danger-50 hover:text-danger-600 transition-colors
            cursor-pointer
            ${collapsed ? 'justify-center' : ''}
          `}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <button
        className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-surface-200 cursor-pointer"
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu className="w-5 h-5 text-surface-700" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-72 h-full bg-white shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={`
          hidden lg:flex flex-col h-screen bg-white border-r border-surface-200
          transition-all duration-300 sticky top-0
          ${collapsed ? 'w-[72px]' : 'w-64'}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
