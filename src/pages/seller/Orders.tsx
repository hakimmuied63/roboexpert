import { useEffect, useState } from 'react';
import {
  fetchSellerOrders,
  fetchSellerOrderItems,
  updateSellerOrderStatus,
  updateSellerReturnStatus,
  downloadSellerInvoice,
  type SellerOrder,
} from '../../lib/api';
import { LoadingSpinner, EmptyState } from '../../components/ui';
import { ShoppingBag, ChevronDown, Package, FileText, RotateCcw } from 'lucide-react';
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

const returnStyles: Record<string, string> = {
  requested: 'bg-yellow-50 text-yellow-700',
  approved: 'bg-blue-50 text-blue-700',
  rejected: 'bg-red-50 text-red-700',
  completed: 'bg-green-50 text-green-700',
};

const refundStyles: Record<string, string> = {
  completed: 'bg-green-50 text-green-700',
  failed: 'bg-red-50 text-red-700',
  pending: 'bg-yellow-50 text-yellow-700',
};

function getUtmSource(order: SellerOrder): string | null {
  const utm = (order as any).utm;
  if (!utm) return null;
  if (utm.source) return String(utm.source);
  if (utm.referrer) {
    try {
      const ref = new URL(utm.referrer);
      return ref.hostname.replace('www.', '');
    } catch {
      return null;
    }
  }
  return null;
}

type TabKey = 'all' | 'placed' | 'confirmed' | 'shipped' | 'delivered' | 'returns';

