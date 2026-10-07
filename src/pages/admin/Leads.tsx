import { useEffect, useState } from 'react';
import { Search, Trash2, Phone, User, Calendar, Download } from 'lucide-react';
import { LoadingSpinner, Button, ConfirmModal } from '../../components/ui';
import {
  fetchAdminLeads,
  deleteAdminLead,
  type Lead,
} from '../../lib/api';
import toast from 'react-hot-toast';

export function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await fetchAdminLeads();
    setLeads(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const ok = await deleteAdminLead(deleteTarget._id);
    setDeleting(false);

    if (!ok) {
      toast.error('Could not delete lead');
      return;
    }

    toast.success('Lead deleted');
    setLeads((prev) => prev.filter((l) => l._id !== deleteTarget._id));
    setDeleteTarget(null);
  };

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      toast.error('No leads to export');
      return;
    }

    const headers = ['Name', 'Phone', 'Source', 'Date'];
    const rows = filtered.map((l) => [
      l.name,
      l.phone,
      l.source ?? 'popup',
      new Date(l.createdAt).toLocaleString('en-IN'),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roboexpert-leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded');
  };

  const filtered = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search)
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Leads</h1>
          <p className="text-surface-500 mt-1">
            {leads.length} {leads.length === 1 ? 'lead' : 'leads'} collected from the signup popup.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            icon={<Download className="w-4 h-4" />}
          >
            Export CSV
          </Button>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or phone..."
              className="w-full pl-10 pr-4 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-surface-200 p-12 text-center text-surface-500">
          {search ? 'No leads match your search.' : 'No leads yet.'}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider border-b border-surface-100">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Source</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map((lead) => (
                <tr key={lead._id} className="hover:bg-surface-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-primary-600" />
                      </div>
                      <p className="text-sm font-medium text-surface-900">{lead.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={`tel:${lead.phone}`}
                      className="inline-flex items-center gap-1.5 text-sm text-surface-700 hover:text-primary-600"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {lead.phone}
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-surface-100 text-surface-600">
                      {lead.source ?? 'popup'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-500">
                    <div className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(lead.createdAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(lead)}
                      icon={<Trash2 className="w-4 h-4" />}
                      className="text-danger-600 hover:bg-danger-50"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Lead"
        message={`Are you sure you want to delete ${deleteTarget?.name}'s lead? This cannot be undone.`}
        confirmText={deleting ? 'Deleting...' : 'Delete'}
      />
    </div>
  );
}