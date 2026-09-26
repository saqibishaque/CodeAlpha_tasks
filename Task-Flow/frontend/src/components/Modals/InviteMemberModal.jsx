import React, { useState, useEffect } from 'react';
import { X, UserPlus, Mail, Shield, Check } from 'lucide-react';
import api from '../../services/api';

const InviteMemberModal = ({ isOpen, onClose, projectId, currentMembers, onMemberAdded }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.get('/auth/users')
        .then((res) => setAllUsers(res.data))
        .catch((err) => console.error('Failed to load users:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter out existing members
  const memberUserIds = new Set(currentMembers.map((m) => m.userId));
  const availableUsers = allUsers.filter((u) => !memberUserIds.has(u.id));

  const handleInvite = async (userIdOrEmail) => {
    try {
      setLoading(true);
      setError('');
      const payload = typeof userIdOrEmail === 'string' && userIdOrEmail.includes('@')
        ? { email: userIdOrEmail, role }
        : { userId: userIdOrEmail, role };

      const res = await api.post(`/projects/${projectId}/members`, payload);
      onMemberAdded(res.data);
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-100 text-base">Invite Team Member</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {error}
          </div>
        )}

        {/* Quick Add Available Users */}
        {availableUsers.length > 0 && (
          <div className="mb-5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Available Teammates
            </label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto kanban-column-scroll">
              {availableUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                      alt={u.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-xs font-semibold text-slate-200">{u.name}</div>
                      <div className="text-[10px] text-slate-400">{u.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleInvite(u.id)}
                    disabled={loading}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold rounded-lg transition"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invite by Email */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (email.trim()) handleInvite(email.trim());
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Or Invite by Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="w-full text-xs bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Project Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full text-xs bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="MEMBER">Member (Can edit tasks and comment)</option>
              <option value="ADMIN">Admin (Full project settings access)</option>
              <option value="VIEWER">Viewer (Read only)</option>
            </select>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Send Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteMemberModal;
