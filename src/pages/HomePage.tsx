import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gift, ChevronRight, Wallet, Users, Trophy, Settings, Crown, Bell } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { sound } from '../services/soundService';
import toast from 'react-hot-toast';

const GAME_HIGHLIGHTS = [
  { type: 'crash', label: 'Aviator', img: '/games/crash/rocket.png', color: '#6366f1', hot: true },
  { type: 'mines', label: 'Mines', img: '/games/mines/mine.png', color: '#10b981', hot: true },
  { type: 'slots', label: 'Slots', icon: '🎰', color: '#f59e0b' },
  { type: 'roulette', label: 'Roulette', icon: '🎡', color: '#8b5cf6', hot: true },
  { type: 'plinko', label: 'Plinko', icon: '🎯', color: '#ec4899' },
  { type: 'blackjack', label: 'Blackjack', icon: '♠️', color: '#ef4444' },
];

const QUICK_ACTIONS = [
  { icon: Wallet, label: 'Deposit', action: '/wallet?tab=deposit', color: '#10b981' },
  { icon: Users, label: 'Refer', action: '/referrals', color: '#6366f1' },
  { icon: Trophy, label: 'Leaders', action: '/leaderboard', color: '#f5c842' },
  { icon: Settings, label: 'Settings', action: '/settings', color: '#6b7280' },
];

