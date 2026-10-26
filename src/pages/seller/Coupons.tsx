import { useEffect, useState } from 'react';
import { Tag, Plus, Trash2, X } from 'lucide-react';
import { Button, Input, LoadingSpinner } from '../../components/ui';
import { fetchSellerCoupons, createSellerCoupon, deleteSellerCoupon, fetchSellerProducts, type Coupon } from '../../lib/api';
import toast from 'react-hot-toast';

export function SellerCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('0');
  const [maxDiscountAmount, setMaxDiscountAmount] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const load = async () => {
    setLoading(true);
    const [c, p] = await Promise.all([fetchSellerCoupons(), fetchSellerProducts()]);
    setCoupons(c);
    setProducts(p);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue) return toast.error('Code and discount value are required');

    setSubmitting(true);
    const ok = await createSellerCoupon({
      code,
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount) || 0,
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
      expiresAt: expiresAt || null,
      isPublic,
      applicableProducts: selectedProducts,
    });
    setSubmitting(false);

    if (!ok) return toast.error('Could not create coupon');
    toast.success('Coupon created!');
    setIsCreating(false);
    resetForm();
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    const ok = await deleteSellerCoupon(id);
    if (ok) { toast.success('Coupon deleted'); load(); }
    else { toast.error('Could not delete coupon'); }
  };

  const resetForm = () => {
    setCode(''); setDiscountValue(''); setMinOrderAmount('0'); setMaxDiscountAmount(''); setExpiresAt(''); setIsPublic(true); setDiscountType('percentage'); setSelectedProducts([]);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Coupons</h1>
          <p className="text-surface-500 mt-1">Create discount codes for your customers.</p>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} icon={<Plus className="w-4 h-4" />}>
            Create Coupon
          </Button>
        )}
      </div>

      {isCreating && (
        <div className="bg-white rounded-xl border border-surface-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">New Coupon</h2>
            <button onClick={() => setIsCreating(false)} className="text-surface-400 hover:text-surface-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Coupon Code" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="e.g. SUMMER20" required />
            
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700">Discount Type</label>
              <select 
                value={discountType} 
                onChange={e => setDiscountType(e.target.value as 'percentage' | 'flat')}
                className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>

            <Input label="Discount Value" type="number" value={discountValue} onChange={e => setDiscountValue(e.target.value)} placeholder="e.g. 20" required />
            <Input label="Min Order Amount (₹)" type="number" value={minOrderAmount} onChange={e => setMinOrderAmount(e.target.value)} />
            
            {discountType === 'percentage' && (
              <Input label="Max Discount Amount (₹)" type="number" value={maxDiscountAmount} onChange={e => setMaxDiscountAmount(e.target.value)} placeholder="e.g. 200 (optional)" />
            )}
            
            <Input label="Expiry Date" type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />

            <div className="sm:col-span-2 flex items-center gap-2">
              <input type="checkbox" id="isPublic" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="rounded" />
              <label htmlFor="isPublic" className="text-sm text-surface-700">Show this coupon publicly on the product page & cart</label>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Applicable Products (Leave empty for all store products)
              </label>
              <div className="max-h-48 overflow-y-auto border border-surface-300 rounded-lg p-2 space-y-1">
                {products.length === 0 ? (
                  <p className="text-sm text-surface-500 p-2">No products found.</p>
                ) : (
                  products.map(p => (
                    <label key={p._id} className="flex items-center gap-2 text-sm p-2 hover:bg-surface-50 rounded cursor-pointer border-b border-surface-100 last:border-0">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(p._id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedProducts(prev => [...prev, p._id]);
                          else setSelectedProducts(prev => prev.filter(id => id !== p._id));
                        }}
                        className="rounded"
                      />
                      <span className="truncate">{p.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="sm:col-span-2 pt-2">
              <Button type="submit" loading={submitting}>Save Coupon</Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : coupons.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-surface-200">
          <Tag className="w-10 h-10 text-surface-300 mx-auto mb-3" />
          <p className="text-surface-500">No coupons yet. Create one to boost sales!</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface-50 border-b border-surface-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase">Code</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase">Discount</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase">Min Order</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase">Status</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-surface-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {coupons.map(c => (
                <tr key={c._id}>
                  <td className="px-6 py-4 font-mono font-medium text-primary-600">{c.code}</td>
                  <td className="px-6 py-4 text-sm">
                    {c.discountType === 'percentage' ? `${c.discountValue}% off` : `₹${c.discountValue} off`}
                    {c.maxDiscountAmount && <span className="text-xs text-surface-500 block">Max: ₹{c.maxDiscountAmount}</span>}
                  </td>
                  <td className="px-6 py-4 text-sm">₹{c.minOrderAmount}</td>
                  <td className="px-6 py-4 text-sm">
                    {c.isActive ? <span className="text-green-600 font-medium">Active</span> : <span className="text-red-500">Inactive</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(c._id)} className="text-surface-400 hover:text-danger-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
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