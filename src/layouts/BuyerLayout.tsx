import { Outlet } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { ChatWidget } from '../components/chat/ChatWidget';
import { LeadPopup } from '../components/lead/LeadPopup';
import { useMarketplaceCategories } from '../hooks/useMarketplaceCategories';

export function BuyerLayout() {
  const { categories } = useMarketplaceCategories();

  return (
    <div className="min-h-screen flex flex-col bg-[#eaeded] text-slate-900">
           <div className="sticky top-0 z-[100]">
        <Header categories={categories} />
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