export default function HomePage() {
  const { user, wallet, refreshWallet } = useAuthStore();
  const navigate = useNavigate();
  const [bonusStatus, setBonusStatus] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [claimingBonus, setClaimingBonus] = useState(false);

  useEffect(() => {
    refreshWallet();
    api.get('/bonuses/daily/status').then(r => setBonusStatus(r.data)).catch(() => {});
    api.get('/notifications').then(r => setNotifications(r.data.notifications?.slice(0, 3) || [])).catch(() => {});
  }, []);

  const claimBonus = async () => {
    if (claimingBonus) return;
    setClaimingBonus(true);
    try {
      const { data } = await api.post('/bonuses/daily/claim');
      if (data.success) {
        sound.win();
        toast.success(`🎁 ${data.message}`, { duration: 4000 });
        refreshWallet();
        const s = await api.get('/bonuses/daily/status');
        setBonusStatus(s.data);
      } else {
        toast(data.message, { icon: '⏰' });
      }
    } catch { toast.error('Failed to claim bonus'); }
    setClaimingBonus(false);
  };

  const balance = Number(wallet?.balance || 0);
  const unread = notifications.some(n => !n.isRead);

  return (
    <div className="min-h-screen p-4 pt-6 space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <p className="text-gray-500 text-sm">Welcome back,</p>
          <h1 className="text-xl font-black flex items-center gap-2">
            {user?.firstName || user?.username || 'Player'}
            {user?.role === 'admin' && (
              <span className="badge badge-pending" style={{ fontSize: 10 }}>Admin</span>
            )}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/profile')} className="relative">
            {user?.photoUrl
              ? <img src={user.photoUrl} className="w-11 h-11 rounded-full border-2 object-cover" style={{ borderColor: '#f5c842' }} alt="" />
              : (
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl font-black"
                  style={{ background: 'linear-gradient(135deg,#f5c842,#d99a1a)', color: '#000' }}>
                  {(user?.firstName || 'P')[0]}
                </div>
              )}
            {unread && (
              <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-black"
                style={{ background: '#ef4444', color: '#fff', fontSize: 9 }}>
                {notifications.filter(n => !n.isRead).length}
              </motion.span>
            )}
          </button>
        </div>
      </motion.div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-5 relative overflow-hidden cursor-pointer"
        style={{ background: 'linear-gradient(135deg,#1a1a2e,#16213e)', border: '1px solid rgba(245,200,66,0.2)' }}
        onClick={() => navigate('/wallet')}
      >
        {/* BG glow */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
          style={{ background: '#f5c842', transform: 'translate(30%,-30%)' }} />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-5 pointer-events-none"
          style={{ background: '#6366f1', transform: 'translate(-30%,30%)' }} />

        <p className="text-gray-400 text-sm mb-1">Total Balance</p>
        <motion.h2
          key={balance}
          initial={{ scale: 0.92 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="text-4xl font-black gold-text"
        >
          {balance.toLocaleString()}
        </motion.h2>
        <p className="text-gray-500 text-sm mt-0.5">coins</p>

        <div className="flex gap-2 mt-4">
          {[
            { label: 'Earned', value: wallet?.totalEarned || 0, color: '#10b981' },
            { label: 'Winnings', value: wallet?.gameWinnings || 0, color: '#f5c842' },
            { label: 'Referrals', value: wallet?.referralEarnings || 0, color: '#6366f1' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex-1 rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <p className="text-xs text-gray-400">{label}</p>
              <p className="font-bold text-sm mt-0.5" style={{ color }}>{Number(value).toLocaleString()}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
          <Wallet size={11} /> Tap to manage wallet
        </p>
      </motion.div>

      {/* Daily Bonus */}
      {bonusStatus && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className={`rounded-2xl p-4 flex items-center gap-4 ${bonusStatus.canClaim ? 'cursor-pointer' : ''}`}
          style={{
            background: bonusStatus.canClaim
              ? 'linear-gradient(135deg,rgba(245,200,66,0.12),rgba(245,200,66,0.04))'
              : 'rgba(255,255,255,0.03)',
            border: `1px solid ${bonusStatus.canClaim ? 'rgba(245,200,66,0.35)' : '#1e1e30'}`,
          }}
          onClick={bonusStatus.canClaim ? claimBonus : undefined}
        >
          <motion.div
            animate={bonusStatus.canClaim ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: 'rgba(245,200,66,0.1)' }}
          >
            {bonusStatus.canClaim ? '🎁' : '⏰'}
          </motion.div>
          <div className="flex-1">
            <p className="font-bold">{bonusStatus.canClaim ? 'Daily Bonus Ready!' : 'Daily Bonus'}</p>
            <p className="text-sm text-gray-400 mt-0.5">
              {bonusStatus.canClaim
                ? `Day ${bonusStatus.streak || 1} streak — Tap to claim!`
                : `Next: ${new Date(bonusStatus.nextClaimAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
            </p>
          </div>
          {bonusStatus.canClaim && (
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(245,200,66,0.2)' }}>
              <Gift size={16} style={{ color: '#f5c842' }} />
            </div>
          )}
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
        <h2 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-widest">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(({ icon: Icon, label, action, color }) => (
            <button key={label}
              onClick={() => { sound.click(); navigate(action); }}
              className="rounded-xl p-3 flex flex-col items-center gap-2 card-hover"
              style={{ background: '#13131f', border: '1px solid #1e1e30' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${color}18` }}>
                <Icon size={17} style={{ color }} />
              </div>
              <span className="text-xs text-gray-400 font-semibold">{label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Featured Games */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.27 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Popular Games</h2>
          <button onClick={() => navigate('/games')}
            className="text-xs flex items-center gap-1 font-semibold"
            style={{ color: '#f5c842' }}>
            See All <ChevronRight size={13} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {GAME_HIGHLIGHTS.map(({ type, label, img, icon, color, hot }, i) => (
            <motion.button
              key={type}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              whileTap={{ scale: 0.93 }}
              className="rounded-xl p-3 flex flex-col items-center gap-2 relative overflow-hidden card-hover"
              style={{ background: `linear-gradient(135deg,${color}20,${color}08)`, border: `1px solid ${color}30` }}
              onClick={() => { sound.click(); navigate(`/games/${type}`); }}
            >
              {hot && (
                <span className="absolute top-1.5 right-1.5 px-1.5 rounded font-black text-white"
                  style={{ background: '#ef4444', fontSize: 8 }}>HOT</span>
              )}
              {img
                ? <img src={img} alt={label} className="w-10 h-10 object-contain" onError={e => { (e.target as any).style.display = 'none'; }} />
                : <span className="text-3xl">{icon}</span>
              }
              <span className="text-xs font-bold text-center leading-tight">{label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Admin Link */}
      {user?.role === 'admin' && (
        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
          className="w-full rounded-2xl p-4 flex items-center gap-3 card-hover"
          style={{ background: 'rgba(245,200,66,0.05)', border: '1px solid rgba(245,200,66,0.2)' }}
          onClick={() => window.location.href = '/admin'}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: 'rgba(245,200,66,0.1)' }}>
            <Crown size={18} style={{ color: '#f5c842' }} />
          </div>
          <div className="text-left flex-1">
            <p className="font-bold text-sm">Admin Panel</p>
            <p className="text-xs text-gray-500">Manage your platform</p>
          </div>
          <ChevronRight size={16} className="text-gray-500" />
        </motion.button>
      )}
    </div>
  );
}
