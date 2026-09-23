import { useEffect, useState } from 'react';
import {
  fetchAdminProducts,
  fetchAdminCompanies,
  toggleAdminProductStatus,
  deleteAdminProduct,
  type Product,
  type AdminCompany,
} from '../../lib/api';
import { LoadingSpinner, Badge, Button, ConfirmModal } from '../../components/ui';
import { Search, Trash2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminListings() {
  const [products, setProducts] = useState<Product[]>([]);
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [prods, comps] = await Promise.all([
      fetchAdminProducts(),
      fetchAdminCompanies(),
    ]);
    setProducts(prods);
    setCompanies(comps);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const companyMap = companies.reduce<Record<string, string>>((acc, c) => {
    acc[c._id] = c.name;
    return acc;
  }, {});

  const handleToggle = async (product: Product) => {
    setBusyId(product._id);
    const ok = await toggleAdminProductStatus(product._id);
    setBusyId(null);

    if (!ok) {
      toast.error('Could not update product');
      return;
    }

    toast.success(product.isActive ? 'Product hidden' : 'Product visible');

    setProducts((prev) =>
      prev.map((p) =>
        p._id === product._id ? { ...p, isActive: !p.isActive } : p
      )
    );
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setBusyId(deleteTarget._id);
    const ok = await deleteAdminProduct(deleteTarget._id);
    setBusyId(null);

    if (!ok) {
      toast.error('Could not delete product');
      return;
    }

    toast.success('Listing deleted');
    setProducts((prev) => prev.filter((p) => p._id !== deleteTarget._id));
    setDeleteTarget(null);
  };

  const filtered = products.filter((p) => {
    const companyName = companyMap[p.companyId] ?? '';
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      companyName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Listings Management</h1>
          <p className="text-surface-500 mt-1">Monitor and moderate platform listings.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search listings..."
            className="w-full pl-10 pr-4 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-surface-200 p-12 text-center text-surface-500">
          No listings found.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider border-b border-surface-100">
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Seller</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map((product) => (
                <tr key={product._id} className="hover:bg-surface-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images[0] ?? 'https://via.placeholder.com/40'}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover bg-surface-100"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://via.placeholder.com/40?text=—';
                        }}
                      />
                      <div>
                        <p className="text-sm font-medium text-surface-900 line-clamp-1">
                          {product.name}
                        </p>
                        <p className="text-xs text-surface-500">/{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-surface-700">
                      {companyMap[product.companyId] ?? '—'}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-900 font-medium">
                    ₹{product.basePrice.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4">
                    {product.isActive ? (
                      <Badge variant="success" dot>
                        Visible
                      </Badge>
                    ) : (
                      <Badge>Hidden</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggle(product)}
                        loading={busyId === product._id}
                        icon={
                          product.isActive ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )
                        }
                      >
                        {product.isActive ? 'Hide' : 'Show'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(product)}
                        className="text-danger-600 hover:bg-danger-50"
                        icon={<Trash2 className="w-4 h-4" />}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Listing"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmText="Delete Listing"
      />
    </div>
  );
}