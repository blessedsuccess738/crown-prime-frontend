import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Share2, Users, DollarSign, TrendingUp } from 'lucide-react';
import api from '../services/api';
import { sound } from '../services/soundService';
import toast from 'react-hot-toast';

export default function ReferralsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get('/referrals').then(r => setData(r.data)).catch(() => {});
  }, []);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => { sound.coin(); toast.success(`${label} copied!`); });
  };

  const share = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Crown Prime Casino 👑',
        text: `Join Crown Prime Casino and get 1000 FREE coins! Use my referral link:`,
        url: data?.referralLink,
      });
    } else {
      copy(data?.referralLink, 'Link');
    }
  };

  return (
    <div className="min-h-screen p-4 pt-6 space-y-5">
      <h1 className="text-2xl font-black">Referrals</h1>

      {/* Stats */}
      {data && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-4" style={{ background: '#13131f', border: '1px solid #1e1e30' }}>
              <div className="flex items-center gap-2 mb-2"><Users size={16} style={{ color: '#6366f1' }} /><span className="text-xs text-gray-400">Total Referrals</span></div>
              <p className="text-2xl font-black">{data.stats?.total || 0}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="rounded-xl p-4" style={{ background: '#13131f', border: '1px solid #1e1e30' }}>
              <div className="flex items-center gap-2 mb-2"><DollarSign size={16} style={{ color: '#10b981' }} /><span className="text-xs text-gray-400">Total Earned</span></div>
              <p className="text-2xl font-black text-green-400">{Number(data.stats?.totalReward || 0).toLocaleString()}</p>
            </motion.div>
          </div>

          {/* Referral Link */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-xl p-4 space-y-3" style={{ background: '#13131f', border: '1px solid rgba(245,200,66,0.2)' }}>
            <p className="font-bold">👥 Your Referral Link</p>
            <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: '#0a0a0f', border: '1px solid #1e1e30' }}>
              <p className="text-xs text-gray-400 flex-1 truncate">{data.referralLink}</p>
              <button onClick={() => copy(data.referralLink, 'Link')} className="p-1.5 rounded-lg" style={{ background: 'rgba(245,200,66,0.1)' }}>
                <Copy size={14} style={{ color: '#f5c842' }} />
              </button>
            </div>
            <div className="flex gap-2">
              <button className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm" onClick={() => copy(data.referralCode, 'Code')}>
                <Copy size={14} /> Code: {data.referralCode}
              </button>
              <button className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm" onClick={share}>
                <Share2 size={14} /> Share
              </button>
            </div>
          </motion.div>

          {/* How it works */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="rounded-xl p-4" style={{ background: '#13131f', border: '1px solid #1e1e30' }}>
            <p className="font-bold mb-3">💡 How it Works</p>
            {[
              { step: '1', text: 'Share your referral link with friends' },
              { step: '2', text: 'Friend joins Crown Prime Casino' },
              { step: '3', text: 'You earn 200 coins instantly!' },
              { step: '4', text: 'No limit on referrals' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-center gap-3 mb-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-black flex-shrink-0" style={{ background: 'linear-gradient(135deg,#f5c842,#d99a1a)' }}>{step}</div>
                <span className="text-sm text-gray-300">{text}</span>
              </div>
            ))}
          </motion.div>

          {/* Referral list */}
          {data.referrals?.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-400">Your Referrals ({data.referrals.length})</p>
              {data.referrals.map((r: any, i: number) => (
                <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="rounded-xl p-3 flex items-center justify-between" style={{ background: '#13131f', border: '1px solid #1e1e30' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: 'rgba(245,200,66,0.1)', color: '#f5c842' }}>
                      {(r.firstName || r.username || '?')[0].toUpperCase()}
                    </div>
                    <span className="text-sm">{r.firstName || r.username || `User #${r.referredId}`}</span>
                  </div>
                  <span className="text-sm font-bold text-green-400">+{Number(r.rewardAmount).toLocaleString()}</span>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
