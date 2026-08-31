import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, HardHat, LayoutDashboard, Map } from 'lucide-react';

export const AdminNavTabs: React.FC = () => {
  const location = useLocation();

  const tabs = [
    {
      name: 'Operations Console',
      path: '/admin',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: 'Municipal Teams',
      path: '/admin/teams',
      icon: HardHat,
    },
    {
      name: 'City Analytics',
      path: '/admin/analytics',
      icon: BarChart3,
    },
    {
      name: 'Incident Map',
      path: '/admin/map',
      icon: Map,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.exact
          ? location.pathname === tab.path
          : location.pathname.startsWith(tab.path);

        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              isActive
                ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-lg shadow-rose-900/40 border border-rose-500/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{tab.name}</span>
          </Link>
        );
      })}
    </div>
  );
};
