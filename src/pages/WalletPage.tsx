import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownCircle, ArrowUpCircle, History, Loader } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { sound } from '../services/soundService';
import toast from 'react-hot-toast';

type Tab = 'overview' | 'deposit' | 'withdraw' | 'history';

export default function WalletPage() {
  const { wallet, refreshWallet } = useAuthStore();
  const [tab, setTab] = useState<Tab>('overview');
  const [banks, setBanks] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Deposit state
  const [depositAmount, setDepositAmount] = useState('');

  // Withdraw state
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedBankName, setSelectedBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [resolving, setResolving] = useState(false);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  // Promo state
  const [promoCode, setPromoCode] = useState('');

  useEffect(() => {
    refreshWallet();
    if (tab === 'history') loadTransactions();
    if (tab === 'withdraw') {
      loadBanks();
      api.get('/paystack/withdrawals').then(r => setWithdrawals(r.data.withdrawals || [])).catch(() => {});
    }
    const urlTab = new URLSearchParams(window.location.search).get('tab') as Tab;
    if (urlTab) setTab(urlTab);
  }, [tab]);

  const loadBanks = async () => {
    try {
      const { data } = await api.get('/paystack/banks');
      setBanks(data.banks || []);
    } catch {}
  };

  const loadTransactions = async () => {
    try {
      const { data } = await api.get('/wallet/transactions');
      setTransactions(data.transactions || []);
    } catch {}
  };

  const resolveAccount = async () => {
    if (accountNumber.length !== 10 || !selectedBank) return;
    setResolving(true);
    setAccountName('');
    try {
      const { data } = await api.post('/paystack/resolve-account', { accountNumber, bankCode: selectedBank });
      setAccountName(data.accountName);
      sound.coin();
    } catch {
      toast.error('Could not resolve account. Check number and bank.');
    }
    setResolving(false);
  };

  useEffect(() => {
    if (accountNumber.length === 10 && selectedBank) resolveAccount();
  }, [accountNumber, selectedBank]);

  const initDeposit = async () => {
    if (!depositAmount || Number(depositAmount) < 100) return toast.error('Minimum deposit ₦100');
    setLoading(true);
    try {
      const { data } = await api.post('/paystack/deposit/initialize', { amount: Number(depositAmount) });
      window.open(data.authorizationUrl, '_blank');
      toast.success('Redirecting to payment page...');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to initialize payment');
    }
    setLoading(false);
  };

  const submitWithdrawal = async () => {
    if (!withdrawAmount || Number(withdrawAmount) < 500) return toast.error('Minimum withdrawal 500 coins');
    if (!accountName) return toast.error('Please verify your account number first');
    setLoading(true);
    try {
      const { data } = await api.post('/paystack/withdrawal/request', {
        amount: Number(withdrawAmount),
        bankCode: selectedBank,
        bankName: selectedBankName,
        accountNumber,
        accountName,
      });
      sound.cashout();
      toast.success(data.message);
      refreshWallet();
      setWithdrawAmount(''); setAccountNumber(''); setAccountName('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to submit withdrawal');
    }
    setLoading(false);
  };

  const redeemPromo = async () => {
    if (!promoCode) return;
    try {
      const { data } = await api.post('/bonuses/promo/redeem', { code: promoCode });
      sound.win();
      toast.success(data.message);
      refreshWallet();
      setPromoCode('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid promo code');
    }
  };

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '💰' },
    { id: 'deposit', label: 'Deposit', icon: '📥' },
    { id: 'withdraw', label: 'Withdraw', icon: '📤' },
    { id: 'history', label: 'History', icon: '📜' },
  ];

  return (
    <div className="min-h-screen p-4 pt-6 space-y-5">
      <h1 className="text-2xl font-black">Wallet</h1>

      {/* Balance */}
      <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg,#1a1a2e,#16213e)', border: '1px solid rgba(245,200,66,0.2)' }}>
        <p className="text-gray-400 text-sm">Available Balance</p>
        <p className="text-4xl font-black gold-text mt-1">{Number(wallet?.balance || 0).toLocaleString()} <span className="text-lg">coins</span></p>
        <p className="text-gray-500 text-xs mt-1">≈ ₦{(Number(wallet?.balance || 0) / 10).toFixed(2)} NGN</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t.id ? 'text-black' : 'text-gray-400'}`}
            style={{ background: tab === t.id ? 'linear-gradient(135deg,#f5c842,#d99a1a)' : '#13131f', border: '1px solid #1e1e30' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>

          {/* Overview */}
          {tab === 'overview' && (
            <div className="space-y-3">
              {[
                { label: 'Total Earned', value: wallet?.totalEarned, icon: '📈', color: '#10b981' },
                { label: 'Total Spent', value: wallet?.totalSpent, icon: '📉', color: '#ef4444' },
                { label: 'Game Winnings', value: wallet?.gameWinnings, icon: '🏆', color: '#f5c842' },
                { label: 'Referral Earnings', value: wallet?.referralEarnings, icon: '👥', color: '#6366f1' },
                { label: 'Bonus Earnings', value: wallet?.bonusEarnings, icon: '🎁', color: '#8b5cf6' },
              ].map(({ label, value, icon, color }) => (
                <div key={label} className="rounded-xl p-4 flex items-center justify-between" style={{ background: '#13131f', border: '1px solid #1e1e30' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{icon}</span>
                    <span className="text-gray-300">{label}</span>
                  </div>
                  <span className="font-bold" style={{ color }}>{Number(value || 0).toLocaleString()}</span>
                </div>
              ))}

              {/* Promo code */}
              <div className="rounded-xl p-4 space-y-3" style={{ background: '#13131f', border: '1px solid #1e1e30' }}>
                <p className="font-semibold">🎁 Promo Code</p>
                <div className="flex gap-2">
                  <input className="input flex-1" placeholder="Enter promo code" value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())} />
                  <button className="btn-primary px-4" onClick={redeemPromo}>Redeem</button>
                </div>
              </div>
            </div>
          )}

          {/* Deposit */}
          {tab === 'deposit' && (
            <div className="space-y-4">
              <div className="rounded-xl p-4" style={{ background: '#13131f', border: '1px solid #1e1e30' }}>
                <p className="font-semibold mb-3">💳 Deposit via Paystack</p>
                <p className="text-sm text-gray-400 mb-4">₦10 = 100 coins. Minimum deposit: ₦100</p>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[500, 1000, 2000, 5000, 10000, 20000].map(amt => (
                    <button key={amt} onClick={() => setDepositAmount(String(amt))}
                      className={`py-2 rounded-xl text-sm font-semibold transition-all ${depositAmount === String(amt) ? 'text-black' : 'text-gray-300'}`}
                      style={{ background: depositAmount === String(amt) ? 'linear-gradient(135deg,#f5c842,#d99a1a)' : '#1a1a2e', border: '1px solid #1e1e30' }}>
                      ₦{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
                <input className="input mb-3" type="number" placeholder="Or enter custom amount (₦)" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} />
                {depositAmount && <p className="text-xs text-gray-400 mb-3">You will receive: <span style={{ color: '#f5c842' }} className="font-bold">{(Number(depositAmount) * 10).toLocaleString()} coins</span></p>}
                <button className="btn-primary w-full" onClick={initDeposit} disabled={loading}>
                  {loading ? 'Processing...' : '💳 Pay with Paystack'}
                </button>
              </div>
            </div>
          )}

          {/* Withdraw */}
          {tab === 'withdraw' && (
            <div className="space-y-4">
              <div className="rounded-xl p-4 space-y-3" style={{ background: '#13131f', border: '1px solid #1e1e30' }}>
                <p className="font-semibold">📤 Withdraw to Bank</p>
                <p className="text-sm text-gray-400">500 coins = ₦50. Minimum: 500 coins.</p>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Select Bank</label>
                  <select className="input" value={selectedBank} onChange={e => {
                    setSelectedBank(e.target.value);
                    setSelectedBankName(e.target.options[e.target.selectedIndex].text);
                    setAccountName('');
                  }}>
                    <option value="">-- Select Bank --</option>
                    {banks.map((b: any) => <option key={b.code} value={b.code}>{b.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Account Number</label>
                  <input className="input" maxLength={10} placeholder="10-digit account number" value={accountNumber} onChange={e => { setAccountNumber(e.target.value.replace(/\D/g, '')); setAccountName(''); }} />
                </div>

                {resolving && <p className="text-xs text-gray-400 animate-pulse">🔍 Verifying account...</p>}
                {accountName && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="rounded-xl p-3 flex items-center gap-2"
                    style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                    <span>✅</span>
                    <span className="font-bold text-green-400">{accountName}</span>
                  </motion.div>
                )}

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Amount (coins)</label>
                  <input className="input" type="number" placeholder="Amount in coins" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
                  {withdrawAmount && <p className="text-xs text-gray-400 mt-1">≈ ₦{(Number(withdrawAmount) / 10).toFixed(2)}</p>}
                </div>

                <button className="btn-primary w-full" onClick={submitWithdrawal} disabled={loading || !accountName}>
                  {loading ? 'Processing...' : '📤 Request Withdrawal'}
                </button>
              </div>

              {/* Withdrawal history */}
              {withdrawals.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-400">Recent Withdrawals</p>
                  {withdrawals.map((w: any) => (
                    <div key={w.id} className="rounded-xl p-3 flex items-center justify-between" style={{ background: '#13131f', border: '1px solid #1e1e30' }}>
                      <div>
                        <p className="text-sm font-semibold">{w.bankName} • {w.accountNumber}</p>
                        <p className="text-xs text-gray-400">₦{w.amount} • {new Date(w.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`badge ${w.status === 'success' ? 'badge-win' : w.status === 'rejected' ? 'badge-loss' : 'badge-pending'}`}>{w.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* History */}
          {tab === 'history' && (
            <div className="space-y-2">
              {transactions.length === 0 && <p className="text-center text-gray-500 py-8">No transactions yet</p>}
              {transactions.map((tx: any) => (
                <div key={tx.id} className="rounded-xl p-4 flex items-center gap-3" style={{ background: '#13131f', border: '1px solid #1e1e30' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                    style={{ background: Number(tx.amount) > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}>
                    {Number(tx.amount) > 0 ? '↑' : '↓'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{tx.description || tx.type}</p>
                    <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`font-bold text-sm ${Number(tx.amount) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {Number(tx.amount) > 0 ? '+' : ''}{Number(tx.amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
