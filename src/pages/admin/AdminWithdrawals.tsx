import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, CheckCircle, XCircle, Clock, Loader } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_CONFIG: Record<string, { color: string; icon: any; badge: string }> = {
  pending: { color: '#f5c842', icon: Clock, badge: 'badge-pending' },
  processing: { color: '#6366f1', icon: Loader, badge: 'badge-info' },
  success: { color: '#10b981', icon: CheckCircle, badge: 'badge-win' },
  rejected: { color: '#ef4444', icon: XCircle, badge: 'badge-loss' },
  failed: { color: '#ef4444', icon: XCircle, badge: 'badge-loss' },
};

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState<number | null>(null);

  const load = () => api.get(`/admin/withdrawals?status=${status}`)
    .then(r => setWithdrawals(r.data.withdrawals || []));

  useEffect(() => { load(); }, [status]);

  const approve = async (id: number) => {
    setLoading(id);
    try {
      await api.post(`/admin/withdrawals/${id}/approve`);
      toast.success('✅ Withdrawal approved & transfer initiated!');
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to approve');
    }
    setLoading(null);
  };

  const reject = async (id: number) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    await api.post(`/admin/withdrawals/${id}/reject`, { reason });
    toast.success('Withdrawal rejected and refunded');
    load();
  };

  const statuses = ['pending', 'processing', 'success', 'rejected', 'failed'];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black">Withdrawals</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage user payout requests</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {statuses.map(s => {
          const cfg = STATUS_CONFIG[s];
          return (
            <button key={s} onClick={() => setStatus(s)}
              className="px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all flex items-center gap-1.5"
              style={{
                background: status === s ? `${cfg.color}20` : '#13131f',
                border: `1px solid ${status === s ? cfg.color + '44' : '#1e1e30'}`,
                color: status === s ? cfg.color : '#9ca3af',
              }}>
              {s}
              {status === s && withdrawals.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-xs font-black"
                  style={{ background: cfg.color, color: '#000', fontSize: 9 }}>
                  {withdrawals.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Cards */}
      <AnimatePresence mode="wait">
        <motion.div key={status} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="space-y-3">
          {withdrawals.length === 0 && (
            <div className="text-center py-16 rounded-2xl" style={{ background: '#13131f', border: '1px solid #1e1e30' }}>
              <CreditCard size={36} className="mx-auto mb-3 opacity-20" />
              <p className="text-gray-500">No {status} withdrawals</p>
            </div>
          )}
          {withdrawals.map((w: any, i: number) => (
            <motion.div key={w.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl p-5" style={{ background: '#13131f', border: '1px solid #1e1e30' }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-black"
                    style={{ background: 'rgba(245,200,66,0.1)', color: '#f5c842' }}>
                    {(w.firstName || w.username || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold">{w.firstName || w.username || `User #${w.userId}`}</p>
                    <p className="text-sm text-gray-400">{w.bankName}</p>
                    <p className="text-xs font-bold text-green-400">{w.accountName}</p>
                    <p className="text-xs text-gray-500 font-mono">{w.accountNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black">₦{Number(w.amount).toLocaleString()}</p>
                  <span className={`badge ${STATUS_CONFIG[w.status]?.badge || 'badge-pending'} mt-1`}>{w.status}</span>
                  <p className="text-xs text-gray-500 mt-1">{new Date(w.createdAt).toLocaleString()}</p>
                </div>
              </div>
              {w.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                    style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}
                    onClick={() => approve(w.id)} disabled={loading === w.id}>
                    {loading === w.id
                      ? <><Loader size={14} className="animate-spin" /> Processing…</>
                      : <><CheckCircle size={14} /> Approve & Transfer</>}
                  </button>
                  <button
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}
                    onClick={() => reject(w.id)}>
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
