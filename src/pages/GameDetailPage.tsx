import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Info } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { sound } from '../services/soundService';
import toast from 'react-hot-toast';

const BET_PRESETS = [10, 50, 100, 500, 1000, 5000];

function BetControls({ bet, setBet, onPlay, loading, disabled = false, label = 'Play' }: any) {
  const { wallet } = useAuthStore();
  const balance = Number(wallet?.balance || 0);
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs text-gray-400 mb-2">Bet Amount</p>
        <div className="grid grid-cols-3 gap-2 mb-2">
          {BET_PRESETS.map(p => (
            <button key={p} onClick={() => setBet(p)}
              className={`py-2 rounded-xl text-sm font-semibold transition-all ${bet === p ? 'text-black' : 'text-gray-400'}`}
              style={{ background: bet === p ? 'linear-gradient(135deg,#f5c842,#d99a1a)' : '#1a1a2e', border: '1px solid #1e1e30' }}>
              {p.toLocaleString()}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="number" className="input flex-1" value={bet} onChange={e => setBet(Number(e.target.value))} min={10} />
          <button onClick={() => setBet(Math.floor(balance / 2))} className="btn-secondary px-3 text-xs">½</button>
          <button onClick={() => setBet(balance)} className="btn-secondary px-3 text-xs">Max</button>
        </div>
      </div>
      <button className="btn-primary w-full text-lg py-4" onClick={onPlay} disabled={loading || disabled}>
        {loading ? <span className="animate-pulse">Processing...</span> : label}
      </button>
    </div>
  );
}

// ─── SLOTS ───────────────────────────────────────────────────────────────────
function SlotsGame() {
  const { wallet, refreshWallet } = useAuthStore();
  const [bet, setBet] = useState(50);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [spinning, setSpinning] = useState(false);
  const SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '7️⃣', '👑'];

  const play = async () => {
    if (loading) return;
    setLoading(true); setSpinning(true); setResult(null);
    sound.playSlotSpin();
    try {
      const { data } = await api.post('/games/slots/play', { bet });
      setTimeout(() => {
        setSpinning(false); setResult(data);
        if (data.win > 0) sound.win(); else sound.lose();
        refreshWallet();
      }, 1500);
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); setSpinning(false); }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Slot Machine Display */}
      <div className="rounded-2xl p-6 text-center" style={{ background: 'linear-gradient(135deg,#1a1a2e,#16213e)', border: '1px solid rgba(245,200,66,0.2)' }}>
        <div className="flex gap-4 justify-center mb-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-20 h-20 rounded-xl flex items-center justify-center text-4xl" style={{ background: '#0a0a0f', border: '2px solid #1e1e30' }}>
              {spinning ? (
                <motion.div animate={{ y: [-20, 0, -20] }} transition={{ repeat: Infinity, duration: 0.3 + i * 0.1 }}>
                  {SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]}
                </motion.div>
              ) : result ? result.reels[i] : SYMBOLS[i]}
            </div>
          ))}
        </div>
        {result && !spinning && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
            {result.win > 0
              ? <p className="text-green-400 font-black text-2xl">+{result.win.toLocaleString()} 🎉</p>
              : <p className="text-red-400 font-bold">No win this time</p>}
            {result.multiplier > 0 && <p className="text-gray-400 text-sm">x{result.multiplier} multiplier</p>}
          </motion.div>
        )}
      </div>
      <BetControls bet={bet} setBet={setBet} onPlay={play} loading={loading} label="🎰 Spin!" />
    </div>
  );
}

