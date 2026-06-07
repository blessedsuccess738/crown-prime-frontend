import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Gamepad2, DollarSign, Clock, CheckCircle, ArrowUpRight, ArrowDownRight, Activity, Zap } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

const mockSpark = (base = 40, len = 8) =>
  Array.from({ length: len }, (_, i) => ({ v: base + Math.floor(Math.sin(i) * 15 + i * 4) }));

function StatCard({ label, value, icon: Icon, color, delta, spark, delay = 0 }: any) {
  const positive = delta >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className="rounded-2xl p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg,#13131f,#0f0f1a)', border: '1px solid #1e1e30' }}
    >
      <div className="absolute top-0 right-0 w-28 h-28 rounded-full opacity-5 pointer-events-none"
        style={{ background: color, transform: 'translate(35%,-35%)' }} />
      <div className="flex items-start justify-between mb-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18` }}>
          <Icon size={17} style={{ color }} />
        </div>
        {delta !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-lg ${positive ? 'text-green-400' : 'text-red-400'}`}
            style={{ background: positive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}>
            {positive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}{Math.abs(delta)}%
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-2">{label}</p>
      <p className="text-xl font-black text-white mt-0.5 leading-tight">{value}</p>
      {spark && (
        <div className="mt-2 h-8 opacity-50">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spark}>
              <defs>
                <linearGradient id={`sg${label.replace(/\s/g,'')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.5} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5}
                fill={`url(#sg${label.replace(/\s/g,'')})`} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setData(r.data)).catch(() => {});
  }, []);

  if (!data) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: '#f5c842', borderTopColor: 'transparent' }} />
    </div>
  );

  const STATS = [
    { label: 'Total Users', value: data.stats.totalUsers.toLocaleString(), icon: Users, color: '#6366f1', delta: 12, spark: mockSpark(30) },
    { label: 'Total Deposits', value: `₦${Number(data.stats.totalDeposits || 0).toLocaleString()}`, icon: TrendingUp, color: '#10b981', delta: 8, spark: mockSpark(50) },
    { label: 'House Profit', value: Number(data.stats.houseProfit || 0).toLocaleString() + ' coins', icon: DollarSign, color: '#f5c842', delta: 5, spark: mockSpark(40) },
    { label: 'Total Games', value: data.stats.totalGames.toLocaleString(), icon: Gamepad2, color: '#ec4899', delta: 22, spark: mockSpark(20) },
    { label: 'Pending Withdrawals', value: data.stats.pendingWithdrawals, icon: Clock, color: '#f97316', delta: -3 },
    { label: 'Pending Amount', value: `₦${Number(data.stats.pendingWithdrawalsAmount || 0).toLocaleString()}`, icon: CheckCircle, color: '#ef4444', delta: -1 },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Crown Prime Casino — Admin Overview</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-green-400"
          style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <Activity size={11} className="animate-pulse" /> Live
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {STATS.map((s, i) => <StatCard key={s.label} {...s} delay={i * 0.07} />)}
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-5 gap-4">
        {/* Recent Users */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="col-span-3 rounded-2xl p-5" style={{ background: '#13131f', border: '1px solid #1e1e30' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap size={14} style={{ color: '#f5c842' }} />
              <h2 className="font-bold text-sm">Recent Users</h2>
            </div>
            <span className="text-xs text-gray-500">{data.recentUsers?.length || 0} shown</span>
          </div>
          <div className="space-y-1">
            {data.recentUsers?.slice(0, 7).map((u: any, i: number) => (
              <motion.div key={u.id}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="flex items-center gap-3 py-2 px-2 rounded-xl transition-colors"
                style={{ background: 'transparent' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                  style={{ background: 'rgba(245,200,66,0.12)', color: '#f5c842' }}>
                  {(u.firstName || u.username || 'U')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{u.firstName || u.username || `User #${u.id}`}</p>
                  <p className="text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="text-xs text-gray-600 font-mono">#{u.id}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Platform Health */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="col-span-2 rounded-2xl p-5 flex flex-col gap-4" style={{ background: '#13131f', border: '1px solid #1e1e30' }}>
          <h2 className="font-bold text-sm">Platform Health</h2>
          <div className="space-y-3">
            {[
              { label: 'Active Today', pct: 72, color: '#10b981' },
              { label: 'Games Today', pct: 58, color: '#6366f1' },
              { label: 'Win Rate', pct: 47, color: '#f5c842' },
              { label: 'Deposit Rate', pct: 63, color: '#ec4899' },
            ].map(({ label, pct, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">{label}</span>
                  <span className="font-bold" style={{ color }}>{pct}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1e1e30' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.7, duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg,${color},${color}88)` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-auto pt-3" style={{ borderTop: '1px solid #1e1e30' }}>
            <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">Services</p>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: 'API', ok: true },
                { label: 'Bot', ok: true },
                { label: 'Paystack', ok: true },
                { label: 'Database', ok: true },
              ].map(({ label, ok }) => (
                <div key={label} className="flex items-center gap-1.5 rounded-lg p-1.5" style={{ background: '#0f0f1a' }}>
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: ok ? '#10b981' : '#ef4444' }} />
                  <span className="text-xs text-gray-400">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
