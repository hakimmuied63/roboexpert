import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { Button, EmptyState } from '../../components/ui';
import { Trash2, ShoppingCart, ShieldCheck, Tag, X } from 'lucide-react';
import { validateCartCoupon, fetchCartCoupons } from '../../lib/api';
import toast from 'react-hot-toast';

export function Cart() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);

  // Group items by companyId
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.companyId]) acc[item.companyId] = [];
    acc[item.companyId].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  // Load available coupons for the sellers in the cart
  useEffect(() => {
    const companyIds = Object.keys(groupedItems);
    if (companyIds.length > 0) {
      fetchCartCoupons(companyIds).then(setAvailableCoupons);
    }
  }, [items]);

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const subtotal = totalPrice;
  const shipping = subtotal > 999 ? 0 : 99;
  const total = subtotal + shipping - discountAmount;

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = codeToApply || couponCode;
    if (!code.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    const companyId = Object.keys(groupedItems)[0];
    if (!companyId) return;

    const companySubtotal = groupedItems[companyId].reduce(
      (sum, item) => sum + item.price * item.quantity, 
      0
    );

    setCheckingCoupon(true);
    const res = await validateCartCoupon(code.trim(), companyId, companySubtotal);
    setCheckingCoupon(false);

    if (!res.ok) {
      toast.error(res.error || 'Invalid coupon');
      return;
    }

    setAppliedCoupon(res);
    setCouponCode('');
    toast.success(`Coupon ${res.coupon.code} applied!`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.success('Coupon removed');
  };

  const handleCheckout = () => {
    navigate('/checkout', { state: { coupon: appliedCoupon } });
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={<ShoppingCart className="w-12 h-12 text-surface-400" />}
          title="Your cart is empty"
          description="Looks like you haven't added anything to your cart yet."
          action={<Button onClick={() => navigate('/')}>Continue Shopping</Button>}
        />
      </div>
    );
  }

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
                    <div className="col-span-1 sm:col-span-6 flex gap-4">
                      <Link to={`/product/${item.productId}`} className="flex-shrink-0">
                        <img
                          src={item.image ?? '/placeholder.svg'}
                          alt={item.productName}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border border-surface-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      </Link>
                      <div className="flex flex-col justify-center min-w-0">
                        <Link to={`/product/${item.productId}`} className="text-sm sm:text-base font-semibold text-surface-900 hover:text-primary-600 transition-colors line-clamp-2">
                          {item.productName}
                        </Link>
                        {Object.keys(item.variantAttributes).length > 0 && (
                          <p className="text-xs text-surface-500 mt-1">
                            {Object.entries(item.variantAttributes).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                          </p>
                        )}
                        <p className="text-xs text-surface-500 mt-1">Sold by {item.companyName}</p>
                        <button onClick={() => removeItem(item.variantId)} className="flex items-center gap-1 text-sm text-danger-600 hover:text-danger-700 mt-2 transition-colors w-fit">
                          <Trash2 className="w-4 h-4" /> Remove
                        </button>
                      </div>
                    </div>

                    <div className="hidden sm:block col-span-2 text-center">
                      <span className="font-medium text-surface-900">₹{item.price.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="col-span-1 sm:col-span-2 flex items-center justify-between sm:justify-center">
                      <div className="flex items-center border border-surface-300 rounded-lg">
                        <button className="px-3 py-1.5 text-surface-600 hover:bg-surface-50 rounded-l-lg transition-colors" onClick={() => updateQuantity(item.variantId, item.quantity - 1)}>−</button>
                        <span className="w-8 text-center text-sm font-medium text-surface-900">{item.quantity}</span>
                        <button className="px-3 py-1.5 text-surface-600 hover:bg-surface-50 rounded-r-lg transition-colors" onClick={() => updateQuantity(item.variantId, item.quantity + 1)}>+</button>
                      </div>
                      <span className="sm:hidden font-bold text-surface-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>

                    <div className="hidden sm:block col-span-2 text-right">
                      <span className="font-bold text-surface-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
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

            {/* Available Coupons List */}
            {availableCoupons.length > 0 && !appliedCoupon && (
              <div className="mb-4">
                <p className="text-sm font-medium text-surface-700 mb-2">Available Offers:</p>
                <div className="space-y-2">
                  {availableCoupons.map((c) => (
                    <div key={c.code} className="flex items-center justify-between bg-green-50 border border-green-100 p-2 rounded-lg">
                      <div>
                        <span className="font-mono text-sm font-bold text-green-800">{c.code}</span>
                        <span className="text-xs text-green-700 ml-2">
                          {c.discountType === 'percentage' ? `${c.discountValue}% off` : `₹${c.discountValue} off`}
                        </span>
                      </div>
                      <button
                        onClick={() => handleApplyCoupon(c.code)}
                        className="text-xs font-medium text-green-700 bg-white border border-green-300 px-2 py-1 rounded hover:bg-green-100"
                      >
                        Apply
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Manual Input */}
            <div className="mb-6 pb-6 border-b border-surface-100">
              <label className="block text-sm font-medium text-surface-700 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" /> Apply Coupon
              </label>
              
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 p-3 rounded-lg">
                  <div>
                    <p className="text-sm font-bold text-green-800">{appliedCoupon.coupon.code}</p>
                    <p className="text-xs text-green-700">You saved ₹{appliedCoupon.discountAmount}</p>
                  </div>
                  <button onClick={handleRemoveCoupon} className="text-green-700 hover:text-green-900">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                  />
                  <Button onClick={() => handleApplyCoupon()} loading={checkingCoupon} variant="outline">
                    Apply
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between text-surface-600">
                <span>Subtotal ({totalItems} items)</span>
                <span className="font-medium text-surface-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-surface-600">
                <span>Shipping fee</span>
                <span className="font-medium text-surface-900">
                  {shipping === 0 ? <span className="text-success-600">Free</span> : `₹${shipping}`}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount</span>
                  <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            <div className="border-t border-surface-200 pt-4 mb-6">
              <div className="flex justify-between">
                <span className="text-base font-bold text-surface-900">Total</span>
                <span className="text-xl font-bold text-primary-600">₹{total.toLocaleString('en-IN')}</span>
              </div>
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