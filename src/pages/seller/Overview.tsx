import { useEffect, useState } from 'react';
import {
  Package,
  ShoppingBag,
  DollarSign,
  ArrowUpRight,
  AlertTriangle,
  Copy,
  Check,
  Store,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/ui';
import {
  fetchSellerStats,
  fetchSellerOrders,
  fetchMyCompany,
  type SellerStats,
  type SellerOrder,
  type MyCompany,
} from '../../lib/api';
import toast from 'react-hot-toast';

const orderStatusLabels: Record<string, string> = {
  placed: 'Placed',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const orderStatusColors: Record<string, string> = {
  placed: 'bg-blue-50 text-blue-700',
  confirmed: 'bg-indigo-50 text-indigo-700',
  shipped: 'bg-purple-50 text-purple-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
};

export function SellerOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<SellerOrder[]>([]);
  const [company, setCompany] = useState<MyCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      const [s, o, c] = await Promise.all([
        fetchSellerStats(),
        fetchSellerOrders(),
        fetchMyCompany(),
      ]);
      setStats(s);
      setRecentOrders(o.slice(0, 5));
      setCompany(c);
      setLoading(false);
    }
    load();
  }, []);

  const shopNowUrl = company
    ? `${window.location.origin}/shop/${company._id}`
    : '';

  const handleCopy = async () => {
    if (!shopNowUrl) return;
    try {
      await navigator.clipboard.writeText(shopNowUrl);
      setCopied(true);
      toast.success('Shop Now URL copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy');
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!stats) {
    return (
      <div className="p-6 lg:p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="text-lg font-bold text-red-900">Could not load dashboard</h2>
          <p className="text-sm text-red-700 mt-1">
            Please make sure you're signed in and your account has a company.
          </p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Products',
      value: stats.totalProducts,
      icon: <Package className="w-5 h-5" />,
      color: 'bg-primary-50 text-primary-600',
    },
    {
      label: 'Active Orders',
      value: stats.pendingOrders,
      icon: <ShoppingBag className="w-5 h-5" />,
      color: 'bg-orange-50 text-orange-600',
    },
    {
      label: 'Total Revenue',
      value: `₹${stats.revenue.toLocaleString('en-IN')}`,
      icon: <DollarSign className="w-5 h-5" />,
      color: 'bg-success-50 text-success-600',
    },
    {
      label: 'Low Stock Variants',
      value: stats.lowStockVariants,
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'bg-warning-50 text-warning-600',
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Dashboard</h1>
        <p className="text-surface-500 mt-1">
          Welcome back, {user?.name}! Here's how your shop is doing.
        </p>
      </div>

      {/* Shop Now URL Card */}
      {company && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center text-white flex-shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-surface-900">Your Shop Now URL</h2>
              <p className="text-sm text-surface-600 mt-0.5">
                Share this link on your own website's "Shop Now" button.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white border border-primary-200 rounded-lg p-2 pl-4">
            <code className="flex-1 text-sm text-surface-700 truncate">{shopNowUrl}</code>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-md transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-surface-200 p-5 hover:shadow-md transition-shadow"
          >
            <div
              className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center`}
            >
              {card.icon}
            </div>
            <p className="mt-4 text-2xl font-bold text-surface-900">{card.value}</p>
            <p className="text-sm text-surface-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders by Status */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-surface-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-surface-900">Orders by Status</h2>
            <span className="text-sm text-surface-500">All time</span>
          </div>
          {stats.ordersByStatus.length === 0 ? (
            <div className="text-sm text-surface-500 py-8 text-center">
              No orders yet.
            </div>
          ) : (
            <div className="space-y-3">
              {stats.ordersByStatus.map((row) => (
                <div
                  key={row._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-surface-50"
                >
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      orderStatusColors[row._id] ?? 'bg-gray-50 text-gray-700'
                    }`}
                  >
                    {orderStatusLabels[row._id] ?? row._id}
                  </span>
                  <span className="text-sm font-bold text-surface-900">{row.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-surface-200 p-6">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/seller/products"
              className="flex items-center justify-between p-3 rounded-lg border border-surface-200 hover:bg-surface-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-surface-700">Add New Product</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-surface-400 group-hover:text-primary-600 transition-colors" />
            </Link>
            <Link
              to="/seller/orders"
              className="flex items-center justify-between p-3 rounded-lg border border-surface-200 hover:bg-surface-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-surface-700">View Orders</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-surface-400 group-hover:text-primary-600 transition-colors" />
            </Link>
            <Link
              to="/seller/payments"
              className="flex items-center justify-between p-3 rounded-lg border border-surface-200 hover:bg-surface-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-success-50 text-success-600 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-surface-700">Payment Setup</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-surface-400 group-hover:text-primary-600 transition-colors" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-surface-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200">
          <h2 className="text-lg font-semibold text-surface-900">Recent Orders</h2>
          <Link
            to="/seller/orders"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View All →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-surface-500 text-sm">
            No orders yet. Once buyers place orders, they'll appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider border-b border-surface-100">
                  <th className="px-6 py-3">Order #</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-primary-600">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-surface-700">
                      {order.buyer.name}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-surface-900">
                      ₹{order.total.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          orderStatusColors[order.status] ?? 'bg-gray-50 text-gray-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-surface-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}