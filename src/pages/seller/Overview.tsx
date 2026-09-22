import { useEffect, useState } from 'react';
import {
  Package,
  ShoppingBag,
  DollarSign,
  Clock,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { statsService, orderService } from '../../mocks/services';
import { OrderStatusBadge, LoadingSpinner } from '../../components/ui';
import type { SellerStats, Order } from '../../types';

export function SellerOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const [s, o] = await Promise.all([
        statsService.getSellerStats(user.id),
        orderService.getAll({ sellerId: user.id }),
      ]);
      setStats(s);
      setRecentOrders(o.slice(0, 5));
      setLoading(false);
    }
    load();
  }, [user]);

  if (loading || !stats) return <LoadingSpinner />;

  const statCards = [
    {
      label: 'Total Products',
      value: stats.totalProducts,
      icon: <Package className="w-5 h-5" />,
      color: 'bg-primary-50 text-primary-600',
      trend: '+12%',
    },
    {
      label: 'Active Orders',
      value: stats.activeOrders,
      icon: <ShoppingBag className="w-5 h-5" />,
      color: 'bg-orange-50 text-orange-600',
      trend: '+5%',
    },
    {
      label: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`,
      icon: <DollarSign className="w-5 h-5" />,
      color: 'bg-success-50 text-success-600',
      trend: '+18%',
    },
    {
      label: 'Pending Payments',
      value: `₹${stats.pendingPayments.toLocaleString('en-IN')}`,
      icon: <Clock className="w-5 h-5" />,
      color: 'bg-warning-50 text-warning-600',
      trend: null,
    },
  ];

  const maxSale = Math.max(...stats.monthlySales);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Dashboard</h1>
        <p className="text-surface-500 mt-1">
          Welcome back, {user?.name}! Here's how your shop is doing.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-surface-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center`}>
                {card.icon}
              </div>
              {card.trend && (
                <span className="inline-flex items-center gap-0.5 text-xs font-medium text-success-600 bg-success-50 px-2 py-0.5 rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  {card.trend}
                </span>
              )}
            </div>
            <p className="mt-4 text-2xl font-bold text-surface-900">{card.value}</p>
            <p className="text-sm text-surface-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-surface-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-surface-900">Monthly Sales</h2>
            <span className="text-sm text-surface-500">Last 12 months</span>
          </div>
          <div className="flex items-end gap-2 h-48">
            {stats.monthlySales.map((sale, i) => {
              const height = (sale / maxSale) * 100;
              const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full relative group">
                    <div
                      className="w-full bg-primary-500 rounded-t-md hover:bg-primary-600 transition-colors cursor-pointer"
                      style={{ height: `${height}%`, minHeight: '4px' }}
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block">
                      <div className="bg-surface-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap">
                        ₹{sale.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-surface-400">{months[i]}</span>
                </div>
              );
            })}
          </div>
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
                <span className="text-sm font-medium text-surface-700">Payment History</span>
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider border-b border-surface-100">
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {recentOrders.map(order => (
                <tr key={order.id} className="hover:bg-surface-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-primary-600">{order.id}</td>
                  <td className="px-6 py-4 text-sm text-surface-700">{order.buyerName}</td>
                  <td className="px-6 py-4 text-sm text-surface-600 max-w-[200px] truncate">
                    {order.items.map(i => i.productTitle).join(', ')}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-surface-900">
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-500">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
