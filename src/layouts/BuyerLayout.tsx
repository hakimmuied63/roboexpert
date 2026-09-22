import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import ZigzagDivider from '../components/ZigzagDivider';

export function BuyerLayout() {
  const location = useLocation();
  const hideZigzag = ['/seller', '/admin', '/login', '/signup', '/checkout'].some(path => location.pathname.startsWith(path));

  return (
    <div className="min-h-screen flex flex-col bg-surface-50">
      <Navbar />
      {!hideZigzag && (
        <ZigzagDivider teeth={26} depthPct={60} strokeWidth={3} color="#2563eb" />
      )}
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
