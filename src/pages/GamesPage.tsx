import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import { sound } from '../services/soundService';
import api from '../services/api';

const ALL_GAMES = [
  { type: 'crash', label: 'Aviator', img: '/games/crash/rocket.png', color: '#6366f1', category: 'crash', hot: true },
  { type: 'jetx', label: 'JetX', icon: '🚀', color: '#8b5cf6', category: 'crash', hot: true },
  { type: 'spaceman', label: 'Spaceman', icon: '👨‍🚀', color: '#06b6d4', category: 'crash' },
  { type: 'balloon', label: 'Balloon', icon: '🎈', color: '#ec4899', category: 'crash' },
  { type: 'matador', label: 'Matador', icon: '🐂', color: '#ef4444', category: 'crash' },
  { type: 'rocket', label: 'Rocket', img: '/games/crash/rocket.png', color: '#f97316', category: 'crash' },
  { type: 'slots', label: 'Slots', icon: '🎰', color: '#f59e0b', category: 'casino', hot: true },
  { type: 'dice', label: 'Dice', icon: '🎲', color: '#10b981', category: 'casino' },
  { type: 'coinflip', label: 'Coin Flip', icon: '🪙', color: '#f5c842', category: 'casino' },
  { type: 'wheel', label: 'Lucky Wheel', icon: '🎡', color: '#8b5cf6', category: 'casino' },
  { type: 'mines', label: 'Mines', img: '/games/mines/mine.png', color: '#10b981', category: 'casino', hot: true },
  { type: 'plinko', label: 'Plinko', icon: '🎯', color: '#ec4899', category: 'casino' },
  { type: 'limbo', label: 'Limbo', icon: '🚀', color: '#6366f1', category: 'casino' },
  { type: 'hilo', label: 'HiLo', icon: '🃏', color: '#f59e0b', category: 'casino' },
  { type: 'keno', label: 'Keno', icon: '🎱', color: '#06b6d4', category: 'casino' },
  { type: 'blackjack', label: 'Blackjack', icon: '♠️', color: '#ef4444', category: 'table' },
  { type: 'roulette', label: 'Roulette', icon: '🎡', color: '#10b981', category: 'table', hot: true },
  { type: 'baccarat', label: 'Baccarat', icon: '🎴', color: '#8b5cf6', category: 'table' },
  { type: 'dragontiger', label: 'Dragon Tiger', icon: '🐉', color: '#ef4444', category: 'table' },
  { type: 'videopoker', label: 'Video Poker', icon: '🃏', color: '#6366f1', category: 'table' },
  { type: 'diceduel', label: 'Dice Duel', icon: '🎲', color: '#f97316', category: 'table' },
  { type: 'fruitcut', label: 'Fruit Cut', icon: '🍒', color: '#10b981', category: 'instant' },
  { type: 'penalty', label: 'Penalty', icon: '⚽', color: '#22c55e', category: 'instant' },
  { type: 'scratchcard', label: 'Scratch Card', icon: '🎫', color: '#f59e0b', category: 'instant' },
  { type: 'numberguess', label: 'Number Guess', icon: '🔢', color: '#06b6d4', category: 'instant' },
  { type: 'lucky6', label: 'Lucky 6', icon: '🎲', color: '#8b5cf6', category: 'instant' },
  { type: 'virtual', label: 'Virtual Sports', icon: '🏆', color: '#22c55e', category: 'virtual', hot: true },
];

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '🎮' },
  { id: 'crash', label: 'Crash', icon: '✈️' },
  { id: 'casino', label: 'Casino', icon: '🎰' },
  { id: 'table', label: 'Table', icon: '♠️' },
  { id: 'instant', label: 'Instant', icon: '⚡' },
  { id: 'virtual', label: 'Virtual', icon: '⚽' },
];

