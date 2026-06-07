import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, Users, Gamepad2, DollarSign } from 'lucide-react';
import api from '../../services/api';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-3 text-sm shadow-xl" style={{ background: '#13131f', border: '1px solid #1e1e30' }}>
      {label && <p className="text-gray-400 mb-1 text-xs">{label}</p>}
      {payload.map((p: any) => (
        <p key={p.name} className="font-bold" style={{ color: p.color }}>
          {p.name}: {Number(p.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
};

const COLORS = ['#f5c842', '#6366f1', '#10b981', '#ec4899', '#f97316', '#06b6d4'];

export default function AdminAnalytics() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get('/admin/analytics').then(r => setData(r.data)).catch(() => {});
  }, []);

  if (!data) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: '#f5c842', borderTopColor: 'transparent' }} />
    </div>
  );

  const revenueData = data.revenueByDay?.map((d: any) => ({
    date: d.date?.slice(5),
    bets: Number(d.bets || 0),
    wins: Number(d.wins || 0),
    profit: Math.max(0, Number(d.bets || 0) - Number(d.wins || 0)),
  })) || [];

  const userGrowthData = data.userGrowth?.map((d: any) => ({
    date: d.date?.slice(5),
    users: Number(d.count),
  })) || [];

  const topGames = data.topGames || [];
  const pieData = topGames.slice(0, 6).map((g: any) => ({ name: g.gameType, value: Number(g.plays || 0) }));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Platform performance & insights</p>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Revenue', value: `₦${Number(data.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: '#f5c842' },
          { label: 'New Users (7d)', value: userGrowthData.reduce((s: number, d: any) => s + d.users, 0), icon: Users, color: '#6366f1' },
          { label: 'Total Bets', value: revenueData.reduce((s: number, d: any) => s + d.bets, 0).toLocaleString(), icon: Gamepad2, color: '#10b981' },
          { label: 'House Edge', value: revenueData.reduce((s: number, d: any) => s + d.profit, 0).toLocaleString(), icon: TrendingUp, color: '#ec4899' },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="rounded-2xl p-4" style={{ background: '#13131f', border: '1px solid #1e1e30' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ background: `${color}18` }}>
              <Icon size={15} style={{ color }} />
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
            <p className="text-xl font-black mt-0.5">{value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* User Growth */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl p-5" style={{ background: '#13131f', border: '1px solid #1e1e30' }}>
          <h2 className="font-bold text-sm mb-4 flex items-center gap-2">
            <Users size={14} style={{ color: '#6366f1' }} /> User Growth
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={userGrowthData}>
              <defs>
                <linearGradient id="ugGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e30" />
              <XAxis dataKey="date" stroke="#374151" tick={{ fontSize: 10, fill: '#6b7280' }} />
              <YAxis stroke="#374151" tick={{ fontSize: 10, fill: '#6b7280' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="users" name="Users" stroke="#6366f1" strokeWidth={2}
                fill="url(#ugGrad)" dot={false} activeDot={{ r: 4, fill: '#6366f1' }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Revenue */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="rounded-2xl p-5" style={{ background: '#13131f', border: '1px solid #1e1e30' }}>
          <h2 className="font-bold text-sm mb-4 flex items-center gap-2">
            <DollarSign size={14} style={{ color: '#10b981' }} /> Daily Revenue
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e30" />
              <XAxis dataKey="date" stroke="#374151" tick={{ fontSize: 10, fill: '#6b7280' }} />
              <YAxis stroke="#374151" tick={{ fontSize: 10, fill: '#6b7280' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="bets" name="Bets" fill="#6366f1" radius={[3,3,0,0]} maxBarSize={12} />
              <Bar dataKey="wins" name="Wins" fill="#10b981" radius={[3,3,0,0]} maxBarSize={12} />
              <Bar dataKey="profit" name="Profit" fill="#f5c842" radius={[3,3,0,0]} maxBarSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Deposits */}
        {data.depositsByDay?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="rounded-2xl p-5" style={{ background: '#13131f', border: '1px solid #1e1e30' }}>
            <h2 className="font-bold text-sm mb-4 flex items-center gap-2">
              <TrendingUp size={14} style={{ color: '#f97316' }} /> Deposits (₦)
            </h2>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={data.depositsByDay.map((d: any) => ({ date: d.date?.slice(5), amount: Number(d.total), count: Number(d.count) }))}>
                <defs>
                  <linearGradient id="depGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e30" />
                <XAxis dataKey="date" stroke="#374151" tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis stroke="#374151" tick={{ fontSize: 10, fill: '#6b7280' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="amount" name="₦ Amount" stroke="#f97316" strokeWidth={2}
                  fill="url(#depGrad)" dot={false} activeDot={{ r: 4, fill: '#f97316' }} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Game Distribution Pie */}
        {pieData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="rounded-2xl p-5" style={{ background: '#13131f', border: '1px solid #1e1e30' }}>
            <h2 className="font-bold text-sm mb-4 flex items-center gap-2">
              <Gamepad2 size={14} style={{ color: '#ec4899' }} /> Game Distribution
            </h2>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70}
                  paddingAngle={3} dataKey="value">
                  {pieData.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconSize={8} iconType="circle"
                  formatter={(v) => <span style={{ color: '#9ca3af', fontSize: 11 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>
    </div>
  );
}
