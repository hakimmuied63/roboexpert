import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { orderService } from '../../mocks/services';
import { OrderStatusBadge, LoadingSpinner, EmptyState, Button } from '../../components/ui';
import type { Order, OrderStatus } from '../../types';
import { ShoppingBag, Eye, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: 'placed', label: 'Placed' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function SellerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const loadOrders = async () => {
    if (!user) return;
    setLoading(true);
    const data = await orderService.getAll({ sellerId: user.id });
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, [user]);

  const filteredOrders =
    statusFilter === 'all'
      ? orders
      : orders.filter(o => o.status === statusFilter);

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    await orderService.updateStatus(orderId, newStatus);
    toast.success(`Order status updated to ${newStatus}`);
    loadOrders();
  };

  const statusCounts = {
    all: orders.length,
    placed: orders.filter(o => o.status === 'placed').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Orders</h1>
        <p className="text-surface-500 mt-1">
          Manage incoming orders and update their status.
        </p>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer
              ${statusFilter === status
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white text-surface-600 border border-surface-200 hover:bg-surface-50'}
            `}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
              statusFilter === status ? 'bg-white/20' : 'bg-surface-100'
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8 text-surface-400" />}
          title="No orders found"
          description={statusFilter === 'all' ? "You haven't received any orders yet." : `No ${statusFilter} orders.`}
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-surface-200 overflow-hidden hover:shadow-sm transition-shadow"
            >
              {/* Order Header */}
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-3 cursor-pointer"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="hidden sm:block">
                    <img
                      src={order.items[0]?.productImage}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-primary-600">{order.id}</span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="text-sm text-surface-600 mt-0.5">
                      {order.buyerName} · {order.items.length} item{order.items.length > 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-surface-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <p className="text-lg font-bold text-surface-900">
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </p>

                  {/* Status Update Dropdown */}
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <div className="relative" onClick={e => e.stopPropagation()}>
                      <select
                        value={order.status}
                        onChange={e => handleStatusUpdate(order.id, e.target.value as OrderStatus)}
                        className="pl-3 pr-8 py-2 text-sm bg-surface-50 border border-surface-200 rounded-lg
                          focus:outline-none focus:border-primary-500 cursor-pointer appearance-none"
                      >
                        {statusOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <ChevronDown
                    className={`w-4 h-4 text-surface-400 transition-transform ${
                      expandedOrder === order.id ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Expanded Details */}
              {expandedOrder === order.id && (
                <div className="border-t border-surface-100 p-5 bg-surface-50 space-y-4">
                  {/* Items */}
                  <div>
                    <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">
                      Order Items
                    </h4>
                    <div className="space-y-2">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-surface-100">
                          <img
                            src={item.productImage}
                            alt={item.productTitle}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-surface-900 truncate">
                              {item.productTitle}
                            </p>
                            <p className="text-xs text-surface-500">
                              Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                            </p>
                          </div>
                          <p className="text-sm font-medium text-surface-900">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">
                        Shipping Address
                      </h4>
                      <div className="bg-white rounded-lg p-3 border border-surface-100 text-sm text-surface-700">
                        <p className="font-medium">{order.shippingAddress.fullName}</p>
                        <p>{order.shippingAddress.line1}</p>
                        {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                        <p>
                          {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                        </p>
                        <p className="text-surface-500 mt-1">{order.shippingAddress.phone}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">
                        Status Timeline
                      </h4>
                      <div className="bg-white rounded-lg p-3 border border-surface-100 space-y-2">
                        {order.statusHistory.map((entry, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              i === order.statusHistory.length - 1 ? 'bg-primary-500' : 'bg-surface-300'
                            }`} />
                            <div>
                              <p className="text-sm font-medium text-surface-700 capitalize">
                                {entry.status}
                              </p>
                              <p className="text-xs text-surface-400">
                                {new Date(entry.timestamp).toLocaleString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
