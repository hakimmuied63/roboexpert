import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowRight, Search, ShoppingBag, Package } from 'lucide-react';
import { fetchBuyerOrders, type BuyerOrder } from '../../lib/api';
import { LoadingSpinner, EmptyState } from '../../components/ui';
import toast from 'react-hot-toast';

gsap.registerPlugin(useGSAP);

const fmt = (n: number) => n.toLocaleString('en-IN');
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const STATUS_STYLES: Record<string, string> = {
  placed: 'border-[#dcdbd2] bg-[#f4f5ee] text-[#555951]',
  confirmed: 'border-[#d6e6b4] bg-[#eff4e5] text-[#4d5f33]',
  shipped: 'border-[#1d211a] bg-[#1d211a] text-white',
  delivered: 'border-[#c9f06b] bg-[#c9f06b] text-[#1d211a]',
  cancelled: 'border-red-200 bg-red-50 text-red-700',
};

function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${
        STATUS_STYLES[status.toLowerCase()] ?? 'border-[#dcdbd2] bg-[#f4f5ee] text-[#555951]'
      }`}
    >
      {cap(status)}
    </span>
  );
}

export function BuyerOrders() {
  const navigate = useNavigate();
  const root = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [orders, setOrders] = useState<BuyerOrder[]>([]);

  useGSAP(() => {
    gsap.from('.bo-word', { yPercent: 120, duration: 1, stagger: 0.08, ease: 'expo.out' });
    gsap.from('.bo-fade', { y: 24, opacity: 0, duration: 0.9, stagger: 0.1, delay: 0.2 });
  }, { scope: root });

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast.error('Enter your email address'); return; }
    setLoading(true);
    const data = await fetchBuyerOrders(email.trim().toLowerCase());
    setOrders(data);
    setSearched(true);
    setLoading(false);
    if (data.length === 0) {
      toast.error('No orders found for this email');
    }
  };

  if (loading) return <LoadingSpinner className="min-h-[50vh]" />;

  return (
    <div ref={root} className="min-h-screen bg-[#faf9f6] pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16">
        {/* Header */}
        <div className="mb-10">
          <p className="bo-fade text-[10px] font-bold uppercase tracking-[0.22em] text-[#7d8c60] mb-2">Order history</p>
          <h1 className="font-serif text-5xl sm:text-6xl font-medium tracking-[-0.055em] text-[#20221d]">
            {['My', 'orders.'].map((w, i) => (
              <span key={i} className="-mb-[0.12em] mr-[0.22em] inline-block overflow-hidden pb-[0.12em] align-top">
                <span className="bo-word inline-block">{w}</span>
              </span>
            ))}
          </h1>
          <p className="bo-fade mt-5 max-w-md text-sm leading-7 text-[#555951]">
            Enter the email you used at checkout to find all your orders.
          </p>
        </div>

        {/* Email Lookup */}
        <form onSubmit={handleLookup} className="bo-fade bg-white rounded-3xl border border-[#e5e4dc] p-6 sm:p-8 mb-10">
          <label className="block">
            <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[#7d8c60] mb-2">Email address</span>
            <div className="flex gap-3 flex-col sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 h-12 px-4 rounded-2xl border border-[#dcdbd2] bg-white text-sm focus:outline-none focus:border-[#1d211a]"
              />
              <button
                type="submit"
                className="group flex h-12 items-center justify-between gap-6 bg-[#1d211a] text-white rounded-full pl-6 pr-2 text-sm font-semibold hover:bg-[#343a2d] transition-colors"
              >
                Find my orders
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c9f06b] text-[#1d211a]">
                  <Search className="w-4 h-4" />
                </span>
              </button>
            </div>
          </label>
        </form>

        {/* Results */}
        {searched && orders.length === 0 && (
          <div className="bg-white rounded-3xl border border-[#e5e4dc] p-12 text-center">
            <ShoppingBag className="w-12 h-12 text-[#c3c3ba] mx-auto mb-4" />
            <h2 className="font-serif text-2xl font-medium text-[#20221d] mb-2">No orders found</h2>
            <p className="text-sm text-[#85877e]">Try a different email address or check your spelling.</p>
          </div>
        )}

        {orders.length > 0 && (
          <div className="space-y-5">
            <p className="text-sm text-[#85877e] mb-4">{orders.length} {orders.length === 1 ? 'order' : 'orders'} found</p>
            {orders.map((order) => (
              <div key={order._id} className="bo-card bg-white rounded-3xl border border-[#e5e4dc] overflow-hidden">
                {/* Header */}
                <div className="bg-[#f4f5ee] px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-[#e5e4dc]">
                  <div className="flex gap-8 flex-wrap text-sm">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7d8c60]">Order #</p>
                      <p className="font-mono font-semibold text-[#20221d] mt-0.5">{order.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7d8c60]">Placed</p>
                      <p className="font-semibold text-[#20221d] mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7d8c60]">Total</p>
                      <p className="font-semibold text-[#20221d] mt-0.5">₹{fmt(order.total)}</p>
                    </div>
                  </div>
                  <StatusPill status={order.status} />
                </div>

                {/* Items */}
                <div className="px-6 py-5 space-y-3">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item._id} className="flex items-center gap-4">
                      <img
                        src={item.productSnapshot.image ?? '/placeholder.svg'}
                        alt={item.productSnapshot.name}
                        className="w-16 h-16 rounded-xl object-cover border border-[#e5e4dc]"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                      />
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${item.productId}`} className="text-sm font-semibold text-[#20221d] hover:underline line-clamp-1">
                          {item.productSnapshot.name}
                        </Link>
                        <p className="text-xs text-[#85877e] mt-0.5">Qty {item.quantity} × ₹{fmt(item.unitPrice)}</p>
                      </div>
                      <p className="text-sm font-semibold text-[#20221d]">₹{fmt(item.lineTotal)}</p>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-xs text-[#85877e]">+{order.items.length - 3} more items</p>
                  )}
                </div>

                {/* Actions */}
                <div className="px-6 py-4 border-t border-[#e5e4dc] flex flex-wrap justify-end gap-3">
                  <Link
                    to={`/track-order?order=${order.orderNumber}&email=${encodeURIComponent(order.buyer.email)}`}
                    className="group inline-flex h-10 items-center gap-2 rounded-full bg-[#1d211a] px-5 text-xs font-semibold text-white hover:bg-[#343a2d] transition-colors"
                  >
                    Track order
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}