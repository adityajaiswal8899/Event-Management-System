import React, { useState, useEffect } from 'react';
import { adminService } from './bookingService';
import { useNotification } from './NotificationContext';
import { TableSkeleton } from './LoadingSkeleton';
import { Users, Search, Shield, UserCheck, CheckCircle2, XCircle } from 'lucide-react';

export const AdminUsersPage = () => {
  const { addToast } = useNotification();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;
      const data = await adminService.getUsers(params);
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleToggleActive = async (userObj) => {
    try {
      const updated = await adminService.updateUser(userObj.id, {
        is_active: !userObj.is_active
      });
      setUsers((prev) => prev.map((u) => (u.id === userObj.id ? updated : u)));
      addToast({
        type: updated.is_active ? 'success' : 'warning',
        message: `User ${userObj.email} is now ${updated.is_active ? 'Active' : 'Disabled'}.`
      });
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to update user status.' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">
            User & Organizer Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            View registered attendees, organizers, and manage platform permissions.
          </p>
        </div>

        {/* Filter / Search */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <form onSubmit={(e) => { e.preventDefault(); fetchUsers(); }} className="relative w-full sm:w-60">
            <input
              type="text"
              placeholder="Search user, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs focus:ring-2 focus:ring-primary-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </form>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-white dark:bg-dark-500 border border-slate-200 dark:border-dark-400 text-xs font-semibold"
          >
            <option value="">All Roles</option>
            <option value="ATTENDEE">Attendees</option>
            <option value="ORGANIZER">Organizers</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={6} />
      ) : users.length === 0 ? (
        <div className="p-12 rounded-3xl glass-card text-center text-xs text-slate-400">
          No users match your criteria.
        </div>
      ) : (
        <div className="rounded-3xl glass-card border border-slate-200 dark:border-dark-300 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-dark-600/80 border-b border-slate-200 dark:border-dark-400 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Organization</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-400 font-medium text-slate-700 dark:text-slate-200">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-dark-400/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.display_avatar}
                          alt={u.full_name}
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-dark-400"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{u.full_name || u.username}</div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                          : u.role === 'ORGANIZER'
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {u.organization_name || '—'}
                    </td>

                    <td className="p-4 whitespace-nowrap text-slate-400">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>

                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        u.is_active
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-rose-50 text-rose-600'
                      }`}>
                        {u.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleActive(u)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                            u.is_active
                              ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                              : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                          }`}
                        >
                          {u.is_active ? 'Disable' : 'Enable'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
