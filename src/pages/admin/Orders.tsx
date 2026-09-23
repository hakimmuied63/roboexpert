import { useEffect, useState } from 'react';
import {
  fetchAdminOrders,
  fetchAdminCompanies,
  type AdminOrder,
  type AdminCompany,
} from '../../lib/api';
import { LoadingSpinner } from '../../components/ui';
import { Search } from 'lucide-react';

const statusStyles: Record<string, string> = {
  placed: 'bg-blue-50 text-blue-700',
  confirmed: 'bg-indigo-50 text-indigo-700',
  shipped: 'bg-purple-50 text-purple-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
};

const paymentStyles: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700',
  paid: 'bg-green-50 text-green-700',
  failed: 'bg-red-50 text-red-700',
  refunded: 'bg-gray-50 text-gray-700',
};

export function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      const [ords, comps] = await Promise.all([
        fetchAdminOrders(),
        fetchAdminCompanies(),
      ]);
      setOrders(ords);
      setCompanies(comps);
      setLoading(false);
    }
    load();
  }, []);

  const companyMap = companies.reduce<Record<string, string>>((acc, c) => {
    acc[c._id] = c.name;
    return acc;
  }, {});

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.buyer.name.toLowerCase().includes(q) ||
      o.buyer.email.toLowerCase().includes(q) ||
      (companyMap[o.companyId] ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Orders Overview</h1>
          <p className="text-surface-500 mt-1">
            View all platform orders across every seller.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order, buyer, seller..."
            className="w-full pl-10 pr-4 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-surface-200 p-12 text-center text-surface-500">
          No orders found.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider border-b border-surface-100">
                <th className="px-6 py-3">Order #</th>
                <th className="px-6 py-3">Seller</th>
                <th className="px-6 py-3">Buyer</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Payment</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map((order) => (
                <tr key={order._id} className="hover:bg-surface-50">
                  <td className="px-6 py-4 text-sm font-medium text-primary-600">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-700">
                    {companyMap[order.companyId] ?? '—'}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-surface-900">{order.buyer.name}</p>
                    <p className="text-xs text-surface-500">{order.buyer.email}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-900 font-medium">
                    ₹{order.total.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusStyles[order.status] ?? 'bg-gray-50 text-gray-700'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        paymentStyles[order.paymentStatus] ?? 'bg-gray-50 text-gray-700'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-500">
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-sm text-surface-500">
        Showing {filtered.length} of {orders.length} orders
      </div>
    </div>
  );
}