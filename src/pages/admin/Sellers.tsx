import { useEffect, useState } from 'react';
import {
  fetchAdminSellers,
  approveAdminSeller,
  rejectAdminSeller,
  suspendAdminSeller,
  type AdminSeller,
} from '../../lib/api';
import { LoadingSpinner, Badge, Button } from '../../components/ui';
import { Search, CheckCircle2, XCircle, Ban, Clock, ShieldCheck, ShieldX } from 'lucide-react';
import toast from 'react-hot-toast';

type StatusTab = 'pending' | 'approved' | 'rejected' | 'suspended';

const TABS: { key: StatusTab; label: string; icon: typeof Clock }[] = [
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'approved', label: 'Approved', icon: ShieldCheck },
  { key: 'rejected', label: 'Rejected', icon: ShieldX },
  { key: 'suspended', label: 'Suspended', icon: Ban },
];

export function AdminSellers() {
  const [tab, setTab] = useState<StatusTab>('pending');
  const [sellers, setSellers] = useState<AdminSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  // Reject/Suspend modal state
  const [actionTarget, setActionTarget] = useState<AdminSeller | null>(null);
  const [actionType, setActionType] = useState<'reject' | 'suspend' | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await fetchAdminSellers(tab);
    setSellers(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleApprove = async (seller: AdminSeller) => {
    setBusyId(seller._id);
    const ok = await approveAdminSeller(seller._id);
    setBusyId(null);

    if (!ok) {
      toast.error('Could not approve seller');
      return;
    }

    toast.success(`${seller.name} approved`);
    setSellers((prev) => prev.filter((s) => s._id !== seller._id));
  };

  const openRejectModal = (seller: AdminSeller) => {
    setActionTarget(seller);
    setActionType('reject');
    setReason('');
  };

  const openSuspendModal = (seller: AdminSeller) => {
    setActionTarget(seller);
    setActionType('suspend');
    setReason('');
  };

  const closeModal = () => {
    setActionTarget(null);
    setActionType(null);
    setReason('');
  };

  const handleSubmitAction = async () => {
    if (!actionTarget || !actionType) return;
    if (!reason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    setSubmitting(true);
    const ok =
      actionType === 'reject'
        ? await rejectAdminSeller(actionTarget._id, reason.trim())
        : await suspendAdminSeller(actionTarget._id, reason.trim());
    setSubmitting(false);

    if (!ok) {
      toast.error(`Could not ${actionType} seller`);
      return;
    }

    toast.success(`${actionTarget.name} ${actionType === 'reject' ? 'rejected' : 'suspended'}`);
    setSellers((prev) => prev.filter((s) => s._id !== actionTarget._id));
    closeModal();
  };

  const filtered = sellers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.company?.name.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (status: StatusTab) => {
    const map = {
      pending: <Badge className="bg-warning-50 text-warning-700 border-warning-200">Pending</Badge>,
      approved: <Badge variant="success" dot>Approved</Badge>,
      rejected: <Badge className="bg-danger-50 text-danger-700 border-danger-200">Rejected</Badge>,
      suspended: <Badge className="bg-surface-200 text-surface-700 border-surface-300">Suspended</Badge>,
    };
    return map[status];
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Seller Approval</h1>
          <p className="text-surface-500 mt-1">Review and manage seller accounts.</p>
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

      {/* Tabs */}
      <div className="flex gap-1 border-b border-surface-200 overflow-x-auto">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === key
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-surface-500 hover:text-surface-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-surface-200 p-12 text-center text-surface-500">
          No {tab} sellers found.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider border-b border-surface-100">
                <th className="px-6 py-3">Seller</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Signed Up</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map((seller) => (
                <tr key={seller._id} className="hover:bg-surface-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-surface-900">
                        {seller.company?.name ?? seller.name}
                      </p>
                      <p className="text-xs text-surface-500">{seller.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {statusBadge(seller.approvalStatus)}
                    {seller.approvalNote && (
                      <p className="text-xs text-surface-500 mt-1 max-w-xs truncate" title={seller.approvalNote}>
                        {seller.approvalNote}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-700">
                    <div>{seller.company?.contactEmail ?? seller.email}</div>
                    {seller.phone && (
                      <div className="text-xs text-surface-500">{seller.phone}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-500">
                    {new Date(seller.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {seller.approvalStatus === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(seller)}
                            loading={busyId === seller._id}
                            icon={<CheckCircle2 className="w-4 h-4" />}
                            className="bg-success-600 hover:bg-success-700"
                          >
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openRejectModal(seller)}
                            icon={<XCircle className="w-4 h-4" />}
                            className="text-danger-600 hover:bg-danger-50"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {seller.approvalStatus === 'approved' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openSuspendModal(seller)}
                          icon={<Ban className="w-4 h-4" />}
                          className="text-danger-600 hover:bg-danger-50"
                        >
                          Suspend
                        </Button>
                      )}
                      {(seller.approvalStatus === 'rejected' ||
                        seller.approvalStatus === 'suspended') && (
                        <Button
                          size="sm"
                          onClick={() => handleApprove(seller)}
                          loading={busyId === seller._id}
                          icon={<CheckCircle2 className="w-4 h-4" />}
                          className="bg-success-600 hover:bg-success-700"
                        >
                          Re-approve
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject/Suspend Modal */}
      {actionTarget && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-surface-900 mb-1 capitalize">
              {actionType} Seller
            </h2>
            <p className="text-sm text-surface-500 mb-4">
              {actionTarget.company?.name ?? actionTarget.name}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Reason *
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500 resize-none"
                  placeholder={`Why are you ${actionType}ing this seller?`}
                  autoFocus
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <Button variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitAction}
                  loading={submitting}
                  className="bg-danger-600 hover:bg-danger-700"
                >
                  Confirm {actionType === 'reject' ? 'Rejection' : 'Suspension'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}