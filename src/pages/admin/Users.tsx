import { useEffect, useState } from 'react';
import {
  fetchAdminUsers,
  toggleAdminUserStatus,
  type AdminUser,
} from '../../lib/api';
import { LoadingSpinner, Badge, Button } from '../../components/ui';
import { Search, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const data = await fetchAdminUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggle = async (user: AdminUser) => {
    setBusyId(user._id);
    const ok = await toggleAdminUserStatus(user._id);
    setBusyId(null);

    if (!ok) {
      toast.error('Could not update user');
      return;
    }

    toast.success(user.isActive ? 'User deactivated' : 'User activated');

    setUsers((prev) =>
      prev.map((u) => (u._id === user._id ? { ...u, isActive: !u.isActive } : u))
    );
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      u.name.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Users Management</h1>
          <p className="text-surface-500 mt-1">View and manage all platform users.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-surface-200 p-12 text-center text-surface-500">
          No users found.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider border-b border-surface-100">
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Joined</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map((user) => (
                <tr key={user._id} className="hover:bg-surface-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-surface-900">{user.name}</p>
                      <p className="text-xs text-surface-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.role === 'admin' ? (
                      <Badge variant="success">Admin</Badge>
                    ) : (
                      <Badge>Seller</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {user.isActive ? (
                      <Badge variant="success" dot>
                        Active
                      </Badge>
                    ) : (
                      <Badge>Inactive</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-500">
                    {new Date(user.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.role === 'admin' ? (
                      <span className="text-xs text-surface-400">
                        Protected
                      </span>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggle(user)}
                        loading={busyId === user._id}
                        icon={
                          user.isActive ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )
                        }
                        className={
                          user.isActive
                            ? 'text-danger-600 hover:bg-danger-50'
                            : 'text-success-600 hover:bg-success-50'
                        }
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    )}
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