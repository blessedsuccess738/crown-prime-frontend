import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, Filter } from 'lucide-react';
import api from '../../services/api';

const TYPE_COLORS: Record<string, string> = {
  deposit: '#10b981',
  withdrawal: '#f97316',
  game_win: '#f5c842',
  game_loss: '#ef4444',
  bonus: '#8b5cf6',
  referral: '#06b6d4',
  admin_credit: '#6366f1',
  admin_debit: '#ec4899',
};

export default function AdminTransactions() {
  const [txs, setTxs] = useState<any[]>([]);
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.get(`/admin/transactions?page=${page}&type=${type}`)
      .then(r => setTxs(r.data.transactions || []));
  }, [page, type]);

  const TYPES = ['', 'deposit', 'withdrawal', 'game_win', 'game_loss', 'bonus', 'referral', 'admin_credit', 'admin_debit'];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Transactions</h1>
          <p className="text-sm text-gray-500 mt-0.5">All platform transactions</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400 px-3 py-1.5 rounded-xl"
          style={{ background: '#13131f', border: '1px solid #1e1e30' }}>
          <Filter size={12} /> Filter by type
        </div>
      </div>

      {/* Type Filters */}
      <div className="flex gap-2 flex-wrap">
        {TYPES.map(t => {
          const color = TYPE_COLORS[t] || '#f5c842';
          return (
            <button key={t} onClick={() => { setType(t); setPage(1); }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize"
              style={{
                background: type === t ? (t ? `${color}20` : 'linear-gradient(135deg,#f5c842,#d99a1a)') : '#13131f',
                border: `1px solid ${type === t ? (t ? color + '44' : 'transparent') : '#1e1e30'}`,
                color: type === t ? (t ? color : '#000') : '#9ca3af',
              }}>
              {t || 'All'}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden" style={{ border: '1px solid #1e1e30' }}>
        <table className="w-full text-sm">
          <thead style={{ background: '#0f0f1a' }}>
            <tr>
              {['ID', 'User', 'Type', 'Amount', 'Description', 'Date'].map(h => (
                <th key={h} className="px-4 py-3.5 text-left text-xs text-gray-500 font-semibold uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {txs.map((tx: any, i: number) => {
              const amt = Number(tx.amount);
              const color = TYPE_COLORS[tx.type] || '#9ca3af';
              return (
                <motion.tr key={tx.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="table-row-hover transition-colors"
                  style={{ borderTop: '1px solid #1e1e30', background: '#13131f' }}>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">#{tx.id}</td>
                  <td className="px-4 py-3 font-semibold text-xs">#{tx.userId}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-lg text-xs font-bold"
                      style={{ background: `${color}18`, color }}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-black" style={{ color: amt > 0 ? '#10b981' : '#ef4444' }}>
                    {amt > 0 ? '+' : ''}{amt.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs max-w-xs truncate">{tx.description}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </motion.tr>
              );
            })}
            {txs.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-500" style={{ background: '#13131f' }}>
                  <ArrowUpDown size={28} className="mx-auto mb-2 opacity-20" />
                  <p>No transactions found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Page {page} · {txs.length} records</span>
        <div className="flex gap-2">
          <button className="btn-secondary px-4 py-2 text-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
          <button className="btn-secondary px-4 py-2 text-sm" onClick={() => setPage(p => p + 1)} disabled={txs.length < 50}>Next →</button>
        </div>
      </div>
    </div>
  );
}
