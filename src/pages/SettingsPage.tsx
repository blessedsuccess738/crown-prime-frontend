import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sound } from '../services/soundService';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(true);

  useEffect(() => {
    const prefs = JSON.parse(localStorage.getItem('crown-prefs') || '{}');
    if (prefs.sound !== undefined) setSoundEnabled(prefs.sound);
    if (prefs.music !== undefined) setMusicEnabled(prefs.music);
    if (prefs.notif !== undefined) setNotifEnabled(prefs.notif);
  }, []);

  const save = (key: string, val: boolean) => {
    const prefs = JSON.parse(localStorage.getItem('crown-prefs') || '{}');
    prefs[key] = val;
    localStorage.setItem('crown-prefs', JSON.stringify(prefs));
    if (key === 'sound') { setSoundEnabled(val); sound.setEnabled(val); }
    if (key === 'music') { setMusicEnabled(val); sound.setMusicEnabled(val); }
    if (key === 'notif') setNotifEnabled(val);
    toast.success('Settings saved');
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)} className="relative w-12 h-6 rounded-full transition-colors" style={{ background: value ? 'linear-gradient(135deg,#f5c842,#d99a1a)' : '#1e1e30' }}>
      <motion.div animate={{ x: value ? 24 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white" />
    </button>
  );

  const SETTINGS = [
    { key: 'sound', label: 'Game Sounds', desc: 'Win/lose/spin effects', icon: '🔊', value: soundEnabled, onChange: (v: boolean) => save('sound', v) },
    { key: 'music', label: 'Background Music', desc: 'Casino ambient music', icon: '🎵', value: musicEnabled, onChange: (v: boolean) => save('music', v) },
    { key: 'notif', label: 'Notifications', desc: 'Bonus & reward alerts', icon: '🔔', value: notifEnabled, onChange: (v: boolean) => save('notif', v) },
  ];

  return (
    <div className="min-h-screen p-4 pt-6 space-y-5">
      <h1 className="text-2xl font-black">Settings</h1>

      <div className="space-y-3">
        {SETTINGS.map(({ key, label, desc, icon, value, onChange }) => (
          <motion.div key={key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-4 flex items-center gap-4" style={{ background: '#13131f', border: '1px solid #1e1e30' }}>
            <span className="text-2xl">{icon}</span>
            <div className="flex-1">
              <p className="font-semibold text-sm">{label}</p>
              <p className="text-xs text-gray-400">{desc}</p>
            </div>
            <Toggle value={value} onChange={onChange} />
          </motion.div>
        ))}
      </div>

      <div className="rounded-xl p-4 space-y-3" style={{ background: '#13131f', border: '1px solid #1e1e30' }}>
        <p className="font-semibold">ℹ️ About</p>
        <div className="space-y-2 text-sm text-gray-400">
          <p>👑 Crown Prime Casino v1.0.0</p>
          <p>🎮 28 Games Available</p>
          <p>🔒 Provably Fair Gaming</p>
          <p>⚡ Powered by Socket.IO</p>
          <p>💳 Payments by Paystack</p>
        </div>
      </div>
    </div>
  );
}
