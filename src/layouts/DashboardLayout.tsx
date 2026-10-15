import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, Store } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { ApprovalBanner } from '../components/seller/ApprovalBanner';

type DashboardType = 'seller' | 'admin';

type Props = {
  type: DashboardType;
};

export function DashboardLayout({ type }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const panelLabel = type === 'seller' ? 'Seller Panel' : 'Admin Panel';

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  return (
    <div className="flex min-h-dvh flex-col bg-surface-50 lg:flex-row">
      <header className="lg:hidden sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-white px-4">
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-surface-700 hover:bg-surface-100 cursor-pointer"
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="w-5 h-5" aria-hidden />
        </button>
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-600">
            <Store className="h-4 w-4 text-white" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-surface-900">
              roboexpert<span className="text-primary-600">.in</span>
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-surface-600">
              {panelLabel}
            </p>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={panelLabel}
            className="relative z-10 flex h-full w-72 max-w-[85vw] flex-col bg-white shadow-xl"
            style={{ animation: 'dash-drawer-in 180ms ease-out' }}
          >
            <Sidebar type={type} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <aside
        className="sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-surface-200 bg-white lg:flex"
      >
        <Sidebar type={type} collapsible />
      </aside>

      <main className="min-w-0 flex-1 overflow-x-hidden">
        {type === 'seller' && <ApprovalBanner />}
        <Outlet />
      </main>
    </div>
  );
}
