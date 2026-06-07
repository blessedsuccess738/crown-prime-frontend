import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Ban, CheckCircle, PlusCircle, MinusCircle, Bell, X, Shield, Coins } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<any>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustNote, setAdjustNote] = useState('');
  const [notifMsg, setNotifMsg] = useState('');

  const load = () => {
    api.get(`/admin/users?page=${page}&search=${search}`)
      .then(r => { setUsers(r.data.users || []); setTotal(r.data.total || 0); });
  };
  useEffect(() => { load(); }, [page, search]);

  const ban = async (id: number, banned: boolean) => {
    await api.post(`/admin/users/${id}/${banned ? 'unban' : 'ban'}`, { reason: 'Admin action' });
    toast.success(banned ? 'User unbanned' : 'User banned');
    load();
  };

  const adjust = async (type: 'add' | 'deduct') => {
    if (!selected || !adjustAmount) return;
    await api.post(`/admin/users/${selected.id}/adjust-balance`, { amount: Number(adjustAmount), type, note: adjustNote });
    toast.success(`Balance ${type === 'add' ? 'added ✅' : 'deducted ✅'}`);
    setAdjustAmount(''); setAdjustNote('');
  };

  const notify = async () => {
    if (!selected || !notifMsg) return;
    await api.post(`/admin/users/${selected.id}/notify`, { title: 'Admin Message', message: notifMsg });
    toast.success('Notification sent 🔔');
    setNotifMsg('');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total.toLocaleString()} total registered</p>
        </div>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input className="input pl-10 text-sm" placeholder="Search by name, username…"
          value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
      </div>

      <div className="grid grid-cols-5 gap-4">
        {/* User List */}
        <div className="col-span-3 space-y-2">
          {users.map((u: any, i: number) => (
            <motion.div key={u.id}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setSelected(u)}
              className="rounded-xl p-3 cursor-pointer flex items-center gap-3 transition-all"
              style={{
                background: selected?.id === u.id ? 'rgba(245,200,66,0.06)' : '#13131f',
                border: `1px solid ${selected?.id === u.id ? 'rgba(245,200,66,0.3)' : '#1e1e30'}`,
              }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                {(u.firstName || u.username || 'U')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{u.firstName || u.username || `User #${u.id}`}</p>
                <p className="text-xs text-gray-500">#{u.id} · {u.role} · {new Date(u.createdAt).toLocaleDateString()}</p>
              </div>
              {u.isBanned && <span className="badge badge-loss text-xs">Banned</span>}
              {u.role === 'admin' && <span className="badge badge-info text-xs">Admin</span>}
            </motion.div>
          ))}
          {users.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Search size={32} className="mx-auto mb-2 opacity-30" />
              <p>No users found</p>
            </div>
          )}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-gray-500">Page {page}</span>
            <div className="flex gap-2">
              <button className="btn-secondary px-4 py-2 text-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
              <button className="btn-secondary px-4 py-2 text-sm" onClick={() => setPage(p => p + 1)} disabled={users.length < 20}>Next →</button>
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
              className="col-span-2 rounded-2xl p-5 space-y-4 sticky top-16 self-start"
              style={{ background: '#13131f', border: '1px solid rgba(245,200,66,0.2)' }}>
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-black"
                  style={{ background: 'rgba(245,200,66,0.1)', color: '#f5c842' }}>
                  {(selected.firstName || selected.username || 'U')[0].toUpperCase()}
                </div>
                <button onClick={() => setSelected(null)} className="p-1 rounded-lg text-gray-500 hover:text-white transition-colors"
                  style={{ background: '#0f0f1a' }}>
                  <X size={14} />
                </button>
              </div>
              <div>
                <p className="font-black text-lg">{selected.firstName} {selected.lastName}</p>
                <p className="text-sm text-gray-400">@{selected.username || 'N/A'}</p>
                <p className="text-xs text-gray-500 mt-0.5">TG: {selected.telegramId} · Joined {new Date(selected.createdAt).toLocaleDateString()}</p>
              </div>

              <button
                className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                style={{
                  background: selected.isBanned ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${selected.isBanned ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  color: selected.isBanned ? '#10b981' : '#ef4444',
                }}
                onClick={() => { ban(selected.id, selected.isBanned); setSelected({ ...selected, isBanned: !selected.isBanned }); }}>
                {selected.isBanned ? <><CheckCircle size={14} /> Unban User</> : <><Ban size={14} /> Ban User</>}
              </button>

              {/* Adjust Balance */}
              <div className="rounded-xl p-3 space-y-2" style={{ background: '#0f0f1a', border: '1px solid #1e1e30' }}>
                <p className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                  <Coins size={12} style={{ color: '#f5c842' }} /> Adjust Balance
                </p>
                <input className="input text-sm py-2" type="number" placeholder="Amount" value={adjustAmount} onChange={e => setAdjustAmount(e.target.value)} />
                <input className="input text-sm py-2" placeholder="Note (optional)" value={adjustNote} onChange={e => setAdjustNote(e.target.value)} />
                <div className="flex gap-2">
                  <button onClick={() => adjust('add')} className="flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all text-green-400"
                    style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <PlusCircle size={12} /> Add
                  </button>
                  <button onClick={() => adjust('deduct')} className="flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all text-red-400"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <MinusCircle size={12} /> Deduct
                  </button>
                </div>
              </div>

              {/* Notify */}
              <div className="rounded-xl p-3 space-y-2" style={{ background: '#0f0f1a', border: '1px solid #1e1e30' }}>
                <p className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                  <Bell size={12} style={{ color: '#6366f1' }} /> Send Notification
                </p>
                <input className="input text-sm py-2" placeholder="Message…" value={notifMsg} onChange={e => setNotifMsg(e.target.value)} />
                <button onClick={notify} className="btn-secondary w-full py-2 text-xs flex items-center justify-center gap-1.5">
                  <Bell size={12} /> Send
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
