import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, CreditCard, Receipt, FileText } from 'lucide-react';
import { orderService } from '../../mocks/services';
import type { Order } from '../../types';
import { OrderStatusBadge, LoadingSpinner, Button, Badge } from '../../components/ui';

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const data = await orderService.getById(id);
      setOrder(data || null);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <LoadingSpinner className="min-h-[50vh]" />;

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-surface-900">Order not found</h2>
        <Link to="/orders" className="text-primary-600 hover:underline mt-4 inline-block">
          Return to orders
        </Link>
      </div>
    );
  }

  // Calculate timeline steps
  const steps = [
    { key: 'placed', label: 'Order Placed' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' }
  ];
  
  // Find current step index based on latest status history
  const currentStatusIndex = steps.findIndex(s => 
    s.key === order.statusHistory[order.statusHistory.length - 1]?.status
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <Link to="/orders" className="inline-flex items-center gap-2 text-sm font-medium text-surface-500 hover:text-primary-600 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to orders
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-surface-900">Order Details</h1>
            <p className="text-surface-500 mt-1">Order # {order.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" icon={<FileText className="w-4 h-4" />}>Invoice</Button>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="bg-white rounded-xl border border-surface-200 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-bold text-surface-900">Order Status</h2>
          <OrderStatusBadge status={order.status} />
        </div>

        {order.status !== 'cancelled' ? (
          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute top-5 left-6 right-6 h-1 bg-surface-100 rounded-full" />
            <div 
              className="absolute top-5 left-6 h-1 bg-primary-600 rounded-full transition-all duration-500"
              style={{ width: `calc(${(Math.max(0, currentStatusIndex) / (steps.length - 1)) * 100}% - 24px)` }}
            />

            <div className="relative flex justify-between">
              {steps.map((step, idx) => {
                const historyEntry = order.statusHistory.find(h => h.status === step.key);
                const isCompleted = !!historyEntry;
                const isCurrent = idx === currentStatusIndex;

                return (
                  <div key={step.key} className="flex flex-col items-center w-24">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white z-10 transition-colors
                      ${isCompleted ? 'bg-primary-600 text-white' : 'bg-surface-200 text-surface-400'}`}
                    >
                      {isCompleted ? <Receipt className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                    </div>
                    <p className={`text-sm font-medium mt-3 text-center ${isCompleted ? 'text-surface-900' : 'text-surface-400'}`}>
                      {step.label}
                    </p>
                    {historyEntry && (
                      <p className="text-[10px] text-surface-500 text-center mt-1">
                        {new Date(historyEntry.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-danger-50 text-danger-700 rounded-lg text-sm font-medium">
            This order was cancelled on {new Date(order.updatedAt).toLocaleDateString('en-IN')}.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
            <div className="p-6 border-b border-surface-200">
              <h2 className="text-lg font-bold text-surface-900">Items Ordered</h2>
            </div>
            <div className="divide-y divide-surface-100">
              {order.items.map((item, i) => (
                <div key={i} className="p-6 flex gap-4">
                  <img
                    src={item.productImage}
                    alt={item.productTitle}
                    className="w-20 h-20 rounded-lg object-cover border border-surface-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.productId}`}
                      className="text-base font-semibold text-surface-900 hover:text-primary-600 transition-colors line-clamp-2"
                    >
                      {item.productTitle}
                    </Link>
                    <p className="text-sm text-surface-500 mt-1">Sold by: {item.sellerName}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm text-surface-500">
                        ₹{item.price.toLocaleString('en-IN')} × {item.quantity}
                      </p>
                      <p className="text-base font-bold text-surface-900">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-surface-50 border-t border-surface-200">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-surface-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-surface-900">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-surface-600">
                  <span>Shipping</span>
                  <span className="font-medium text-surface-900">Free</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-surface-200 text-base font-bold">
                  <span className="text-surface-900">Total</span>
                  <span className="text-primary-600">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Details */}
        <div className="space-y-6">
          {/* Shipping */}
          <div className="bg-white rounded-xl border border-surface-200 p-6">
            <h3 className="font-semibold text-surface-900 flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-primary-600" /> Shipping Address
            </h3>
            <div className="text-sm text-surface-600 space-y-1">
              <p className="font-medium text-surface-900">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
              <p className="pt-2 text-surface-500">Phone: {order.shippingAddress.phone}</p>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl border border-surface-200 p-6">
            <h3 className="font-semibold text-surface-900 flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-primary-600" /> Payment Info
            </h3>
            <div className="text-sm text-surface-600 space-y-3">
              <div className="flex justify-between">
                <span>Method</span>
                <span className="font-medium text-surface-900">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <Badge variant={order.paymentStatus === 'paid' ? 'success' : 'warning'}>
                  {order.paymentStatus}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
