import { useEffect, useState } from 'react';
import { Search, IndianRupee, Save } from 'lucide-react';
import { LoadingSpinner, Button, Badge } from '../../components/ui';
import {
  fetchAdminCategories,
  updateAdminCategoryPackaging,
  type AdminCategory,
} from '../../lib/api';
import toast from 'react-hot-toast';

export function AdminCategories() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Record<string, number>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const data = await fetchAdminCategories();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (id: string, value: string) => {
    const num = value === '' ? 0 : Number(value);
    setEditing((prev) => ({ ...prev, [id]: num }));
  };

  const handleSave = async (category: AdminCategory) => {
    const newCharge = editing[category._id];
    if (newCharge === undefined || newCharge === category.packagingCharge) {
      toast.error('No change to save');
      return;
    }

    setSavingId(category._id);
    const ok = await updateAdminCategoryPackaging(category._id, newCharge);
    setSavingId(null);

    if (!ok) {
      toast.error('Could not save packaging charge');
      return;
    }

    toast.success(`Updated ${category.name}`);
    setCategories((prev) =>
      prev.map((c) =>
        c._id === category._id ? { ...c, packagingCharge: newCharge } : c
      )
    );
    // Remove from editing state
    setEditing((prev) => {
      const copy = { ...prev };
      delete copy[category._id];
      return copy;
    });
  };

  // Filter to subcategories only + apply search
  const filtered = categories.filter(
    (c) =>
      c.parentId &&
      (search === '' ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.parentName ?? '').toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Packaging Charges</h1>
          <p className="text-surface-500 mt-1">
            Set packaging fee per subcategory. Applies once per unique subcategory in an order.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subcategories..."
            className="w-full pl-10 pr-4 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
        <p className="font-medium mb-1">How packaging charges work:</p>
        <ul className="list-disc list-inside space-y-0.5 text-blue-800 text-xs">
          <li>Charge is applied per <strong>unique subcategory</strong> in a buyer's order</li>
          <li>If subcategory has no charge, the parent category's charge is used</li>
          <li>Multi-seller orders accumulate per seller</li>
        </ul>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-surface-200 p-12 text-center text-surface-500">
          {search ? 'No subcategories match your search.' : 'No subcategories found.'}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider border-b border-surface-100">
                <th className="px-6 py-3">Subcategory</th>
                <th className="px-6 py-3">Parent</th>
                <th className="px-6 py-3">Seller</th>
                <th className="px-6 py-3">Packaging Charge</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map((cat) => {
                const editValue =
                  editing[cat._id] !== undefined
                    ? editing[cat._id]
                    : cat.packagingCharge;
                const hasChange =
                  editing[cat._id] !== undefined &&
                  editing[cat._id] !== cat.packagingCharge;
                const companyName =
                  typeof cat.companyId === 'object'
                    ? cat.companyId.name
                    : '—';

                return (
                  <tr key={cat._id} className="hover:bg-surface-50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-surface-900">{cat.name}</p>
                      <p className="text-xs text-surface-500">/{cat.slug}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-surface-600">
                      {cat.parentName ?? '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-surface-600">
                      {companyName}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 max-w-[140px]">
                        <span className="text-surface-500 text-sm">₹</span>
                        <input
                          type="number"
                          min={0}
                          value={editValue}
                          onChange={(e) => handleChange(cat._id, e.target.value)}
                          className="w-24 px-2 py-1.5 border border-surface-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {hasChange ? (
                        <Button
                          size="sm"
                          onClick={() => handleSave(cat)}
                          loading={savingId === cat._id}
                          icon={<Save className="w-4 h-4" />}
                          className="bg-success-600 hover:bg-success-700"
                        >
                          Save
                        </Button>
                      ) : (
                        <Badge className="bg-surface-100 text-surface-500 border-surface-200">
                          <IndianRupee className="w-3 h-3 inline mr-1" />
                          {cat.packagingCharge}
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}