import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Plus, Trash2, Copy, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminPromos() {
  const [promos, setPromos] = useState<any[]>([]);
  const [form, setForm] = useState({ code: '', reward: '', maxUses: '100', expiresAt: '' });
  const [copied, setCopied] = useState<string | null>(null);

  const load = () => api.get('/admin/promos').then(r => setPromos(r.data.promos || []));
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.code || !form.reward) return toast.error('Code and reward required');
    await api.post('/admin/promos', { ...form, reward: Number(form.reward), maxUses: Number(form.maxUses) });
    toast.success('🎉 Promo code created!');
    setForm({ code: '', reward: '', maxUses: '100', expiresAt: '' });
    load();
  };

  const deactivate = async (id: number) => {
    await api.delete(`/admin/promos/${id}`);
    toast.success('Promo deactivated');
    load();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const active = promos.filter(p => p.isActive);
  const inactive = promos.filter(p => !p.isActive);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Promo Codes</h1>
        <p className="text-sm text-gray-500 mt-0.5">{active.length} active · {inactive.length} inactive</p>
      </div>

      {/* Create Form */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 space-y-4"
        style={{ background: 'linear-gradient(135deg,rgba(245,200,66,0.06),rgba(245,200,66,0.02))', border: '1px solid rgba(245,200,66,0.2)' }}>
        <div className="flex items-center gap-2">
          <Plus size={16} style={{ color: '#f5c842' }} />
          <p className="font-bold">Create New Promo Code</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 font-semibold mb-1.5 block">Code</label>
            <input className="input font-mono uppercase tracking-widest" placeholder="WELCOME100"
              value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          </div>
          <div>
            <label className="text-xs text-gray-400 font-semibold mb-1.5 block">Reward (coins)</label>
            <input className="input" type="number" placeholder="500"
              value={form.reward} onChange={e => setForm({ ...form, reward: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-gray-400 font-semibold mb-1.5 block">Max Uses</label>
            <input className="input" type="number"
              value={form.maxUses} onChange={e => setForm({ ...form, maxUses: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-gray-400 font-semibold mb-1.5 block">Expires At (optional)</label>
            <input className="input" type="datetime-local"
              value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} />
          </div>
        </div>
        <button className="btn-primary w-full flex items-center justify-center gap-2" onClick={create}>
          <Plus size={16} /> Create Promo Code
        </button>
      </motion.div>

      {/* Active Promos */}
      {active.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Active ({active.length})</h2>
          <div className="space-y-3">
            <AnimatePresence>
              {active.map((p: any, i: number) => (
                <motion.div key={p.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-2xl p-4 flex items-center justify-between"
                  style={{ background: '#13131f', border: '1px solid rgba(245,200,66,0.15)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,200,66,0.1)' }}>
                      <Tag size={15} style={{ color: '#f5c842' }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-black text-lg tracking-wider" style={{ color: '#f5c842' }}>{p.code}</p>
                        <button onClick={() => copyCode(p.code)}
                          className="text-gray-500 hover:text-gray-300 transition-colors">
                          {copied === p.code ? <CheckCircle size={13} className="text-green-400" /> : <Copy size={13} />}
                        </button>
                      </div>
                      <p className="text-sm text-gray-400">{Number(p.reward).toLocaleString()} coins · {p.usedCount}/{p.maxUses} used</p>
                      {p.expiresAt && <p className="text-xs text-gray-500">Expires {new Date(p.expiresAt).toLocaleDateString()}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Usage bar */}
                    <div className="hidden sm:block w-24">
                      <p className="text-xs text-gray-500 mb-1 text-right">{Math.round((p.usedCount / p.maxUses) * 100)}%</p>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1e1e30' }}>
                        <div className="h-full rounded-full" style={{ background: '#f5c842', width: `${Math.min(100, (p.usedCount / p.maxUses) * 100)}%` }} />
                      </div>
                    </div>
                    <span className="badge badge-win">Active</span>
                    <button onClick={() => deactivate(p.id)}
                      className="p-2 rounded-xl text-red-400 hover:bg-red-400/10 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Inactive */}
      {inactive.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Inactive ({inactive.length})</h2>
          <div className="space-y-2">
            {inactive.map((p: any) => (
              <div key={p.id} className="rounded-xl p-3 flex items-center justify-between opacity-50"
                style={{ background: '#13131f', border: '1px solid #1e1e30' }}>
                <div>
                  <p className="font-bold text-gray-400 tracking-wider">{p.code}</p>
                  <p className="text-xs text-gray-500">{Number(p.reward).toLocaleString()} coins · {p.usedCount} uses</p>
                </div>
                <span className="badge badge-loss">Inactive</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {promos.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Tag size={32} className="mx-auto mb-2 opacity-20" />
          <p>No promo codes yet</p>
        </div>
      )}
    </div>
  );
}
