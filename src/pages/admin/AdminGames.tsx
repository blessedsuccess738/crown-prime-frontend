import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, TrendingUp, TrendingDown, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminGames() {
  const [games, setGames] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);

  useEffect(() => {
    api.get('/admin/games/settings').then(r => setGames(r.data.games || []));
    api.get('/admin/games/analytics').then(r => setAnalytics(r.data.analytics || []));
  }, []);

  const toggle = async (gameType: string, current: boolean) => {
    await api.patch(`/admin/games/settings/${gameType}`, { isEnabled: !current });
    setGames(games.map(g => g.gameType === gameType ? { ...g, isEnabled: !current } : g));
    toast.success(`${gameType} ${!current ? '✅ enabled' : '❌ disabled'}`);
  };

  const update = async (gameType: string, field: string, value: string) => {
    await api.patch(`/admin/games/settings/${gameType}`, { [field]: Number(value) });
    toast.success('Settings updated');
  };

  const analyticsMap = analytics.reduce((a: any, g: any) => { a[g.gameType] = g; return a; }, {});

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black">Game Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">{games.length} games configured · {games.filter(g => g.isEnabled).length} enabled</p>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Enabled', value: games.filter(g => g.isEnabled).length, color: '#10b981' },
          { label: 'Disabled', value: games.filter(g => !g.isEnabled).length, color: '#ef4444' },
          { label: 'Total Plays', value: analytics.reduce((s, g) => s + Number(g.plays || 0), 0).toLocaleString(), color: '#6366f1' },
          { label: 'House Profit', value: analytics.reduce((s, g) => s + (Number(g.totalBet || 0) - Number(g.totalWon || 0)), 0).toFixed(0), color: '#f5c842' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl p-3" style={{ background: '#13131f', border: '1px solid #1e1e30' }}>
            <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
            <p className="text-xl font-black mt-0.5" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {games.map((g: any, i: number) => {
          const stat = analyticsMap[g.gameType];
          const profit = stat ? Number(stat.totalBet) - Number(stat.totalWon) : 0;
          const winRate = stat?.plays > 0 ? ((stat.wins / stat.plays) * 100).toFixed(1) : '0';
          return (
            <motion.div key={g.gameType}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl p-4 transition-all"
              style={{ background: '#13131f', border: `1px solid ${g.isEnabled ? '#1e1e30' : '#1e1e30'}` }}>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: g.isEnabled ? 'rgba(245,200,66,0.1)' : 'rgba(255,255,255,0.04)' }}>
                  {g.icon || '🎮'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold">{g.displayName}</p>
                  <p className="text-xs text-gray-500">{g.gameType} · House edge: <span className="text-yellow-400 font-semibold">{(Number(g.houseEdge) * 100).toFixed(1)}%</span></p>
                </div>
                {/* Toggle */}
                <button onClick={() => toggle(g.gameType, g.isEnabled)}
                  className="flex-shrink-0 transition-all"
                  style={{ color: g.isEnabled ? '#10b981' : '#6b7280' }}>
                  {g.isEnabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                </button>
              </div>

              {stat && (
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[
                    { label: 'Plays', value: Number(stat.plays).toLocaleString(), color: '#6366f1' },
                    { label: 'Win Rate', value: `${winRate}%`, color: '#f5c842' },
                    { label: 'Total Bet', value: Number(stat.totalBet || 0).toLocaleString(), color: '#06b6d4' },
                    { label: 'Profit', value: profit.toFixed(0), color: profit >= 0 ? '#10b981' : '#ef4444' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="text-center rounded-xl p-2" style={{ background: '#0f0f1a' }}>
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className="font-bold text-sm mt-0.5" style={{ color }}>{value}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                {[
                  { field: 'minBet', label: 'Min Bet', default: g.minBet },
                  { field: 'maxBet', label: 'Max Bet', default: g.maxBet },
                  { field: 'houseEdge', label: 'House Edge', default: g.houseEdge },
                ].map(({ field, label, default: def }) => (
                  <div key={field}>
                    <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                    <input className="input text-sm py-2"
                      defaultValue={def}
                      onBlur={e => update(g.gameType, field, e.target.value)} />
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
        {games.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Gamepad2 size={32} className="mx-auto mb-2 opacity-20" />
            <p>No games loaded</p>
          </div>
        )}
      </div>
    </div>
  );
}
