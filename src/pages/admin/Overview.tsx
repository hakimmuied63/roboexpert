import { useEffect, useState } from 'react';
import {
  Users,
  Store,
  Package,
  ShoppingBag,
  DollarSign,
} from 'lucide-react';
import { fetchAdminStats, type AdminStats } from '../../lib/api';
import { LoadingSpinner } from '../../components/ui';

export function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await fetchAdminStats();
      setStats(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  if (!stats) {
    return (
      <div className="p-6 lg:p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="text-lg font-bold text-red-900">Could not load stats</h2>
          <p className="text-sm text-red-700 mt-1">
            Make sure you are signed in as an admin.
          </p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Revenue',
      value: `₹${stats.revenue.toLocaleString('en-IN')}`,
      icon: <DollarSign className="w-5 h-5" />,
      color: 'bg-success-50 text-success-600',
    },
    {
      label: 'Total Orders',
      value: stats.orders.toLocaleString(),
      icon: <ShoppingBag className="w-5 h-5" />,
      color: 'bg-primary-50 text-primary-600',
    },
    {
      label: 'Active Sellers',
      value: `${stats.activeCompanies} / ${stats.companies}`,
      icon: <Store className="w-5 h-5" />,
      color: 'bg-orange-50 text-orange-600',
    },
    {
      label: 'Total Users',
      value: stats.users.toLocaleString(),
      icon: <Users className="w-5 h-5" />,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Products Listed',
      value: stats.products.toLocaleString(),
      icon: <Package className="w-5 h-5" />,
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  const orderStatusLabels: Record<string, string> = {
    placed: 'Placed',
    confirmed: 'Confirmed',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Admin Overview</h1>
        <p className="text-surface-500 mt-1">Platform-wide statistics and activity.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xl:grid-cols-5">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-surface-200 p-5 hover:shadow-md transition-shadow"
          >
            <div
              className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center mb-4`}
            >
              {card.icon}
            </div>
            <p className="text-2xl font-bold text-surface-900">{card.value}</p>
            <p className="text-sm text-surface-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Orders by Status */}
      <div className="bg-white rounded-xl border border-surface-200">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-surface-200">
          <ShoppingBag className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-surface-900">Orders by Status</h2>
        </div>
        <div className="divide-y divide-surface-100">
          {stats.ordersByStatus.length === 0 ? (
            <div className="p-6 text-sm text-surface-500">No orders yet.</div>
          ) : (
            stats.ordersByStatus.map((row) => (
              <div
                key={row._id}
                className="px-6 py-4 flex items-center justify-between"
              >
                <span className="text-sm font-medium text-surface-900">
                  {orderStatusLabels[row._id] ?? row._id}
                </span>
                <span className="text-sm font-bold text-surface-900">
                  {row.count}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}