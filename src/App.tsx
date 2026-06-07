import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import WalletPage from './pages/WalletPage';
import GamesPage from './pages/GamesPage';
import ReferralsPage from './pages/ReferralsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import GameDetailPage from './pages/GameDetailPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminWithdrawals from './pages/admin/AdminWithdrawals';
import AdminGames from './pages/admin/AdminGames';
import AdminPromos from './pages/admin/AdminPromos';
import AdminChannels from './pages/admin/AdminChannels';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import LoadingScreen from './components/LoadingScreen';

declare global { interface Window { Telegram?: { WebApp?: any } } }

function App() {
  const { user, login, isLoading } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const tg = window.Telegram?.WebApp;
        if (tg) {
          tg.ready();
          tg.expand();
          tg.setHeaderColor('#0a0a0f');
          tg.setBackgroundColor('#0a0a0f');
        }

        const url = new URL(window.location.href);
        const ref = url.searchParams.get('ref') || undefined;

        const initData = tg?.initData || 'dev_bypass';
        if (!user && initData) {
          await login(initData, ref);
        }
      } catch (err) {
        console.error('Init error:', err);
      } finally {
        setInitialized(true);
      }
    };
    init();
  }, []);

  if (!initialized || isLoading) return <LoadingScreen />;

  const isAdmin = user?.role === 'admin';
  const path = window.location.pathname;

  // Admin panel route
  if (path.startsWith('/admin') && isAdmin) {
    return (
      <>
        <Toaster position="top-center" toastOptions={{ style: { background: '#13131f', color: '#fff', border: '1px solid #1e1e30' } }} />
        <BrowserRouter>
          <Routes>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="transactions" element={<AdminTransactions />} />
              <Route path="withdrawals" element={<AdminWithdrawals />} />
              <Route path="games" element={<AdminGames />} />
              <Route path="promos" element={<AdminPromos />} />
              <Route path="channels" element={<AdminChannels />} />
              <Route path="analytics" element={<AdminAnalytics />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </>
    );
  }

  return (
    <>
      <Toaster position="top-center" toastOptions={{ style: { background: '#13131f', color: '#fff', border: '1px solid #1e1e30' } }} />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/games" element={<GamesPage />} />
            <Route path="/games/:gameType" element={<GameDetailPage />} />
            <Route path="/referrals" element={<ReferralsPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            {isAdmin && <Route path="/admin/*" element={<Navigate to="/admin" />} />}
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
