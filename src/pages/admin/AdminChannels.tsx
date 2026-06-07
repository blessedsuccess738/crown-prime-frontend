import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Radio, Plus, Trash2, ToggleLeft, ToggleRight, ExternalLink, Info } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminChannels() {
  const [channels, setChannels] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', link: '', channelId: '', isRequired: true });
  const [showForm, setShowForm] = useState(false);

  const load = () => api.get('/admin/channels').then(r => setChannels(r.data.channels || []));
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.name || !form.link) return toast.error('Name and link required');
    await api.post('/admin/channels', form);
    toast.success('✅ Channel added!');
    setForm({ name: '', link: '', channelId: '', isRequired: true });
    setShowForm(false);
    load();
  };

  const toggle = async (id: number, field: string, value: boolean) => {
    await api.patch(`/admin/channels/${id}`, { [field]: !value });
    load();
  };

  const remove = async (id: number) => {
    await api.delete(`/admin/channels/${id}`);
    toast.success('Channel removed');
    load();
  };

  const required = channels.filter(c => c.isRequired);
  const optional = channels.filter(c => !c.isRequired);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Channel Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{channels.length} channels · {required.length} required</p>
        </div>
        <button className="btn-primary flex items-center gap-2 py-2.5 px-4 text-sm" onClick={() => setShowForm(!showForm)}>
          <Plus size={15} /> Add Channel
        </button>
      </div>

      {/* Info Banner */}
      <div className="rounded-xl p-4 flex gap-3" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}>
        <Info size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#818cf8' }} />
        <div className="text-sm text-gray-400 space-y-0.5">
          <p><span className="text-white font-semibold">Required channels</span> — users must join before accessing the platform.</p>
          <p>Channel ID: <code className="text-indigo-400 bg-indigo-400/10 px-1 rounded">@channelname</code> or <code className="text-indigo-400 bg-indigo-400/10 px-1 rounded">-1001234567890</code></p>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 space-y-4"
          style={{ background: 'rgba(245,200,66,0.04)', border: '1px solid rgba(245,200,66,0.2)' }}>
          <p className="font-bold flex items-center gap-2"><Plus size={15} style={{ color: '#f5c842' }} /> New Channel</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 font-semibold mb-1.5 block">Channel Name</label>
              <input className="input" placeholder="My Casino Channel"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-semibold mb-1.5 block">Invite Link</label>
              <input className="input" placeholder="https://t.me/..."
                value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-semibold mb-1.5 block">Channel ID (optional)</label>
              <input className="input" placeholder="@channelname"
                value={form.channelId} onChange={e => setForm({ ...form, channelId: e.target.value })} />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`toggle-track ${form.isRequired ? 'toggle-on' : ''}`}
                  style={{ background: form.isRequired ? '#f5c842' : '#374151' }}
                  onClick={() => setForm({ ...form, isRequired: !form.isRequired })}>
                  <div className="toggle-thumb" />
                </div>
                <span className="text-sm font-semibold">Required to join</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary flex-1 flex items-center justify-center gap-2" onClick={add}>
              <Plus size={15} /> Add Channel
            </button>
            <button className="btn-secondary px-5" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </motion.div>
      )}

      {/* Required */}
      {required.length > 0 && (
        <div>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Required ({required.length})</h2>
          <div className="space-y-3">
            {required.map((c: any, i: number) => <ChannelCard key={c.id} c={c} i={i} toggle={toggle} remove={remove} />)}
          </div>
        </div>
      )}

      {/* Optional */}
      {optional.length > 0 && (
        <div>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Optional ({optional.length})</h2>
          <div className="space-y-3">
            {optional.map((c: any, i: number) => <ChannelCard key={c.id} c={c} i={i} toggle={toggle} remove={remove} />)}
          </div>
        </div>
      )}

      {channels.length === 0 && !showForm && (
        <div className="text-center py-16 rounded-2xl" style={{ background: '#13131f', border: '1px solid #1e1e30' }}>
          <Radio size={36} className="mx-auto mb-3 opacity-20" />
          <p className="text-gray-500">No channels added yet</p>
          <button className="mt-3 text-sm text-yellow-400 hover:underline" onClick={() => setShowForm(true)}>
            Add your first channel
          </button>
        </div>
      )}
    </div>
  );
}

function ChannelCard({ c, i, toggle, remove }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
      className="rounded-2xl p-4" style={{ background: '#13131f', border: '1px solid #1e1e30' }}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(99,102,241,0.15)' }}>
            <Radio size={17} style={{ color: '#818cf8' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold">{c.name}</p>
              {c.isRequired && <span className="badge badge-pending" style={{ fontSize: 9 }}>Required</span>}
            </div>
            <a href={c.link} target="_blank" rel="noreferrer"
              className="text-xs text-blue-400 hover:underline flex items-center gap-1">
              {c.link.substring(0, 30)}{c.link.length > 30 ? '…' : ''} <ExternalLink size={10} />
            </a>
            {c.channelId && <p className="text-xs text-gray-500 font-mono mt-0.5">{c.channelId}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => toggle(c.id, 'isRequired', c.isRequired)}
            className="text-xs font-bold px-2 py-1 rounded-lg transition-all"
            style={{
              background: c.isRequired ? 'rgba(245,200,66,0.1)' : 'rgba(255,255,255,0.05)',
              color: c.isRequired ? '#f5c842' : '#6b7280',
            }}>
            {c.isRequired ? '🔒 Req' : '✓ Opt'}
          </button>
          <button onClick={() => toggle(c.id, 'isActive', c.isActive)}
            style={{ color: c.isActive ? '#10b981' : '#6b7280' }}>
            {c.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
          </button>
          <button onClick={() => remove(c.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-all">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
