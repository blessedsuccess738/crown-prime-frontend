import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Wallet, Gamepad2, Users, Trophy, User } from 'lucide-react';
import { motion } from 'framer-motion';

const NAV = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/wallet', icon: Wallet, label: 'Wallet' },
  { path: '/games', icon: Gamepad2, label: 'Games' },
  { path: '/referrals', icon: Users, label: 'Refer' },
  { path: '/leaderboard', icon: Trophy, label: 'Top' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function Layout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen pb-20">
      <Outlet />
      <nav className="nav-bar">
        {NAV.map(({ path, icon: Icon, label }) => {
          const active = pathname === path || (path !== '/' && pathname.startsWith(path));
          return (
            <button
              key={path}
              className={`nav-item ${active ? 'active' : ''}`}
              onClick={() => navigate(path)}
            >
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: 'rgba(245,200,66,0.07)', zIndex: -1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <Icon
                size={20}
                strokeWidth={active ? 2.5 : 1.8}
                style={{ color: active ? '#f5c842' : undefined }}
              />
              <span style={{ color: active ? '#f5c842' : undefined }}>{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
