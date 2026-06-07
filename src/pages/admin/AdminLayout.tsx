import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, ArrowUpDown, CreditCard, Gamepad2, Tag, Radio, BarChart2, LogOut, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const NAV = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, color: '#f5c842' },
  { path: '/admin/users', label: 'Users', icon: Users, color: '#6366f1' },
  { path: '/admin/transactions', label: 'Transactions', icon: ArrowUpDown, color: '#10b981' },
  { path: '/admin/withdrawals', label: 'Withdrawals', icon: CreditCard, color: '#f97316' },
  { path: '/admin/games', label: 'Games', icon: Gamepad2, color: '#ec4899' },
  { path: '/admin/promos', label: 'Promos', icon: Tag, color: '#8b5cf6' },
  { path: '/admin/channels', label: 'Channels', icon: Radio, color: '#06b6d4' },
  { path: '/admin/analytics', label: 'Analytics', icon: BarChart2, color: '#f59e0b' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen" style={{ background: '#0a0a0f' }}>
      {/* Sidebar */}
      <aside className="w-58 flex-shrink-0 flex flex-col sticky top-0 h-screen"
        style={{ background: '#0d0d18', borderRight: '1px solid #1e1e30', width: 220 }}>
        {/* Logo */}
        <div className="p-5 border-b" style={{ borderColor: '#1e1e30' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg"
              style={{ background: 'linear-gradient(135deg,#f5c842,#d99a1a)' }}>
              👑
            </div>
            <div>
              <h1 className="text-sm font-black gold-text">Crown Prime</h1>
              <p className="text-xs text-gray-600">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ path, label, icon: Icon, color }) => {
            const active = pathname === path || (path !== '/admin' && pathname.startsWith(path));
            return (
              <button key={path} onClick={() => navigate(path)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative group"
                style={{
                  background: active ? `${color}15` : 'transparent',
                  color: active ? color : '#6b7280',
                }}>
                {active && (
                  <motion.div layoutId="admin-nav-bg"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: `${color}12` }}
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ background: active ? `${color}20` : 'transparent' }}>
                  <Icon size={15} />
                </div>
                <span className="flex-1 text-left font-semibold">{label}</span>
                {active && <ChevronRight size={12} className="opacity-50" />}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t" style={{ borderColor: '#1e1e30' }}>
          <button onClick={() => window.location.href = '/'}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-white transition-all hover:bg-white/5">
            <LogOut size={15} />
            <span className="font-medium">Back to App</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 px-6 py-3 flex items-center justify-between"
          style={{ background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1e1e30' }}>
          <p className="text-sm text-gray-500 font-medium">
            {NAV.find(n => n.path === pathname || (n.path !== '/admin' && pathname.startsWith(n.path)))?.label || 'Admin'}
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-gray-500">Online</span>
          </div>
        </div>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
