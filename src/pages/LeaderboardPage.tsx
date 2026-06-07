import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

type LBType = 'balance' | 'wins' | 'referrals';

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const [type, setType] = useState<LBType>('balance');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/leaderboard?type=${type}`).then(r => setData(r.data.leaderboard || [])).finally(() => setLoading(false));
  }, [type]);

  const TYPES: { id: LBType; label: string; icon: string }[] = [
    { id: 'balance', label: 'Richest', icon: '💰' },
    { id: 'wins', label: 'Most Wins', icon: '🏆' },
    { id: 'referrals', label: 'Top Referrers', icon: '👥' },
  ];

  const MEDALS = ['🥇', '🥈', '🥉'];

  return (
    <div className="min-h-screen p-4 pt-6 space-y-5">
      <h1 className="text-2xl font-black">Leaderboard 🏆</h1>

      <div className="flex gap-2">
        {TYPES.map(t => (
          <button key={t.id} onClick={() => setType(t.id)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${type === t.id ? 'text-black' : 'text-gray-400'}`}
            style={{ background: type === t.id ? 'linear-gradient(135deg,#f5c842,#d99a1a)' : '#13131f', border: '1px solid #1e1e30' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#f5c842', borderTopColor: 'transparent' }} />
        </div>
      )}

      {!loading && (
        <div className="space-y-2">
          {data.map((entry: any, i: number) => {
            const isMe = user && (entry.userId === user.id || entry.referrerId === user.id);
            const value = type === 'balance' ? Number(entry.balance).toLocaleString() + ' coins'
              : type === 'wins' ? entry.wins + ' wins'
              : entry.referralCount + ' refs';
            const name = entry.firstName || entry.username || `Player #${entry.userId || entry.referrerId}`;

            return (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className={`rounded-xl p-4 flex items-center gap-4 ${isMe ? 'ring-1' : ''}`}
                style={{ background: isMe ? 'rgba(245,200,66,0.08)' : '#13131f', border: `1px solid ${isMe ? 'rgba(245,200,66,0.4)' : '#1e1e30'}` }}>
                <div className="w-8 text-center font-black text-lg">
                  {i < 3 ? MEDALS[i] : <span className="text-gray-500 text-sm">#{i + 1}</span>}
                </div>
                {entry.photoUrl
                  ? <img src={entry.photoUrl} className="w-9 h-9 rounded-full" alt="" />
                  : <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: 'rgba(245,200,66,0.1)', color: '#f5c842' }}>{name[0]}</div>
                }
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{name} {isMe && <span className="text-xs text-yellow-400">(You)</span>}</p>
                </div>
                <span className="font-bold text-sm gold-text">{value}</span>
              </motion.div>
            );
          })}
          {data.length === 0 && <p className="text-center text-gray-500 py-8">No data yet. Be the first!</p>}
        </div>
      )}
    </div>
  );
}