export default function GamesPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [enabledGames, setEnabledGames] = useState<string[]>([]);

  useEffect(() => {
    api.get('/games').then(r => {
      const enabled = r.data.games?.filter((g: any) => g.isEnabled).map((g: any) => g.gameType) || [];
      setEnabledGames(enabled);
    }).catch(() => setEnabledGames(ALL_GAMES.map(g => g.type)));
  }, []);

  const filtered = ALL_GAMES.filter(g => {
    const matchCat = category === 'all' || g.category === category;
    const matchSearch = !search || g.label.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const hot = filtered.filter(g => g.hot && (enabledGames.length === 0 || enabledGames.includes(g.type)));

  return (
    <div className="min-h-screen p-4 pt-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">Games</h1>
        <div className="text-xs text-gray-500">{filtered.length} games</div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input className="input pl-10 text-sm" placeholder="Search games…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCategory(c.id)}
            className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap"
            style={{
              background: category === c.id ? 'linear-gradient(135deg,#f5c842,#d99a1a)' : '#13131f',
              border: `1px solid ${category === c.id ? 'transparent' : '#1e1e30'}`,
              color: category === c.id ? '#000' : '#9ca3af',
            }}>
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {/* Hot Games Row */}
      {hot.length > 0 && !search && category === 'all' && (
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">🔥 Hot Games</p>
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
            {hot.map(g => (
              <motion.button key={g.type} whileTap={{ scale: 0.93 }}
                className="flex-shrink-0 w-28 rounded-xl p-3 flex flex-col items-center gap-2 relative overflow-hidden"
                style={{ background: `linear-gradient(135deg,${g.color}28,${g.color}10)`, border: `1px solid ${g.color}40` }}
                onClick={() => { sound.click(); navigate(`/games/${g.type}`); }}>
                <span className="absolute top-1.5 right-1.5 px-1 rounded font-black text-white"
                  style={{ background: '#ef4444', fontSize: 8 }}>HOT</span>
                {'img' in g && g.img
                  ? <img src={g.img} alt={g.label} className="w-10 h-10 object-contain"
                    onError={e => { (e.target as any).style.display = 'none'; }} />
                  : <span className="text-3xl">{(g as any).icon}</span>
                }
                <span className="text-xs font-bold text-center">{g.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* All Games Grid */}
      <div>
        {(search || category !== 'all') && (
          <p className="text-xs text-gray-500 mb-3">{filtered.length} results</p>
        )}
        <div className="grid grid-cols-3 gap-3">
          {filtered.map((g, i) => {
            const disabled = enabledGames.length > 0 && !enabledGames.includes(g.type);
            return (
              <motion.button key={g.type}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.025 }}
                whileTap={{ scale: 0.92 }}
                className={`rounded-xl p-3 flex flex-col items-center gap-2 relative overflow-hidden transition-all ${disabled ? 'opacity-40' : ''}`}
                style={{ background: `linear-gradient(135deg,${g.color}1e,${g.color}08)`, border: `1px solid ${g.color}2e` }}
                onClick={() => { if (disabled) return; sound.click(); navigate(`/games/${g.type}`); }}
              >
                {g.hot && !disabled && (
                  <span className="absolute top-1 right-1 px-1 rounded font-black text-white"
                    style={{ background: '#ef4444', fontSize: 7 }}>HOT</span>
                )}
                {disabled && (
                  <span className="absolute top-1 right-1 px-1 rounded font-black text-white"
                    style={{ background: '#555', fontSize: 7 }}>OFF</span>
                )}
                {'img' in g && g.img
                  ? <img src={g.img} alt={g.label} className="w-9 h-9 object-contain"
                    onError={e => { (e.target as any).style.display = 'none'; }} />
                  : <span className="text-3xl">{(g as any).icon}</span>
                }
                <span className="text-xs font-semibold text-center leading-tight">{g.label}</span>
              </motion.button>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Search size={32} className="mx-auto mb-2 opacity-20" />
            <p>No games found for "{search}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
