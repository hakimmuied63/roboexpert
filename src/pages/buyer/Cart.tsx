import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { Button, EmptyState } from '../../components/ui';
import { Trash2, ShoppingCart, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export function Cart() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast('Please login to checkout', { icon: '🔐' });
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={<ShoppingCart className="w-12 h-12 text-surface-400" />}
          title="Your cart is empty"
          description="Looks like you haven't added anything to your cart yet."
          action={
            <Button onClick={() => navigate('/')}>Continue Shopping</Button>
          }
        />
      </div>
    );
  }

  const subtotal = totalPrice;
  const shipping = subtotal > 999 ? 0 : 99;
  const total = subtotal + shipping;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-surface-900 mb-8">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
            <div className="hidden sm:grid grid-cols-12 gap-4 p-4 border-b border-surface-200 bg-surface-50 text-sm font-medium text-surface-500">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            <ul className="divide-y divide-surface-200">
              {items.map((item) => (
                <li key={item.variantId} className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    {/* Product Info */}
                    <div className="col-span-1 sm:col-span-6 flex gap-4">
                      <Link to={`/product/${item.productId}`} className="flex-shrink-0">
                        <img
                          src={item.image ?? 'https://via.placeholder.com/96'}
                          alt={item.productName}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border border-surface-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://via.placeholder.com/96?text=No+Image';
                          }}
                        />
                      </Link>
                      <div className="flex flex-col justify-center min-w-0">
                        <Link
                          to={`/product/${item.productId}`}
                          className="text-sm sm:text-base font-semibold text-surface-900 hover:text-primary-600 transition-colors line-clamp-2"
                        >
                          {item.productName}
                        </Link>
                        {Object.keys(item.variantAttributes).length > 0 && (
                          <p className="text-xs text-surface-500 mt-1">
                            {Object.entries(item.variantAttributes)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(' • ')}
                          </p>
                        )}
                        <p className="text-xs text-surface-500 mt-1">
                          Sold by {item.companyName}
                        </p>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="flex items-center gap-1 text-sm text-danger-600 hover:text-danger-700 mt-2 transition-colors w-fit"
                        >
                          <Trash2 className="w-4 h-4" /> Remove
                        </button>
                      </div>
                    </div>

                    {/* Price (Desktop) */}
                    <div className="hidden sm:block col-span-2 text-center">
                      <span className="font-medium text-surface-900">
                        ₹{item.price.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Quantity & Mobile Price/Total */}
                    <div className="col-span-1 sm:col-span-2 flex items-center justify-between sm:justify-center">
                      <div className="flex items-center border border-surface-300 rounded-lg">
                        <button
                          className="px-3 py-1.5 text-surface-600 hover:bg-surface-50 rounded-l-lg transition-colors"
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-surface-900">
                          {item.quantity}
                        </span>
                        <button
                          className="px-3 py-1.5 text-surface-600 hover:bg-surface-50 rounded-r-lg transition-colors"
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>

                      {/* Mobile Total */}
                      <span className="sm:hidden font-bold text-surface-900">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Total (Desktop) */}
                    <div className="hidden sm:block col-span-2 text-right">
                      <span className="font-bold text-surface-900">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-surface-200 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-surface-900 mb-6">Order Summary</h2>

            <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between text-surface-600">
                <span>Subtotal ({totalItems} items)</span>
                <span className="font-medium text-surface-900">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-surface-600">
                <span>Shipping fee</span>
                <span className="font-medium text-surface-900">
                  {shipping === 0 ? (
                    <span className="text-success-600">Free</span>
                  ) : (
                    `₹${shipping}`
                  )}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-primary-600 bg-primary-50 px-3 py-2 rounded-lg">
                  Add ₹{(999 - subtotal).toLocaleString('en-IN')} more to get free shipping!
                </p>
              )}
            </div>

            <div className="border-t border-surface-200 pt-4 mb-6">
              <div className="flex justify-between">
                <span className="text-base font-bold text-surface-900">Total</span>
                <span className="text-xl font-bold text-primary-600">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-xs text-surface-500 text-right mt-1">
                Inclusive of all taxes
              </p>
            </div>

            <Button size="lg" fullWidth onClick={handleCheckout}>
              Proceed to Checkout
            </Button>

            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-surface-500">
              <ShieldCheck className="w-4 h-4 text-success-600" />
              Secure Checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}