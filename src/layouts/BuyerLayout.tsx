import { Outlet, useLocation } from 'react-router-dom';
import { AnnouncementBar } from '../components/layout/AnnouncementBar';
import { Header } from '../components/layout/Header';
import { CategoryStrip } from '../components/layout/CategoryStrip';
import { Footer } from '../components/layout/Footer';
import { ChatWidget } from '../components/chat/ChatWidget';
import { LeadPopup } from '../components/lead/LeadPopup';
import { useMarketplaceCategories } from '../hooks/useMarketplaceCategories';

export function BuyerLayout() {
  const { categories } = useMarketplaceCategories();
  const location = useLocation();
  const isStorefront = location.pathname.startsWith('/shop/');

  return (
    <div className="min-h-screen flex flex-col bg-surface-50">
      <AnnouncementBar />
      <div className="sticky top-0 z-40">
        <Header categories={categories} />
        {!isStorefront && <CategoryStrip categories={categories} />}
      </div>
      <main className="flex-1">
        <Outlet context={{ categories }} />
      </main>
      <Footer />
      <ChatWidget />
      <LeadPopup />
    </div>
  );
}
