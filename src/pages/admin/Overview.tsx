import { useEffect, useState } from 'react';
import {
  Users,
  Store,
  Package,
  ShoppingBag,
  DollarSign,
  Activity,
} from 'lucide-react';
import { statsService } from '../../mocks/services';
import type { AdminStats } from '../../types';
import { LoadingSpinner } from '../../components/ui';

export function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await statsService.getAdminStats();
      setStats(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading || !stats) return <LoadingSpinner />;

  const statCards = [
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: <DollarSign className="w-5 h-5" />, color: 'bg-success-50 text-success-600' },
    { label: 'Total Orders', value: stats.totalOrders.toLocaleString(), icon: <ShoppingBag className="w-5 h-5" />, color: 'bg-primary-50 text-primary-600' },
    { label: 'Active Sellers', value: stats.totalSellers.toLocaleString(), icon: <Store className="w-5 h-5" />, color: 'bg-orange-50 text-orange-600' },
    { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: <Users className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600' },
    { label: 'Products Listed', value: stats.totalProducts.toLocaleString(), icon: <Package className="w-5 h-5" />, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Admin Overview</h1>
        <p className="text-surface-500 mt-1">Platform-wide statistics and activity.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xl:grid-cols-5">
        {statCards.map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-surface-200 p-5 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center mb-4`}>
              {card.icon}
            </div>
            <p className="text-2xl font-bold text-surface-900">{card.value}</p>
            <p className="text-sm text-surface-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-surface-200">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-surface-200">
          <Activity className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-surface-900">Recent Platform Activity</h2>
        </div>
        <div className="divide-y divide-surface-100">
          {stats.recentActivity.map(activity => (
            <div key={activity.id} className="p-4 px-6 flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-surface-900">{activity.message}</p>
                <p className="text-xs text-surface-500 mt-1">
                  {new Date(activity.timestamp).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
