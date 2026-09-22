import { useEffect, useState } from 'react';
import { orderService } from '../../mocks/services';
import type { Order } from '../../types';
import { LoadingSpinner, OrderStatusBadge } from '../../components/ui';
import { Search } from 'lucide-react';

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      const data = await orderService.getAll();
      setOrders(data);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = orders.filter(o => 
    o.id.toLowerCase().includes(search.toLowerCase()) || 
    o.buyerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Orders Overview</h1>
          <p className="text-surface-500 mt-1">View all platform orders.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ID or Buyer..."
            className="w-full pl-10 pr-4 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider border-b border-surface-100">
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Buyer</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map(order => (
                <tr key={order.id} className="hover:bg-surface-50">
                  <td className="px-6 py-4 text-sm font-medium text-primary-600">
                    {order.id}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-surface-900">{order.buyerName}</p>
                    <p className="text-xs text-surface-500">{order.buyerEmail}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-900 font-medium">
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
