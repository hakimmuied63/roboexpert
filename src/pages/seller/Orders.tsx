import { useEffect, useState } from 'react';
import {
  fetchSellerOrders,
  fetchSellerOrderItems,
  updateSellerOrderStatus,
  type SellerOrder,
} from '../../lib/api';
import { LoadingSpinner, EmptyState } from '../../components/ui';
import { ShoppingBag, ChevronDown, Package } from 'lucide-react';
import toast from 'react-hot-toast';

type OrderItemDetail = {
  _id: string;
  productSnapshot: {
    name: string;
    image?: string;
    variantAttributes: Record<string, string>;
    sku: string;
  };
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

const statusOptions = [
  { value: 'placed', label: 'Placed' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const statusStyles: Record<string, string> = {
  placed: 'bg-blue-50 text-blue-700',
  confirmed: 'bg-indigo-50 text-indigo-700',
  shipped: 'bg-purple-50 text-purple-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
};

export function SellerOrders() {
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [itemsByOrder, setItemsByOrder] = useState<Record<string, OrderItemDetail[]>>({});
  const [itemsLoading, setItemsLoading] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    const data = await fetchSellerOrders();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleExpand = async (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }

    setExpandedOrder(orderId);

    if (!itemsByOrder[orderId]) {
      setItemsLoading(orderId);
      const items = await fetchSellerOrderItems(orderId);
      setItemsByOrder((prev) => ({ ...prev, [orderId]: items }));
      setItemsLoading(null);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setBusyId(orderId);
    const ok = await updateSellerOrderStatus(orderId, newStatus);
    setBusyId(null);

    if (!ok) {
      toast.error('Could not update status');
      return;
    }

    toast.success(`Order marked as ${newStatus}`);
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const filteredOrders =
    statusFilter === 'all'
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  const statusCounts = {
    all: orders.length,
    placed: orders.filter((o) => o.status === 'placed').length,
    confirmed: orders.filter((o) => o.status === 'confirmed').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
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
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer
              ${
                statusFilter === status
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white text-surface-600 border border-surface-200 hover:bg-surface-50'
              }
            `}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            <span
              className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                statusFilter === status ? 'bg-white/20' : 'bg-surface-100'
              }`}
            >
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
          description={
            statusFilter === 'all'
              ? "You haven't received any orders yet."
              : `No ${statusFilter} orders.`
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrder === order._id;
            const items = itemsByOrder[order._id];
            const loadingItems = itemsLoading === order._id;

            return (
              <div
                key={order._id}
                className="bg-white rounded-xl border border-surface-200 overflow-hidden hover:shadow-sm transition-shadow"
              >
                {/* Header row */}
                <div
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-3 cursor-pointer"
                  onClick={() => handleExpand(order._id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex w-12 h-12 rounded-lg bg-primary-50 items-center justify-center text-primary-600">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-primary-600">
                          {order.orderNumber}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            statusStyles[order.status] ?? 'bg-gray-50 text-gray-700'
                          }`}
                        >
                          {order.status}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            order.paymentMethod === 'cod'
                              ? 'bg-orange-50 text-orange-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {order.paymentMethod === 'cod' ? 'COD' : 'Online'}
                        </span>
                      </div>
                      <p className="text-sm text-surface-600 mt-0.5">
                        {order.buyer.name} · {order.buyer.phone}
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
                      ₹{order.total.toLocaleString('en-IN')}
                    </p>

                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={order.status}
                          disabled={busyId === order._id}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          className="pl-3 pr-8 py-2 text-sm bg-surface-50 border border-surface-200 rounded-lg
                            focus:outline-none focus:border-primary-500 cursor-pointer appearance-none"
                        >
                          {statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <ChevronDown
                      className={`w-4 h-4 text-surface-400 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-surface-100 p-5 bg-surface-50 space-y-4">
                    {/* Items */}
                    <div>
                      <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">
                        Order Items
                      </h4>
                      {loadingItems ? (
                        <div className="text-sm text-surface-500 py-4">Loading items...</div>
                      ) : !items || items.length === 0 ? (
                        <div className="text-sm text-surface-500 py-4">No items found.</div>
                      ) : (
                        <div className="space-y-2">
                          {items.map((item) => (
                            <div
                              key={item._id}
                              className="flex items-center gap-3 bg-white rounded-lg p-3 border border-surface-100"
                            >
                              <img
                                src={item.productSnapshot.image ?? 'https://via.placeholder.com/40'}
                                alt={item.productSnapshot.name}
                                className="w-10 h-10 rounded-lg object-cover bg-surface-100"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://via.placeholder.com/40?text=—';
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-surface-900 truncate">
                                  {item.productSnapshot.name}
                                </p>
                                <p className="text-xs text-surface-500">
                                  {Object.values(item.productSnapshot.variantAttributes).join(' / ')}
                                  {' · '}
                                  SKU: {item.productSnapshot.sku}
                                </p>
                                <p className="text-xs text-surface-500">
                                  Qty: {item.quantity} × ₹{item.unitPrice.toLocaleString('en-IN')}
                                </p>
                              </div>
                              <p className="text-sm font-medium text-surface-900">
                                ₹{item.lineTotal.toLocaleString('en-IN')}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Shipping + Payment */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">
                          Shipping Address
                        </h4>
                        <div className="bg-white rounded-lg p-3 border border-surface-100 text-sm text-surface-700">
                          <p className="font-medium">{order.buyer.name}</p>
                          <p>{order.shippingAddress.line1}</p>
                          {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                          <p>
                            {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                            {order.shippingAddress.pincode}
                          </p>
                          <p className="text-surface-500 mt-1">{order.buyer.phone}</p>
                          <p className="text-surface-500">{order.buyer.email}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">
                          Payment
                        </h4>
                        <div className="bg-white rounded-lg p-3 border border-surface-100 text-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-surface-600">Method</span>
                            <span className="text-sm font-medium text-surface-900">
                              {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-surface-600">Status</span>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                order.paymentStatus === 'paid'
                                  ? 'bg-green-50 text-green-700'
                                  : 'bg-yellow-50 text-yellow-700'
                              }`}
                            >
                              {order.paymentStatus}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-surface-600">Total</span>
                            <span className="font-bold text-surface-900">
                              ₹{order.total.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}