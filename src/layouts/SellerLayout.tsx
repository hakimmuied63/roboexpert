import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';

export function SellerLayout() {
  return (
    <div className="flex min-h-screen bg-surface-50">
      <Sidebar type="seller" />
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
