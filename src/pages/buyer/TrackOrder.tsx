import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Package,
  Search,
  CheckCircle2,
  Truck,
  Home as HomeIcon,
  RotateCcw,
  X,
  AlertTriangle,
} from 'lucide-react';
import { Button, Input, LoadingSpinner } from '../../components/ui';
import {
  trackOrder as trackOrderApi,
  cancelOrder as cancelOrderApi,
  requestReturn as requestReturnApi,
  type TrackedOrder,
  type TrackedOrderItem,
} from '../../lib/api';
import toast from 'react-hot-toast';

const LAST_EMAIL_KEY = 'roboexpert_last_order_email';

const CANCEL_REASONS = [
  'Changed my mind',
  'Ordered wrong item / size',
  'Found a better price',
  'Delivery taking too long',
  'No longer needed',
  'Other',
];

const RETURN_REASONS = [
  'Product damaged',
  'Wrong item received',
  'Item not as described',
  'Size does not fit',
  'Quality not as expected',
  'Other',
];

const STATUS_STEPS = ['placed', 'confirmed', 'shipped', 'delivered'];

const statusStyles: Record<string, string> = {
  placed: 'bg-blue-50 text-blue-700 border-blue-200',
  confirmed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  shipped: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

export function TrackOrder() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlOrderNumber = searchParams.get('order') ?? '';

  const [orderNumber, setOrderNumber] = useState(urlOrderNumber);
  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [items, setItems] = useState<TrackedOrderItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Cancel modal
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
  const [cancelNote, setCancelNote] = useState('');
  const [cancelSubmitting, setCancelSubmitting] = useState(false);

  // Return modal
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnReason, setReturnReason] = useState(RETURN_REASONS[0]);
  const [returnNote, setReturnNote] = useState('');
  const [returnSubmitting, setReturnSubmitting] = useState(false);

  // Pre-fill email from localStorage
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem(LAST_EMAIL_KEY);
      if (savedEmail) setEmail(savedEmail);
    } catch {
      // ignore
    }
  }, []);

    // Auto-lookup if URL has order number
    useEffect(() => {
      if (urlOrderNumber && email) {
        handleLookup();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [urlOrderNumber]);
  
    // Auto-open cancel modal if ?action=cancel
    useEffect(() => {
      const action = searchParams.get('action');
      if (action === 'cancel' && order && (order.status === 'placed' || order.status === 'confirmed')) {
        setCancelOpen(true);
      }
    }, [order, searchParams]);
  const handleLookup = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const trimmedOrder = orderNumber.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedOrder) {
      setError('Order number is required');
      return;
    }
    if (!trimmedEmail) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);
    setItems([]);

    const result = await trackOrderApi(trimmedOrder, trimmedEmail);

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setOrder(result.data.order);
    setItems(result.data.items);

    // Save email for next time
    try {
      localStorage.setItem(LAST_EMAIL_KEY, trimmedEmail);
    } catch {
      // ignore
    }

    // Update URL
    const params = new URLSearchParams(searchParams);
    params.set('order', trimmedOrder);
    setSearchParams(params, { replace: true });

    setLoading(false);
  };

  const handleCancel = async () => {
    if (!order) return;
    setCancelSubmitting(true);

    const result = await cancelOrderApi(
      order.orderNumber,
      order.buyer.email,
      cancelReason,
      cancelNote || undefined
    );

    setCancelSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success('Order cancelled');
    setOrder({ ...order, ...result.data.order });
    setCancelOpen(false);
    setCancelReason(CANCEL_REASONS[0]);
    setCancelNote('');
  };

  const handleReturn = async () => {
    if (!order) return;
    setReturnSubmitting(true);

    const result = await requestReturnApi(
      order.orderNumber,
      order.buyer.email,
      returnReason,
      returnNote || undefined
    );

    setReturnSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success('Return request submitted');
    setOrder({ ...order, ...result.data.order });
    setReturnOpen(false);
    setReturnReason(RETURN_REASONS[0]);
    setReturnNote('');
  };

  const canCancel = order && (order.status === 'placed' || order.status === 'confirmed');
  const canReturn = order && order.status === 'delivered' && !order.returnStatus;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 mb-4">
          <Package className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-bold text-surface-900">Track Your Order</h1>
        <p className="text-surface-500 mt-2">
          Enter your order number and the email you used at checkout
        </p>
      </div>

      {/* Lookup form */}
      <form
        onSubmit={handleLookup}
        className="bg-white rounded-2xl border border-surface-200 p-6 space-y-4"
      >
        <Input
          label="Order Number"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
          placeholder="ORD-2026-XXXXXX"
          autoFocus
        />
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={loading}
          icon={<Search className="w-4 h-4" />}
        >
          Find My Order
        </Button>
      </form>

      {/* Order detail */}
      {loading && (
        <div className="mt-8">
          <LoadingSpinner className="min-h-[20vh]" />
        </div>
      )}

      {order && !loading && (
        <div className="mt-8 space-y-6">
          {/* Status card */}
          <div className="bg-white rounded-2xl border border-surface-200 p-6">
            <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
              <div>
                <p className="text-xs text-surface-500 uppercase tracking-wide mb-1">Order Number</p>
                <p className="text-lg font-bold text-surface-900">{order.orderNumber}</p>
                <p className="text-sm text-surface-500 mt-1">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <span
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border ${
                  statusStyles[order.status] ?? 'bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>

            {/* Progress steps */}
            {order.status !== 'cancelled' && (
              <div className="flex items-center justify-between mb-6">
                {STATUS_STEPS.map((step, idx) => {
                  const currentIdx = STATUS_STEPS.indexOf(order.status);
                  const isDone = idx <= currentIdx;
                  const icons = [CheckCircle2, CheckCircle2, Truck, HomeIcon];
                  const Icon = icons[idx];
                  return (
                    <div key={step} className="flex-1 flex flex-col items-center relative">
                      {idx > 0 && (
                        <div
                          className={`absolute top-4 -left-1/2 w-full h-0.5 ${
                            isDone ? 'bg-primary-600' : 'bg-surface-200'
                          }`}
                        />
                      )}
                      <div
                        className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                          isDone
                            ? 'bg-primary-600 text-white'
                            : 'bg-surface-200 text-surface-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span
                        className={`text-xs mt-2 capitalize ${
                          isDone ? 'text-primary-600 font-medium' : 'text-surface-400'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {order.status === 'cancelled' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-red-900 mb-1">Order Cancelled</p>
                {order.cancellationReason && (
                  <p className="text-xs text-red-700">Reason: {order.cancellationReason}</p>
                )}
                {order.cancellationNote && (
                  <p className="text-xs text-red-700 mt-1">Note: {order.cancellationNote}</p>
                )}
              </div>
            )}

            {/* Return status */}
            {order.returnStatus && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-amber-900 mb-1">
                  Return {order.returnStatus.charAt(0).toUpperCase() + order.returnStatus.slice(1)}
                </p>
                <p className="text-xs text-amber-700">Reason: {order.returnReason}</p>
                {order.returnNote && (
                  <p className="text-xs text-amber-700 mt-1">Note: {order.returnNote}</p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-surface-100">
              {canCancel && (
                <Button
                  variant="outline"
                  onClick={() => setCancelOpen(true)}
                  icon={<X className="w-4 h-4" />}
                  className="text-danger-600 border-danger-300 hover:bg-danger-50"
                >
                  Cancel Order
                </Button>
              )}
              {canReturn && (
                <Button
                  variant="outline"
                  onClick={() => setReturnOpen(true)}
                  icon={<RotateCcw className="w-4 h-4" />}
                >
                  Request Return
                </Button>
              )}
              {!canCancel && !canReturn && !order.returnStatus && order.status !== 'cancelled' && (
                <p className="text-sm text-surface-500">
                  {order.status === 'shipped'
                    ? 'This order has been shipped and can no longer be cancelled.'
                    : order.status === 'delivered'
                    ? 'The return window for this order has closed.'
                    : ''}
                </p>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-2xl border border-surface-200 p-6">
            <h2 className="text-lg font-bold text-surface-900 mb-4">Items</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-3 p-3 bg-surface-50 rounded-lg border border-surface-100"
                >
                  <img
                    src={item.productSnapshot.image ?? 'https://picsum.photos/48'}
                    alt={item.productSnapshot.name}
                    className="w-12 h-12 rounded-lg object-cover bg-surface-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://picsum.photos/48';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-900 truncate">
                      {item.productSnapshot.name}
                    </p>
                    <p className="text-xs text-surface-500">
                      {Object.values(item.productSnapshot.variantAttributes).join(' / ')}
                    </p>
                    <p className="text-xs text-surface-500">
                      Qty {item.quantity} × ₹{item.unitPrice.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-surface-900">
                    ₹{item.lineTotal.toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-surface-100 flex justify-between">
              <span className="font-semibold text-surface-900">Total</span>
              <span className="text-lg font-bold text-surface-900">
                ₹{order.total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Shipping address */}
          <div className="bg-white rounded-2xl border border-surface-200 p-6">
            <h2 className="text-lg font-bold text-surface-900 mb-3">Shipping Address</h2>
            <div className="text-sm text-surface-700">
              <p className="font-medium">{order.buyer.name}</p>
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                {order.shippingAddress.pincode}
              </p>
              <p className="text-surface-500 mt-2">{order.buyer.phone}</p>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Continue shopping
            </Link>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancelOpen && order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-surface-900 mb-1">Cancel Order</h2>
            <p className="text-sm text-surface-500 mb-4">
              Order {order.orderNumber} — ₹{order.total.toLocaleString('en-IN')}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Reason *
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                >
                  {CANCEL_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Additional notes (optional)
                </label>
                <textarea
                  value={cancelNote}
                  onChange={(e) => setCancelNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500 resize-none"
                  placeholder="Anything else you'd like to add..."
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <Button variant="outline" onClick={() => setCancelOpen(false)}>
                  Keep Order
                </Button>
                <Button
                  onClick={handleCancel}
                  loading={cancelSubmitting}
                  className="bg-danger-600 hover:bg-danger-700"
                >
                  Cancel Order
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {returnOpen && order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-surface-900 mb-1">Request Return</h2>
            <p className="text-sm text-surface-500 mb-4">
              Order {order.orderNumber} — ₹{order.total.toLocaleString('en-IN')}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Reason *
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                >
                  {RETURN_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Additional notes (optional)
                </label>
                <textarea
                  value={returnNote}
                  onChange={(e) => setReturnNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500 resize-none"
                  placeholder="Tell the seller what went wrong..."
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <Button variant="outline" onClick={() => setReturnOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleReturn} loading={returnSubmitting}>
                  Submit Return Request
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}