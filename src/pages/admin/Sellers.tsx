import { useEffect, useState } from 'react';
import { sellerService } from '../../mocks/services';
import type { Seller } from '../../types';
import { LoadingSpinner, Badge, Button, ConfirmModal } from '../../components/ui';
import { Search, Trash2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminSellers() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Seller | null>(null);

  const load = async () => {
    setLoading(true);
    const data = await sellerService.getAll();
    setSellers(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await sellerService.remove(deleteTarget.id);
    toast.success('Seller and their products removed');
    setDeleteTarget(null);
    load();
  };

  const filtered = sellers.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.businessName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Sellers Management</h1>
          <p className="text-surface-500 mt-1">Manage platform sellers and verification.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search sellers..."
            className="w-full pl-10 pr-4 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider border-b border-surface-100">
                <th className="px-6 py-3">Seller</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Sales</th>
                <th className="px-6 py-3">Rating</th>
                <th className="px-6 py-3">Joined</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map(seller => (
                <tr key={seller.id} className="hover:bg-surface-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={seller.avatar} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="text-sm font-medium text-surface-900">{seller.businessName}</p>
                        <p className="text-xs text-surface-500">{seller.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {seller.verified ? (
                      <Badge variant="success" dot>Verified</Badge>
                    ) : (
                      <Badge>Unverified</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-900 font-medium">
                    {seller.totalSales}
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-700">
                    ⭐ {seller.rating.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-500">
                    {new Date(seller.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(seller)}
                      className="text-danger-600 hover:bg-danger-50"
                      icon={<Trash2 className="w-4 h-4" />}
                    >
                      Remove
                    </Button>
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
        title="Remove Seller"
        message={`Are you sure you want to remove ${deleteTarget?.businessName}? This will also delete all their listed products. This action cannot be undone.`}
        confirmText="Remove Seller"
      />
    </div>
  );
}
