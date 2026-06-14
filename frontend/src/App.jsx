import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { LayoutDashboard, Bot, Boxes, ClipboardList, CreditCard, LogOut, Zap } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Splash from './components/Splash.jsx';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AIAssistant from './pages/AIAssistant.jsx';
import Inventory from './pages/Inventory.jsx';
import Orders from './pages/Orders.jsx';
import Subscription from './pages/Subscription.jsx';

function Shell({ children }) {
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Brain', icon: LayoutDashboard },
    { to: '/ai', label: 'AI', icon: Bot },
    { to: '/inventory', label: 'Twin', icon: Boxes },
    { to: '/orders', label: 'Orders', icon: ClipboardList },
    { to: '/subscription', label: 'Plan', icon: CreditCard }
  ];

  return (
    <div className="min-h-screen bg-base text-ink font-body flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-line bg-base/90 backdrop-blur grid-bg">
        <div className="flex items-center justify-between px-4 py-3 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan to-amber flex items-center justify-center shadow-glow">
              <Zap size={16} className="text-base" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-display font-bold tracking-wide text-sm leading-none">ACIP</div>
              <div className="text-[10px] text-mute font-mono leading-none mt-0.5">COMPANY OS // ONLINE</div>
            </div>
          </div>
          {user && (
            <button onClick={logout} className="text-mute hover:text-bad transition-colors p-2" aria-label="Log out">
              <LogOut size={18} />
            </button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-5 pb-24">
        {children}
      </main>

      {/* Bottom nav (mobile-first) */}
      {user && (
        <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-line bg-panel/95 backdrop-blur">
          <div className="max-w-5xl mx-auto grid grid-cols-5">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                    isActive ? 'text-cyan' : 'text-mute hover:text-ink'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="font-mono tracking-wide">{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { user } = useAuth();
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('acip_booted'));

  const handleSplashDone = () => {
    sessionStorage.setItem('acip_booted', '1');
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && <Splash onDone={handleSplashDone} />}
      <Shell>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/ai" element={<PrivateRoute><AIAssistant /></PrivateRoute>} />
          <Route path="/inventory" element={<PrivateRoute><Inventory /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
          <Route path="/subscription" element={<PrivateRoute><Subscription /></PrivateRoute>} />
          <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
        </Routes>
      </Shell>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