// ─── DICE ─────────────────────────────────────────────────────────────────────
function DiceGame() {
  const { refreshWallet } = useAuthStore();
  const [bet, setBet] = useState(50);
  const [prediction, setPrediction] = useState<'over' | 'under'>('over');
  const [target, setTarget] = useState(50);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const play = async () => {
    setLoading(true); setResult(null);
    sound.spin();
    try {
      const { data } = await api.post('/games/dice/play', { bet, prediction, target });
      setResult(data);
      data.win > 0 ? sound.win() : sound.lose();
      refreshWallet();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
    setLoading(false);
  };

  const winChance = prediction === 'over' ? 100 - target : target;
  const multiplier = ((99 / winChance) * 0.97).toFixed(4);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl p-5" style={{ background: '#13131f', border: '1px solid #1e1e30' }}>
        {result && (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center mb-4">
            <p className="text-6xl font-black" style={{ color: result.won ? '#10b981' : '#ef4444' }}>{result.roll}</p>
            <p className={result.won ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
              {result.won ? `+${result.win.toLocaleString()} coins!` : 'Lost!'}
            </p>
          </motion.div>
        )}
        <div className="flex gap-2 mb-4">
          {(['over', 'under'] as const).map(p => (
            <button key={p} onClick={() => setPrediction(p)}
              className={`flex-1 py-3 rounded-xl font-bold transition-all capitalize ${prediction === p ? 'text-black' : 'text-gray-400'}`}
              style={{ background: prediction === p ? 'linear-gradient(135deg,#f5c842,#d99a1a)' : '#1a1a2e', border: '1px solid #1e1e30' }}>
              {p === 'over' ? '⬆️' : '⬇️'} {p}
            </button>
          ))}
        </div>
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Target: {target}</span>
            <span>Win: {winChance}% chance • {multiplier}x</span>
          </div>
          <input type="range" min="5" max="95" value={target} onChange={e => setTarget(Number(e.target.value))}
            className="w-full" style={{ accentColor: '#f5c842' }} />
        </div>
      </div>
      <BetControls bet={bet} setBet={setBet} onPlay={play} loading={loading} label="🎲 Roll!" />
    </div>
  );
}

// ─── COIN FLIP ────────────────────────────────────────────────────────────────
function CoinFlipGame() {
  const { refreshWallet } = useAuthStore();
  const [bet, setBet] = useState(50);
  const [choice, setChoice] = useState<'heads' | 'tails'>('heads');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [flipping, setFlipping] = useState(false);

  const play = async () => {
    setLoading(true); setFlipping(true); setResult(null);
    sound.spin();
    try {
      const { data } = await api.post('/games/coinflip/play', { bet, choice });
      setTimeout(() => {
        setFlipping(false); setResult(data);
        data.win > 0 ? sound.win() : sound.lose();
        refreshWallet();
      }, 800);
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); setFlipping(false); }
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl p-6 text-center" style={{ background: '#13131f', border: '1px solid #1e1e30' }}>
        <motion.div animate={flipping ? { rotateY: [0, 180, 360, 540, 720] } : {}} transition={{ duration: 0.8 }} className="text-8xl mb-4">
          {result ? (result.outcome === 'heads' ? '🪙' : '🟡') : (choice === 'heads' ? '🪙' : '🟡')}
        </motion.div>
        {result && !flipping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-xl font-bold capitalize mb-1" style={{ color: result.won ? '#10b981' : '#ef4444' }}>
              {result.outcome}! {result.won ? '🎉' : '😢'}
            </p>
            <p className={result.won ? 'text-green-400' : 'text-red-400'}>
              {result.won ? `+${result.win.toLocaleString()} coins` : 'Better luck next time!'}
            </p>
          </motion.div>
        )}
        <div className="flex gap-3 justify-center mt-4">
          {(['heads', 'tails'] as const).map(c => (
            <button key={c} onClick={() => setChoice(c)}
              className={`px-6 py-3 rounded-xl font-bold capitalize transition-all ${choice === c ? 'text-black' : 'text-gray-400'}`}
              style={{ background: choice === c ? 'linear-gradient(135deg,#f5c842,#d99a1a)' : '#1a1a2e', border: '1px solid #1e1e30' }}>
              {c === 'heads' ? '🪙 Heads' : '🟡 Tails'}
            </button>
          ))}
        </div>
      </div>
      <BetControls bet={bet} setBet={setBet} onPlay={play} loading={loading} label="🪙 Flip!" />
    </div>
  );
}

