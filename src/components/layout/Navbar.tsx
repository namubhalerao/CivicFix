import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Compass,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Shield,
  Sparkles,
  User,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatTimeAgo } from '../../utils/formatters';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, isAuthenticated, signOut } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-6 lg:px-8 pt-3 pb-2 transition-all">
      <div className="max-w-7xl mx-auto backdrop-blur-xl bg-slate-950/80 border border-slate-800/80 rounded-2xl px-4 sm:px-6 py-3 shadow-2xl shadow-cyan-950/20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
                CF
              </span>
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-500 rounded-full border border-slate-950" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
              CivicFix
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Live
              </span>
            </span>
            <p className="text-[10px] text-slate-400 hidden sm:block">Civic Issue Engine</p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              isActive('/')
                ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            Home
          </Link>

          <Link
            to="/explore"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              isActive('/explore')
                ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Explore Issues
          </Link>

          <Link
            to="/track"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              isActive('/track')
                ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Track Status
          </Link>

          {isAuthenticated && (
            <Link
              to="/dashboard"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                isActive('/dashboard')
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Citizen Dashboard
            </Link>
          )}

          <Link
            to="/impact"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              isActive('/impact')
                ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Community Impact
          </Link>

          {role === 'admin' && (
            <Link
              to="/admin"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                location.pathname.startsWith('/admin')
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-lg shadow-rose-500/10'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Command Center
            </Link>
          )}
        </nav>

        {/* Action Controls & User Profile */}
        <div className="flex items-center gap-3">
          {/* Main Attention CTA: 🚨 REPORT AN ISSUE */}
          <Link
            to="/report"
            className="relative group overflow-hidden rounded-xl p-[1px] font-bold text-xs shadow-lg shadow-rose-500/25 transition-all hover:scale-[1.03] active:scale-[0.98]"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 animate-gradient-x" />
            <div className="relative px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-700 rounded-[11px] text-white flex items-center gap-2">
              <span className="animate-pulse text-sm">🚨</span>
              <span className="tracking-wide uppercase font-extrabold text-[11px]">
                Report Issue
              </span>
            </div>
          </Link>

          {/* Notifications Dropdown */}
          {isAuthenticated && (
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-slate-950 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Panel */}
              {showNotifs && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-50 text-slate-200 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Live Notifications ({unreadCount} new)
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[11px] text-cyan-400 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markAsRead(notif.id)}
                          className={`p-3 rounded-xl text-xs transition-colors cursor-pointer border ${
                            notif.read
                              ? 'bg-slate-950/40 border-slate-800/60 text-slate-400'
                              : 'bg-cyan-500/5 border-cyan-500/30 text-slate-200 shadow-sm shadow-cyan-500/5'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-slate-200">{notif.title}</span>
                            <span className="text-[10px] text-slate-400">
                              {formatTimeAgo(notif.created_at)}
                            </span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-slate-300">
                            {notif.message}
                          </p>
                          {notif.report_id && (
                            <div className="mt-1.5 flex justify-end">
                              <Link
                                to={`/track?id=${notif.report_id}`}
                                className="text-[10px] font-bold text-cyan-400 hover:underline"
                                onClick={() => setShowNotifs(false)}
                              >
                                View Issue →
                              </Link>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile / Login */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 hover:border-slate-700 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-slate-950 font-bold text-xs">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-white leading-tight">
                    {user?.name}
                  </div>
                  <div className="text-[10px] text-cyan-400 font-mono">
                    {user?.points || 0} pts
                  </div>
                </div>
              </Link>

              <button
                onClick={handleSignOut}
                className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/auth"
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:border-slate-700 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/admin/login"
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 transition-colors flex items-center gap-1"
                title="Admin Portal"
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
          >
            <span className="text-sm">☰</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-2 text-xs">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl bg-slate-950/60 text-slate-200"
          >
            Home
          </Link>
          <Link
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl bg-slate-950/60 text-slate-200"
          >
            Explore Issues
          </Link>
          <Link
            to="/track"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl bg-slate-950/60 text-slate-200"
          >
            Track Status
          </Link>
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl bg-slate-950/60 text-slate-200"
          >
            Citizen Dashboard
          </Link>
          <Link
            to="/impact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl bg-slate-950/60 text-slate-200"
          >
            Community Impact
          </Link>
          {role === 'admin' && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl bg-rose-500/20 text-rose-300 font-bold"
            >
              Admin Command Center
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
