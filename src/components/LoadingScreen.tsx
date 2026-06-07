import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center" style={{ background: '#0a0a0f' }}>
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col items-center gap-6"
      >
        {/* Logo */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-2xl"
          style={{ background: 'linear-gradient(135deg,#f5c842,#d99a1a)', boxShadow: '0 0 40px rgba(245,200,66,0.4)' }}
        >
          👑
        </motion.div>

        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-black gold-text"
          >
            Crown Prime
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-sm text-gray-500 mt-1"
          >
            Casino Platform
          </motion.p>
        </div>

        {/* Spinner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.2 }}
                className="w-2 h-2 rounded-full"
                style={{ background: '#f5c842' }}
              />
            ))}
          </div>
          <p className="text-xs text-gray-600">Loading your casino…</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
