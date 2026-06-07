import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

interface User { id: number; telegramId: string; username?: string; firstName?: string; photoUrl?: string; role: string; referralCode: string; }
interface Wallet { balance: string; totalEarned: string; totalSpent: string; referralEarnings: string; bonusEarnings: string; gameWinnings: string; }

interface AuthState {
  user: User | null;
  wallet: Wallet | null;
  token: string | null;
  isLoading: boolean;
  login: (initData: string, referralCode?: string) => Promise<void>;
  refreshWallet: () => Promise<void>;
  logout: () => void;
  setWallet: (w: Wallet) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      wallet: null,
      token: null,
      isLoading: false,

      login: async (initData, referralCode) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/telegram', { initData, referralCode });
          set({ user: data.user, token: data.token, isLoading: false });
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          await get().refreshWallet();
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      refreshWallet: async () => {
        try {
          const { data } = await api.get('/wallet');
          set({ wallet: data.wallet });
        } catch {}
      },

      setWallet: (wallet) => set({ wallet }),

      logout: () => {
        set({ user: null, wallet: null, token: null });
        delete api.defaults.headers.common['Authorization'];
      },
    }),
    { name: 'crown-prime-auth', partialize: (s) => ({ token: s.token, user: s.user }) }
  )
);