export function SellerOrders() {
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>('all');
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

  const handleDownloadInvoice = async (orderId: string, orderNumber: string) => {
    const ok = await downloadSellerInvoice(orderId);
    if (!ok) {
      toast.error('Could not download invoice');
    } else {
      toast.success(`Invoice for ${orderNumber} downloading`);
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

  const handleReturnAction = async (
    orderId: string,
    action: 'approve' | 'reject' | 'received'
  ) => {
    setBusyId(orderId);
    const ok = await updateSellerReturnStatus(orderId, action);
    setBusyId(null);

    if (!ok) {
      toast.error(`Could not ${action} return`);
      return;
    }

    if (action === 'approve') toast.success('Return approved');
    else if (action === 'reject') toast.success('Return rejected');
    else toast.success('Return completed — refund processed if applicable');

    await loadOrders();
  };

  const filteredOrders = (() => {
    if (tab === 'all') return orders;
    if (tab === 'returns') return orders.filter((o) => !!o.returnStatus);
    return orders.filter((o) => o.status === tab);
  })();

  const statusCounts = {
    all: orders.length,
    placed: orders.filter((o) => o.status === 'placed').length,
    confirmed: orders.filter((o) => o.status === 'confirmed').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    returns: orders.filter((o) => !!o.returnStatus).length,
  };

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: statusCounts.all },
    { key: 'placed', label: 'Placed', count: statusCounts.placed },
    { key: 'confirmed', label: 'Confirmed', count: statusCounts.confirmed },
    { key: 'shipped', label: 'Shipped', count: statusCounts.shipped },
    { key: 'delivered', label: 'Delivered', count: statusCounts.delivered },
    { key: 'returns', label: 'Returns', count: statusCounts.returns },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Orders</h1>
        <p className="text-surface-500 mt-1">
          Manage incoming orders, update their status, and handle returns.
        </p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer
              ${
                tab === t.key
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white text-surface-600 border border-surface-200 hover:bg-surface-50'
              }
            `}
          >
            {t.label}
            <span
              className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                tab === t.key ? 'bg-white/20' : 'bg-surface-100'
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8 text-surface-400" />}
          title="No orders found"
          description={
            tab === 'all'
              ? "You haven't received any orders yet."
              : tab === 'returns'
              ? 'No return requests yet.'
              : `No ${tab} orders.`
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
                        {order.returnStatus && (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              returnStyles[order.returnStatus] ?? 'bg-gray-50 text-gray-700'
                            }`}
                          >
                            Return: {order.returnStatus}
                          </span>
                        )}
                        {getUtmSource(order) && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                            {getUtmSource(order)}
                          </span>
                        )}
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
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadInvoice(order._id, order.orderNumber);
                      }}
                      className="p-2 rounded-lg text-surface-500 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                      title="Download Invoice"
                    >
                      <FileText className="w-4 h-4" />
                    </button>

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

                {isExpanded && (
                  <div className="border-t border-surface-100 p-5 bg-surface-50 space-y-4">
                    {order.returnStatus && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <RotateCcw className="w-5 h-5 text-yellow-700 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h4 className="text-sm font-semibold text-yellow-900">
                                Return {order.returnStatus}
                              </h4>
                              {order.returnRequestedAt && (
                                <span className="text-xs text-yellow-700">
                                  requested{' '}
                                  {new Date(order.returnRequestedAt).toLocaleDateString('en-IN')}
                                </span>
                              )}
                              {order.refundStatus && (
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    refundStyles[order.refundStatus] ??
                                    'bg-gray-50 text-gray-700'
                                  }`}
                                >
                                  Refund: {order.refundStatus}
                                </span>
                              )}
                            </div>
                            {order.returnReason && (
                              <p className="text-sm text-yellow-900">
                                <span className="font-medium">Reason:</span>{' '}
                                {order.returnReason}
                              </p>
                            )}
                            {order.returnNote && (
                              <p className="text-sm text-yellow-800 mt-1">
                                <span className="font-medium">Note:</span> {order.returnNote}
                              </p>
                            )}
                            {order.refundFailureReason && (
                              <p className="text-sm text-red-700 mt-1">
                                <span className="font-medium">Refund error:</span>{' '}
                                {order.refundFailureReason}
                              </p>
                            )}

                            <div className="flex items-center gap-2 mt-3 flex-wrap">
                              {order.returnStatus === 'requested' && (
                                <>
                                  <button
                                    type="button"
                                    disabled={busyId === order._id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleReturnAction(order._id, 'approve');
                                    }}
                                    className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    disabled={busyId === order._id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleReturnAction(order._id, 'reject');
                                    }}
                                    className="px-3 py-1.5 bg-white border border-red-300 text-red-700 text-sm font-medium rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              {order.returnStatus === 'approved' && (
                                <button
                                  type="button"
                                  disabled={busyId === order._id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReturnAction(order._id, 'received');
                                  }}
                                  className="px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                                >
                                  Mark Received & Refund
                                </button>
                              )}
                              {order.returnStatus === 'completed' &&
                                order.refundStatus === 'completed' && (
                                  <span className="text-xs text-green-700 font-medium">
                                    Refund issued{' '}
                                    {order.refundId ? `(${order.refundId})` : ''}
                                  </span>
                                )}
                              {order.returnStatus === 'completed' &&
                                order.refundStatus === 'failed' && (
                                  <span className="text-xs text-red-700 font-medium">
                                    Refund failed — retry from Razorpay dashboard
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

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
                                src={
                                  item.productSnapshot.image ??
                                  '/placeholder.svg'
                                }
                                alt={item.productSnapshot.name}
                                className="w-10 h-10 rounded-lg object-cover bg-surface-100"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    '/placeholder.svg';
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-surface-900 truncate">
                                  {item.productSnapshot.name}
                                </p>
                                <p className="text-xs text-surface-500">
                                  {Object.values(item.productSnapshot.variantAttributes).join(
                                    ' / '
                                  )}
                                  {' · '}
                                  SKU: {item.productSnapshot.sku}
                                </p>
                                <p className="text-xs text-surface-500">
                                  Qty: {item.quantity} × ₹
                                  {item.unitPrice.toLocaleString('en-IN')}
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
                                  : order.paymentStatus === 'refunded'
                                  ? 'bg-blue-50 text-blue-700'
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