// ─── MINES ────────────────────────────────────────────────────────────────────
function MinesGame() {
  const { refreshWallet } = useAuthStore();
  const [bet, setBet] = useState(100);
  const [mineCount, setMineCount] = useState(3);
  const [session, setSession] = useState<any>(null);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [minePositions, setMinePositions] = useState<number[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [currentWin, setCurrentWin] = useState(0);
  const [loading, setLoading] = useState(false);

  const startGame = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/games/mines/start', { bet, mineCount });
      setSession(data.sessionData);
      setRevealed([]); setMinePositions([]); setGameOver(false);
      setCurrentMultiplier(1); setCurrentWin(0);
      sound.click();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
    setLoading(false);
  };

  const revealTile = async (index: number) => {
    if (!session || gameOver || revealed.includes(index) || loading) return;
    try {
      const { data } = await api.post('/games/mines/reveal', { sessionData: { ...session, revealed }, tileIndex: index });
      if (data.hitMine) {
        sound.bomb();
        setMinePositions(data.minePositions);
        setGameOver(true);
        setSession(null);
        toast.error('💥 Mine hit! Game over!');
        refreshWallet();
      } else {
        sound.coin();
        setRevealed(data.revealed);
        setCurrentMultiplier(data.multiplier);
        setCurrentWin(data.currentWin);
        setSession(s => ({ ...s, revealed: data.revealed }));
      }
    } catch {}
  };

  const cashout = async () => {
    if (!session || revealed.length === 0) return;
    try {
      const { data } = await api.post('/games/mines/cashout', { sessionData: { ...session, revealed } });
      sound.cashout();
      toast.success(`💰 Cashed out! +${data.win.toLocaleString()} coins!`);
      setSession(null); setGameOver(true); setMinePositions(session.minePositions || []);
      refreshWallet();
    } catch {}
  };

  const getTileState = (i: number) => {
    if (gameOver && minePositions.includes(i)) return 'mine';
    if (revealed.includes(i)) return 'safe';
    return 'hidden';
  };

  return (
    <div className="space-y-4">
      {!session && !gameOver && (
        <div className="rounded-xl p-4 space-y-3" style={{ background: '#13131f', border: '1px solid #1e1e30' }}>
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Mines: {mineCount}</label>
            <input type="range" min="1" max="24" value={mineCount} onChange={e => setMineCount(Number(e.target.value))}
              className="w-full" style={{ accentColor: '#f5c842' }} />
          </div>
          <BetControls bet={bet} setBet={setBet} onPlay={startGame} loading={loading} label="💣 Start Game" />
        </div>
      )}

      {(session || gameOver) && (
        <>
          <div className="flex items-center justify-between rounded-xl p-3" style={{ background: '#13131f', border: '1px solid #1e1e30' }}>
            <div><p className="text-xs text-gray-400">Multiplier</p><p className="font-black text-xl gold-text">{currentMultiplier}x</p></div>
            <div><p className="text-xs text-gray-400">Potential Win</p><p className="font-black text-xl text-green-400">{currentWin.toLocaleString()}</p></div>
            {session && revealed.length > 0 && (
              <button className="btn-primary px-4 py-2 text-sm" onClick={cashout}>💰 Cash Out</button>
            )}
          </div>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 25 }, (_, i) => {
              const state = getTileState(i);
              return (
                <motion.button key={i} whileTap={{ scale: 0.9 }}
                  className="aspect-square rounded-xl flex items-center justify-center text-2xl font-bold transition-all"
                  style={{
                    background: state === 'mine' ? 'rgba(239,68,68,0.2)' : state === 'safe' ? 'rgba(16,185,129,0.2)' : '#1a1a2e',
                    border: `1px solid ${state === 'mine' ? '#ef4444' : state === 'safe' ? '#10b981' : '#1e1e30'}`,
                    cursor: session && state === 'hidden' ? 'pointer' : 'default',
                  }}
                  onClick={() => revealTile(i)}
                >
                  {state === 'mine' ? '💣' : state === 'safe' ? '💎' : ''}
                </motion.button>
              );
            })}
          </div>
          {gameOver && (
            <button className="btn-primary w-full" onClick={() => { setGameOver(false); setRevealed([]); setMinePositions([]); }}>
              Play Again
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ─── CRASH/AVIATOR ────────────────────────────────────────────────────────────
function CrashGame({ gameType = 'crash' }: { gameType?: string }) {
  const { refreshWallet } = useAuthStore();
  const [bet, setBet] = useState(100);
  const [cashoutAt, setCashoutAt] = useState(2.0);
  const [multiplier, setMultiplier] = useState(1.0);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const intervalRef = useRef<any>(null);

  const start = async () => {
    if (Number(bet) <= 0) return;
    const { data } = await api.post('/games/crash/start', {});
    setSession(data.sessionData);
    setMultiplier(1.0); setResult(null); setRunning(true);
    sound.startMusic();
    intervalRef.current = setInterval(() => {
      setMultiplier(m => {
        const next = +(m * 1.003).toFixed(2);
        if (next >= data.sessionData.crashPoint) {
          clearInterval(intervalRef.current);
          setRunning(false);
          sound.crash_();
          toast.error(`💥 Crashed at ${data.sessionData.crashPoint}x!`);
          setResult({ won: false, crashPoint: data.sessionData.crashPoint });
          // Auto-settle as loss
          api.post('/games/crash/cashout', { bet, cashoutAt: data.sessionData.crashPoint + 1, sessionData: data.sessionData });
          refreshWallet();
        }
        return next;
      });
    }, 100);
  };

  const cashout = async () => {
    if (!running || !session) return;
    clearInterval(intervalRef.current);
    setRunning(false);
    try {
      const { data } = await api.post('/games/crash/cashout', { bet, cashoutAt: multiplier, sessionData: session });
      sound.cashout();
      setResult(data);
      if (data.won) toast.success(`✈️ Cashed out at ${multiplier}x! +${data.win} coins`);
      refreshWallet();
    } catch {}
  };

  const iconMap: Record<string, string> = { crash: '✈️', jetx: '✈️', spaceman: '👨‍🚀', balloon: '🎈', matador: '🐂', rocket: '🚀' };
  const imgMap: Record<string, string> = { crash: '/games/crash/rocket.png', rocket: '/games/crash/rocket.png' };
  const icon = iconMap[gameType] || '✈️';
  const gameImg = imgMap[gameType || ''];

  return (
    <div className="space-y-5">
      <div className="rounded-2xl p-6 text-center" style={{ background: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)', border: '1px solid rgba(99,102,241,0.3)' }}>
        <motion.div animate={running ? { y: [-5, 5, -5] } : {}} transition={{ repeat: Infinity, duration: 1 }} className="text-6xl mb-4">
          {gameImg
            ? <img src={gameImg} alt={icon} className="w-16 h-16 mx-auto object-contain" onError={e => { (e.target as any).style.display='none'; }} />
            : icon}
        </motion.div>
        <motion.p key={multiplier} className="text-5xl font-black"
          style={{ color: multiplier > 2 ? '#10b981' : multiplier > 1.5 ? '#f5c842' : '#fff' }}>
          {multiplier.toFixed(2)}x
        </motion.p>
        {result && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className={`text-lg font-bold mt-2 ${result.won ? 'text-green-400' : 'text-red-400'}`}>
            {result.won ? `+${result.win} coins!` : `Crashed at ${result.crashPoint}x`}
          </motion.p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label className="text-xs text-gray-400 mb-1 block">Auto cashout at</label>
          <input type="number" className="input" step="0.1" min="1.1" value={cashoutAt} onChange={e => setCashoutAt(Number(e.target.value))} />
        </div>
      </div>

      {!running ? (
        <BetControls bet={bet} setBet={setBet} onPlay={start} loading={false} label={`${icon} Launch!`} />
      ) : (
        <button className="btn-primary w-full py-4 text-lg" onClick={cashout} style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
          💰 Cash Out at {multiplier.toFixed(2)}x
        </button>
      )}
    </div>
  );
}

// ─── ROULETTE ─────────────────────────────────────────────────────────────────
function RouletteGame() {
  const { refreshWallet } = useAuthStore();
  const [bet, setBet] = useState(50);
  const [betType, setBetType] = useState('color');
  const [selection, setSelection] = useState<any>('red');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [spinning, setSpinning] = useState(false);

  const play = async () => {
    setLoading(true); setSpinning(true); setResult(null);
    sound.spin();
    try {
      const { data } = await api.post('/games/roulette/play', { bet, betType, selection });
      setTimeout(() => {
        setSpinning(false); setResult(data);
        data.win > 0 ? sound.win() : sound.lose();
        refreshWallet();
      }, 1500);
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); setSpinning(false); }
    setLoading(false);
  };

  const RED_NUMS = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
  const getNumColor = (n: number) => n === 0 ? '#10b981' : RED_NUMS.includes(n) ? '#ef4444' : '#1a1a1a';

  return (
    <div className="space-y-5">
      <div className="rounded-2xl p-4" style={{ background: '#13131f', border: '1px solid #1e1e30' }}>
        {spinning && <div className="text-center text-4xl my-4 animate-spin">🎡</div>}
        {result && !spinning && (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center mb-4">
            <div className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl font-black"
              style={{ background: getNumColor(result.number) }}>
              {result.number}
            </div>
            <p className="capitalize font-bold" style={{ color: result.number === 0 ? '#10b981' : RED_NUMS.includes(result.number) ? '#ef4444' : '#aaa' }}>
              {result.color}
            </p>
            <p className={`text-xl font-black mt-1 ${result.won ? 'text-green-400' : 'text-red-400'}`}>
              {result.won ? `+${result.win.toLocaleString()}` : 'Lost'}
            </p>
          </motion.div>
        )}
        <div className="flex gap-2 mb-3">
          {[{ v: 'color', l: 'Color' }, { v: 'number', l: 'Number' }, { v: 'dozen', l: 'Dozen' }, { v: 'half', l: 'Half' }].map(({ v, l }) => (
            <button key={v} onClick={() => { setBetType(v); setSelection(v === 'color' ? 'red' : v === 'number' ? 0 : v === 'dozen' ? 1 : '1-18'); }}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold ${betType === v ? 'text-black' : 'text-gray-400'}`}
              style={{ background: betType === v ? 'linear-gradient(135deg,#f5c842,#d99a1a)' : '#1a1a2e', border: '1px solid #1e1e30' }}>
              {l}
            </button>
          ))}
        </div>
        {betType === 'color' && (
          <div className="flex gap-2">
            {[{ v: 'red', c: '#ef4444' }, { v: 'black', c: '#333' }, { v: 'green', c: '#10b981' }].map(({ v, c }) => (
              <button key={v} onClick={() => setSelection(v)} className={`flex-1 py-3 rounded-xl capitalize font-bold border-2 transition-all`}
                style={{ background: c, borderColor: selection === v ? '#f5c842' : 'transparent', opacity: selection === v ? 1 : 0.6 }}>{v}</button>
            ))}
          </div>
        )}
        {betType === 'number' && (
          <div className="grid grid-cols-9 gap-1 max-h-32 overflow-y-auto">
            {Array.from({ length: 37 }, (_, i) => (
              <button key={i} onClick={() => setSelection(i)}
                className={`py-2 rounded text-xs font-bold border transition-all ${selection === i ? 'border-yellow-400' : 'border-transparent'}`}
                style={{ background: getNumColor(i), color: '#fff' }}>{i}</button>
            ))}
          </div>
        )}
        {betType === 'dozen' && (
          <div className="flex gap-2">
            {[1, 2, 3].map(d => (
              <button key={d} onClick={() => setSelection(d)}
                className={`flex-1 py-3 rounded-xl font-bold text-sm ${selection === d ? 'text-black' : 'text-gray-400'}`}
                style={{ background: selection === d ? 'linear-gradient(135deg,#f5c842,#d99a1a)' : '#1a1a2e', border: '1px solid #1e1e30' }}>
                {d === 1 ? '1-12' : d === 2 ? '13-24' : '25-36'}
              </button>
            ))}
          </div>
        )}
        {betType === 'half' && (
          <div className="flex gap-2">
            {['1-18', '19-36'].map(h => (
              <button key={h} onClick={() => setSelection(h)}
                className={`flex-1 py-3 rounded-xl font-bold ${selection === h ? 'text-black' : 'text-gray-400'}`}
                style={{ background: selection === h ? 'linear-gradient(135deg,#f5c842,#d99a1a)' : '#1a1a2e', border: '1px solid #1e1e30' }}>
                {h}
              </button>
            ))}
          </div>
        )}
      </div>
      <BetControls bet={bet} setBet={setBet} onPlay={play} loading={loading} label="🎡 Spin!" />
    </div>
  );
}

// ─── BLACKJACK ────────────────────────────────────────────────────────────────
function BlackjackGame() {
  const { refreshWallet } = useAuthStore();
  const [bet, setBet] = useState(100);
  const [session, setSession] = useState<any>(null);
  const [playerHand, setPlayerHand] = useState<string[]>([]);
  const [dealerVisible, setDealerVisible] = useState<string[]>([]);
  const [playerValue, setPlayerValue] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const deal = async () => {
    setLoading(true); setResult(null);
    sound.deal();
    try {
      const { data } = await api.post('/games/blackjack/deal', { bet });
      setSession(data.sessionData); setPlayerHand(data.playerHand);
      setDealerVisible(data.dealerVisible); setPlayerValue(data.playerValue);
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
    setLoading(false);
  };

  const action = async (act: string) => {
    if (!session) return;
    setLoading(true);
    sound.deal();
    try {
      const { data } = await api.post('/games/blackjack/action', { action: act, sessionData: session });
      if (data.bust) {
        setPlayerHand(data.playerHand); setPlayerValue(data.playerValue);
        setResult({ won: false, win: 0, bust: true }); setSession(null);
        sound.lose();
      } else if (data.won !== undefined) {
        setPlayerHand(data.playerHand); setDealerVisible(data.dealerHand);
        setPlayerValue(data.playerValue); setResult(data); setSession(null);
        data.won ? sound.win() : sound.lose();
        refreshWallet();
      } else {
        setSession(data.sessionData); setPlayerHand(data.playerHand); setPlayerValue(data.playerValue);
      }
    } catch {}
    setLoading(false);
  };

  const CardDisplay = ({ cards, label, value }: any) => (
    <div className="text-center">
      <p className="text-xs text-gray-400 mb-1">{label} ({value})</p>
      <div className="flex gap-2 justify-center flex-wrap">
        {cards?.map((c: string, i: number) => (
          <div key={i} className="w-10 h-14 rounded-lg flex items-center justify-center font-bold text-sm bg-white text-black">{c}</div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-5 space-y-4" style={{ background: '#13131f', border: '1px solid #1e1e30' }}>
        {(playerHand.length > 0 || dealerVisible.length > 0) && (
          <>
            <CardDisplay cards={dealerVisible} label="Dealer" value={result?.dealerValue || '?'} />
            <div className="border-t border-gray-700" />
            <CardDisplay cards={playerHand} label="You" value={playerValue} />
          </>
        )}
        {result && (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center p-3 rounded-xl"
            style={{ background: result.won ? 'rgba(16,185,129,0.1)' : result.tie ? 'rgba(245,200,66,0.1)' : 'rgba(239,68,68,0.1)' }}>
            <p className="font-black text-xl" style={{ color: result.won ? '#10b981' : result.tie ? '#f5c842' : '#ef4444' }}>
              {result.bust ? '💥 Bust!' : result.won ? `🃏 Win! +${result.win}` : result.tie ? '🤝 Push!' : '😢 Dealer wins'}
            </p>
          </motion.div>
        )}
      </div>
      {!session ? (
        <BetControls bet={bet} setBet={setBet} onPlay={deal} loading={loading} label="♠️ Deal Cards" />
      ) : (
        <div className="flex gap-3">
          <button className="btn-secondary flex-1" onClick={() => action('hit')} disabled={loading}>Hit</button>
          <button className="btn-primary flex-1" onClick={() => action('stand')} disabled={loading}>Stand</button>
        </div>
      )}
    </div>
  );
}

// ─── WHEEL ────────────────────────────────────────────────────────────────────
function WheelGame() {
  const { refreshWallet } = useAuthStore();
  const [bet, setBet] = useState(50);
  const [result, setResult] = useState<any>(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const play = async () => {
    if (spinning) return;
    setSpinning(true); setResult(null);
    sound.spin();
    try {
      const { data } = await api.post('/games/wheel/play', { bet });
      const spins = 5 * 360 + data.sectorIndex * (360 / 6);
      setRotation(r => r + spins);
      setTimeout(() => {
        setSpinning(false); setResult(data);
        data.win > 0 ? sound.win() : sound.lose();
        refreshWallet();
      }, 3000);
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); setSpinning(false); }
  };

  const SECTORS = [{ l: '2x', c: '#10b981' }, { l: '3x', c: '#6366f1' }, { l: '5x', c: '#f59e0b' }, { l: '10x', c: '#ef4444' }, { l: '0.5x', c: '#8b5cf6' }, { l: 'LOSE', c: '#374151' }];

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="relative w-48 h-48 mx-auto">
          <motion.div className="w-full h-full rounded-full overflow-hidden border-4" style={{ borderColor: '#f5c842' }}
            animate={{ rotate: rotation }} transition={{ duration: 3, ease: 'easeOut' }}>
            {SECTORS.map((s, i) => (
              <div key={i} className="absolute w-full h-full flex items-center justify-center"
                style={{ transform: `rotate(${i * 60}deg)`, clipPath: 'polygon(50% 50%, 100% 0, 100% 50%)' }}>
                <span className="text-xs font-bold text-white" style={{ transform: 'rotate(30deg) translateX(30px)' }}>{s.l}</span>
              </div>
            ))}
          </motion.div>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-8 border-transparent" style={{ borderBottomColor: '#f5c842' }} />
        </div>
        {result && (
          <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-2xl font-black mt-3"
            style={{ color: result.win > 0 ? '#10b981' : '#ef4444' }}>
            {result.win > 0 ? `🎉 ${result.sector.label}! +${result.win}` : '😢 No win'}
          </motion.p>
        )}
      </div>
      <BetControls bet={bet} setBet={setBet} onPlay={play} loading={spinning} label="🎡 Spin!" />
    </div>
  );
}

// ─── PLINKO ───────────────────────────────────────────────────────────────────
function PlinkoGame() {
  const { refreshWallet } = useAuthStore();
  const [bet, setBet] = useState(50);
  const [rows, setRows] = useState(8);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [ballPath, setBallPath] = useState<string[]>([]);

  const play = async () => {
    setLoading(true); setResult(null); setBallPath([]);
    sound.spin();
    try {
      const { data } = await api.post('/games/plinko/play', { bet, rows });
      setBallPath(data.path);
      setTimeout(() => {
        setResult(data);
        data.win > bet ? sound.win() : sound.lose();
        refreshWallet();
      }, data.path.length * 150);
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
    setLoading(false);
  };

  const MULTIPLIERS_8 = [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-4" style={{ background: '#13131f', border: '1px solid #1e1e30' }}>
        <div className="text-center mb-3">
          <div className="grid mb-2" style={{ gridTemplateColumns: `repeat(${MULTIPLIERS_8.length},1fr)`, gap: 4 }}>
            {MULTIPLIERS_8.map((m, i) => (
              <div key={i} className="rounded text-center py-1 text-xs font-bold"
                style={{ background: m >= 5 ? 'rgba(239,68,68,0.3)' : m >= 2 ? 'rgba(245,200,66,0.3)' : 'rgba(16,185,129,0.2)', color: m >= 2 ? '#f5c842' : '#10b981' }}>
                {m}x
              </div>
            ))}
          </div>
          {result && (
            <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-xl font-black"
              style={{ color: result.win > bet ? '#10b981' : '#ef4444' }}>
              {result.multiplier}x — {result.win > 0 ? `+${result.win}` : 'Lost'}
            </motion.p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-400 whitespace-nowrap">Rows: {rows}</label>
          <input type="range" min="4" max="16" value={rows} onChange={e => setRows(Number(e.target.value))} className="flex-1" style={{ accentColor: '#f5c842' }} />
        </div>
      </div>
      <BetControls bet={bet} setBet={setBet} onPlay={play} loading={loading} label="🎯 Drop!" />
    </div>
  );
}

// ─── LIMBO ────────────────────────────────────────────────────────────────────
function LimboGame() {
  const { refreshWallet } = useAuthStore();
  const [bet, setBet] = useState(50);
  const [target, setTarget] = useState(2.0);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const play = async () => {
    setLoading(true); setResult(null);
    sound.countdown();
    try {
      const { data } = await api.post('/games/limbo/play', { bet, target });
      setResult(data);
      data.win > 0 ? sound.win() : sound.lose();
      refreshWallet();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl p-6 text-center" style={{ background: 'linear-gradient(135deg,#0f0c29,#24243e)', border: '1px solid rgba(99,102,241,0.3)' }}>
        <motion.p key={result?.result} className="text-6xl font-black mb-2"
          style={{ color: result ? (result.win > 0 ? '#10b981' : '#ef4444') : '#fff' }}>
          {result ? `${result.result}x` : '?'}
        </motion.p>
        <p className="text-gray-400">Target: <span className="text-yellow-400 font-bold">{target}x</span></p>
        {result && <p className={`text-lg font-bold mt-2 ${result.win > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {result.win > 0 ? `+${result.win.toLocaleString()}` : 'Miss!'}
        </p>}
      </div>
      <div className="rounded-xl p-4" style={{ background: '#13131f', border: '1px solid #1e1e30' }}>
        <label className="text-xs text-gray-400 mb-2 block">Target: {target}x</label>
        <input type="range" min="1.1" max="100" step="0.1" value={target} onChange={e => setTarget(Number(e.target.value))} className="w-full" style={{ accentColor: '#f5c842' }} />
        <p className="text-xs text-gray-400 mt-1">Win chance: {(99 / target).toFixed(1)}%</p>
      </div>
      <BetControls bet={bet} setBet={setBet} onPlay={play} loading={loading} label="🚀 Launch!" />
    </div>
  );
}

// ─── GENERIC GAME ─────────────────────────────────────────────────────────────
function GenericGame({ gameType, icon, label }: any) {
  const { refreshWallet } = useAuthStore();
  const [bet, setBet] = useState(50);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const ENDPOINTS: Record<string, string> = {
    hilo: '/games/hilo/play', keno: '/games/keno/play', baccarat: '/games/baccarat/play',
    dragontiger: '/games/dragontiger/play', videopoker: '/games/videopoker/play',
    diceduel: '/games/diceduel/play', fruitcut: '/games/fruitcut/play',
    penalty: '/games/penalty/play', scratchcard: '/games/scratchcard/play',
    numberguess: '/games/numberguess/play', lucky6: '/games/lucky6/play',
    coinflip: '/games/coinflip/play',
  };

  const getBody = () => {
    if (gameType === 'hilo') return { bet, currentCard: 'A', prediction: 'hi' };
    if (gameType === 'keno') return { bet, picks: [3, 7, 12, 18, 25, 33, 41, 55] };
    if (gameType === 'baccarat') return { bet, selection: 'player' };
    if (gameType === 'dragontiger') return { bet, selection: 'dragon' };
    if (gameType === 'videopoker') return { bet, held: [] };
    if (gameType === 'penalty') return { bet, direction: 'left' };
    if (gameType === 'numberguess') return { bet, guess: Math.floor(Math.random() * 10) + 1 };
    if (gameType === 'lucky6') return { bet, picks: [3, 8, 15, 22, 27, 33] };
    return { bet };
  };

  const play = async () => {
    const endpoint = ENDPOINTS[gameType];
    if (!endpoint) return;
    setLoading(true); setResult(null); sound.spin();
    try {
      const { data } = await api.post(endpoint, getBody());
      setResult(data);
      data.win > 0 || data.won ? sound.win() : sound.lose();
      refreshWallet();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl p-6 text-center" style={{ background: '#13131f', border: '1px solid #1e1e30' }}>
        <p className="text-6xl mb-3">{icon}</p>
        {result ? (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
            <p className={`text-3xl font-black ${(result.win > 0 || result.won || result.scored) ? 'text-green-400' : 'text-red-400'}`}>
              {(result.win > 0 || result.won || result.scored) ? `+${result.win?.toLocaleString() || result.potentialWin?.toLocaleString() || 0}` : 'Lost!'}
            </p>
            {result.handName && <p className="text-gray-400 mt-1">{result.handName}</p>}
            {result.matches !== undefined && <p className="text-gray-400 mt-1">{result.matches} matches • {result.multiplier}x</p>}
            {result.outcome && <p className="text-gray-400 mt-1 capitalize">{result.outcome}</p>}
          </motion.div>
        ) : (
          <p className="text-gray-500">Place your bet and play!</p>
        )}
      </div>
      <BetControls bet={bet} setBet={setBet} onPlay={play} loading={loading} label={`${icon} Play!`} />
    </div>
  );
}

// ─── VIRTUAL SPORTS ───────────────────────────────────────────────────────────
function VirtualSportsGame() {
  const { refreshWallet } = useAuthStore();
  const [matches, setMatches] = useState<any[]>([]);
  const [bet, setBet] = useState(100);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/games/virtual/matches').then(r => setMatches(r.data.matches || [])).catch(() => {});
    const interval = setInterval(() => {
      api.get('/games/virtual/matches').then(r => setMatches(r.data.matches || [])).catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const placeBet = async (matchId: number, betType: string, selection: string, odds: number) => {
    setLoading(true);
    try {
      const { data } = await api.post('/games/virtual/bet', { matchId, betType, selection, stake: bet, odds });
      sound.coin();
      toast.success(`✅ Bet placed! Potential win: ${data.potentialWin}`);
      refreshWallet();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <label className="text-xs text-gray-400">Stake:</label>
        <input type="number" className="input flex-1" value={bet} onChange={e => setBet(Number(e.target.value))} />
      </div>
      {matches.length === 0 && <p className="text-center text-gray-500 py-8">No matches available. Check back soon!</p>}
      {matches.map((m: any) => (
        <div key={m.id} className="rounded-xl p-4" style={{ background: '#13131f', border: '1px solid #1e1e30' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold">{m.sport === 'football' ? '⚽' : '🏀'} {m.homeTeam} vs {m.awayTeam}</p>
            <span className={`badge ${m.status === 'live' ? 'badge-win' : m.status === 'finished' ? 'badge-loss' : 'badge-pending'}`}>{m.status}</span>
          </div>
          {m.status === 'finished' && (
            <p className="text-center font-black text-xl mb-3">{m.homeScore} - {m.awayScore}</p>
          )}
          {m.status === 'upcoming' && m.odds && (
            <div className="flex gap-2">
              <button onClick={() => placeBet(m.id, '1x2', 'home', m.odds.home)} disabled={loading}
                className="flex-1 py-2 rounded-xl text-sm font-bold text-center" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                1 {m.odds.home}x
              </button>
              <button onClick={() => placeBet(m.id, '1x2', 'draw', m.odds.draw)} disabled={loading}
                className="flex-1 py-2 rounded-xl text-sm font-bold text-center" style={{ background: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.3)' }}>
                X {m.odds.draw}x
              </button>
              <button onClick={() => placeBet(m.id, '1x2', 'away', m.odds.away)} disabled={loading}
                className="flex-1 py-2 rounded-xl text-sm font-bold text-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                2 {m.odds.away}x
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── MAIN GAME DETAIL PAGE ────────────────────────────────────────────────────
const GAME_META: Record<string, { label: string; icon: string; color: string }> = {
  crash: { label: 'Aviator', icon: '✈️', color: '#6366f1' },
  jetx: { label: 'JetX', icon: '✈️', color: '#8b5cf6' },
  spaceman: { label: 'Spaceman', icon: '👨‍🚀', color: '#06b6d4' },
  balloon: { label: 'Balloon', icon: '🎈', color: '#ec4899' },
  matador: { label: 'Matador', icon: '🐂', color: '#ef4444' },
  rocket: { label: 'Rocket', icon: '🚀', color: '#f97316' },
  slots: { label: 'Slots', icon: '🎰', color: '#f59e0b' },
  dice: { label: 'Dice', icon: '🎲', color: '#10b981' },
  coinflip: { label: 'Coin Flip', icon: '🪙', color: '#f5c842' },
  wheel: { label: 'Lucky Wheel', icon: '🎡', color: '#8b5cf6' },
  mines: { label: 'Mines', icon: '💣', color: '#10b981' },
  plinko: { label: 'Plinko', icon: '🎯', color: '#ec4899' },
  hilo: { label: 'HiLo', icon: '🃏', color: '#f59e0b' },
  keno: { label: 'Keno', icon: '🎱', color: '#06b6d4' },
  limbo: { label: 'Limbo', icon: '🚀', color: '#6366f1' },
  blackjack: { label: 'Blackjack', icon: '♠️', color: '#ef4444' },
  roulette: { label: 'Roulette', icon: '🎡', color: '#10b981' },
  baccarat: { label: 'Baccarat', icon: '🎴', color: '#8b5cf6' },
  dragontiger: { label: 'Dragon Tiger', icon: '🐉', color: '#ef4444' },
  videopoker: { label: 'Video Poker', icon: '🃏', color: '#6366f1' },
  diceduel: { label: 'Dice Duel', icon: '🎲', color: '#f97316' },
  fruitcut: { label: 'Fruit Cut', icon: '🍒', color: '#10b981' },
  penalty: { label: 'Penalty', icon: '⚽', color: '#22c55e' },
  scratchcard: { label: 'Scratch Card', icon: '🎫', color: '#f59e0b' },
  numberguess: { label: 'Number Guess', icon: '🔢', color: '#06b6d4' },
  lucky6: { label: 'Lucky 6', icon: '🎲', color: '#8b5cf6' },
  virtual: { label: 'Virtual Sports', icon: '🏆', color: '#22c55e' },
};

export default function GameDetailPage() {
  const { gameType } = useParams<{ gameType: string }>();
  const navigate = useNavigate();
  const { wallet } = useAuthStore();
  const meta = GAME_META[gameType || ''] || { label: gameType, icon: '🎮', color: '#6366f1' };
  const CRASH_TYPES = ['crash', 'jetx', 'spaceman', 'balloon', 'matador', 'rocket'];

  const renderGame = () => {
    if (CRASH_TYPES.includes(gameType || '')) return <CrashGame gameType={gameType} />;
    if (gameType === 'slots') return <SlotsGame />;
    if (gameType === 'dice') return <DiceGame />;
    if (gameType === 'coinflip') return <CoinFlipGame />;
    if (gameType === 'wheel') return <WheelGame />;
    if (gameType === 'mines') return <MinesGame />;
    if (gameType === 'roulette') return <RouletteGame />;
    if (gameType === 'blackjack') return <BlackjackGame />;
    if (gameType === 'plinko') return <PlinkoGame />;
    if (gameType === 'limbo') return <LimboGame />;
    if (gameType === 'virtual') return <VirtualSportsGame />;
    return <GenericGame gameType={gameType} icon={meta.icon} label={meta.label} />;
  };

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 p-4 pt-6" style={{ background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(10px)' }}>
        <button onClick={() => navigate('/games')} className="p-2 rounded-xl" style={{ background: '#13131f' }}>
          <ArrowLeft size={20} />
        </button>
        <span className="text-2xl">{meta.icon}</span>
        <div className="flex-1">
          <h1 className="font-black text-lg">{meta.label}</h1>
          <p className="text-xs text-gray-400">Balance: {Number(wallet?.balance || 0).toLocaleString()} coins</p>
        </div>
      </div>
      <div className="p-4">{renderGame()}</div>
    </div>
  );
}
