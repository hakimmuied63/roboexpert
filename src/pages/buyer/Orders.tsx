import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { orderService } from '../../mocks/services';
import type { Order } from '../../types';
import { OrderStatusBadge, LoadingSpinner, EmptyState, Button } from '../../components/ui';

export function BuyerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const data = await orderService.getAll({ buyerId: user.id });
      setOrders(data);
      setLoading(false);
    }
    load();
  }, [user]);

  if (loading) return <LoadingSpinner className="min-h-[50vh]" />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">My Orders</h1>
        <p className="text-surface-500 mt-1">Track and manage your past purchases.</p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={<Package className="w-12 h-12 text-surface-400" />}
          title="No orders yet"
          description="You haven't placed any orders. Start exploring the marketplace!"
          action={<Button onClick={() => window.location.href = '/'}>Browse Products</Button>}
        />
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-xl border border-surface-200 overflow-hidden hover:shadow-sm transition-shadow">
              {/* Order Header */}
              <div className="bg-surface-50 border-b border-surface-200 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
                  <div>
                    <p className="text-surface-500 mb-0.5">Order Placed</p>
                    <p className="font-medium text-surface-900">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-surface-500 mb-0.5">Total</p>
                    <p className="font-medium text-surface-900">
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-surface-500 mb-0.5">Order #</p>
                    <p className="font-medium text-surface-900">{order.id}</p>
                  </div>
                </div>
                <Link
                  to={`/orders/${order.id}`}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 whitespace-nowrap flex items-center gap-1"
                >
                  View Order Details <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Order Items */}
              <div className="p-4 sm:p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-surface-900">
                    Status: <span className="ml-2"><OrderStatusBadge status={order.status} /></span>
                  </h3>
                </div>

                <div className="divide-y divide-surface-100">
                  {order.items.map((item, i) => (
                    <div key={i} className="py-4 first:pt-0 last:pb-0 flex gap-4">
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
                        <div className="flex items-center gap-4 mt-2">
                          <p className="text-sm font-medium text-surface-900">
                            ₹{item.price.toLocaleString('en-IN')}
                          </p>
                          <p className="text-sm text-surface-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="hidden sm:flex flex-col gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/product/${item.productId}`)}>
                          Buy Again
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
