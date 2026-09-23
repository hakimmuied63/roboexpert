import { useEffect, useState } from 'react';
import {
  fetchAdminCompanies,
  toggleAdminCompanyStatus,
  type AdminCompany,
} from '../../lib/api';
import { LoadingSpinner, Badge, Button } from '../../components/ui';
import { Search, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminSellers() {
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const data = await fetchAdminCompanies();
    setCompanies(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggle = async (company: AdminCompany) => {
    setBusyId(company._id);
    const ok = await toggleAdminCompanyStatus(company._id);
    setBusyId(null);

    if (!ok) {
      toast.error('Could not update seller');
      return;
    }

    toast.success(
      company.isActive ? `${company.name} deactivated` : `${company.name} activated`
    );

    // Optimistic update
    setCompanies((prev) =>
      prev.map((c) =>
        c._id === company._id ? { ...c, isActive: !c.isActive } : c
      )
    );
  };

  const filtered = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.contactEmail.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Sellers Management</h1>
          <p className="text-surface-500 mt-1">View and manage all sellers on the platform.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sellers..."
            className="w-full pl-10 pr-4 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-surface-200 p-12 text-center text-surface-500">
          No sellers found.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider border-b border-surface-100">
                <th className="px-6 py-3">Seller</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Joined</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map((company) => (
                <tr key={company._id} className="hover:bg-surface-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-surface-900">{company.name}</p>
                      <p className="text-xs text-surface-500">/{company.slug}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {company.isActive ? (
                      <Badge variant="success" dot>
                        Active
                      </Badge>
                    ) : (
                      <Badge>Inactive</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-700">
                    <div>{company.contactEmail}</div>
                    {company.contactPhone && (
                      <div className="text-xs text-surface-500">{company.contactPhone}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-500">
                    {new Date(company.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggle(company)}
                      loading={busyId === company._id}
                      icon={
                        company.isActive ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )
                      }
                      className={
                        company.isActive
                          ? 'text-danger-600 hover:bg-danger-50'
                          : 'text-success-600 hover:bg-success-50'
                      }
                    >
                      {company.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
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