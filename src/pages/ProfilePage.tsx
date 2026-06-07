import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Settings, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

export default function ProfilePage() {
  const { user, wallet, logout, refreshWallet } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    refreshWallet();
    api.get('/users/me').then(r => {
      setStats(r.data.stats);
      setAchievements(r.data.achievements || []);
    }).catch(() => {});
    api.get('/games/history').then(r => setHistory(r.data.history || [])).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen p-4 pt-6 space-y-5">
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 text-center" style={{ background: 'linear-gradient(135deg,#1a1a2e,#16213e)', border: '1px solid rgba(245,200,66,0.2)' }}>
        {user?.photoUrl
          ? <img src={user.photoUrl} className="w-20 h-20 rounded-full mx-auto mb-3 border-2" style={{ borderColor: '#f5c842' }} alt="" />
          : <div className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl font-black" style={{ background: 'linear-gradient(135deg,#f5c842,#d99a1a)', color: '#000' }}>{(user?.firstName || 'P')[0]}</div>
        }
        <h2 className="text-xl font-black">{user?.firstName} {user?.lastName}</h2>
        {user?.username && <p className="text-gray-400 text-sm">@{user.username}</p>}
        <p className="text-xs text-gray-500 mt-1">ID: #{user?.id}</p>
        {user?.role === 'admin' && <span className="badge badge-win text-xs mt-2 inline-block">👑 Admin</span>}
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Balance', value: Number(wallet?.balance || 0).toLocaleString(), icon: '💰' },
          { label: 'Games', value: stats?.games || 0, icon: '🎮' },
          { label: 'Referrals', value: stats?.referrals || 0, icon: '👥' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="rounded-xl p-3 text-center" style={{ background: '#13131f', border: '1px solid #1e1e30' }}>
            <p className="text-xl">{icon}</p>
            <p className="font-black text-lg">{value}</p>
            <p className="text-xs text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-400 mb-3">🏆 Achievements ({achievements.length})</p>
          <div className="grid grid-cols-2 gap-2">
            {achievements.map((a: any) => (
              <motion.div key={a.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl p-3" style={{ background: 'rgba(245,200,66,0.05)', border: '1px solid rgba(245,200,66,0.2)' }}>
                <p className="font-semibold text-sm">{a.title}</p>
                <p className="text-xs text-gray-400">{a.description}</p>
                <p className="text-xs gold-text font-bold mt-1">+{a.reward} coins</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Games */}
      {history.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-400 mb-3">🎮 Recent Games</p>
          <div className="space-y-2">
            {history.slice(0, 5).map((h: any) => (
              <div key={h.id} className="rounded-xl p-3 flex items-center justify-between" style={{ background: '#13131f', border: '1px solid #1e1e30' }}>
                <div className="flex items-center gap-3">
                  <span className={`badge ${h.result === 'win' ? 'badge-win' : 'badge-loss'}`}>{h.result}</span>
                  <span className="text-sm capitalize">{h.gameType}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Bet: {Number(h.betAmount).toLocaleString()}</p>
                  <p className={`text-sm font-bold ${h.result === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                    {h.result === 'win' ? `+${Number(h.winAmount).toLocaleString()}` : `−${Number(h.betAmount).toLocaleString()}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        {user?.role === 'admin' && (
          <button className="w-full rounded-xl p-4 flex items-center gap-3" style={{ background: 'rgba(245,200,66,0.05)', border: '1px solid rgba(245,200,66,0.2)' }}
            onClick={() => window.location.href = '/admin'}>
            <span className="text-xl">👑</span>
            <span className="font-semibold flex-1 text-left">Admin Panel</span>
            <ChevronRight size={16} className="text-gray-400" />
          </button>
        )}
        <button className="w-full rounded-xl p-4 flex items-center gap-3" style={{ background: '#13131f', border: '1px solid #1e1e30' }}
          onClick={() => navigate('/settings')}>
          <Settings size={18} className="text-gray-400" />
          <span className="font-semibold flex-1 text-left">Settings</span>
          <ChevronRight size={16} className="text-gray-400" />
        </button>
        <button className="w-full rounded-xl p-4 flex items-center gap-3" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}
          onClick={() => { logout(); navigate('/'); }}>
          <LogOut size={18} className="text-red-400" />
          <span className="font-semibold text-red-400">Logout</span>
        </button>
      </div>
    </div>
  );
}
