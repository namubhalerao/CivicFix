import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Key, Lock, Mail, Shield, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ADMIN_CONFIG } from '../utils/constants';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();

  const [email, setEmail] = useState(ADMIN_CONFIG.EMAIL);
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await adminLogin(email, password);
      navigate('/admin');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      {/* Red/Rose ambient warning glow */}
      <div className="absolute w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-md rounded-3xl bg-slate-900/95 border border-rose-500/40 p-8 shadow-2xl shadow-rose-950/40 backdrop-blur-xl space-y-6">
        {/* Admin Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-red-700 p-[1px] shadow-lg shadow-rose-500/30 mb-2">
            <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
              <Shield className="w-7 h-7 text-rose-400" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-extrabold uppercase tracking-wider">
            <ShieldCheck className="w-3 h-3" />
            Authorized Personnel Only
          </div>

          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Command Center Login
          </h1>
          <p className="text-xs text-slate-400">
            Secure municipal triage & issue dispatch console
          </p>
        </div>

        {/* Error notice */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Admin Official Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@civicfix.org"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Admin Master Password
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 via-rose-600 to-red-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-rose-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating Official...' : 'Access Command Center'}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800 text-center">
          <Link
            to="/auth"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Citizen Portal
          </Link>
        </div>
      </div>
    </div>
  );
};
