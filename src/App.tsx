import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { BotpressChatbot } from './components/layout/BotpressChatbot';

// Pages
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { ReportIssuePage } from './pages/ReportIssuePage';
import { TrackIssuePage } from './pages/TrackIssuePage';
import { ExploreIssuesPage } from './pages/ExploreIssuesPage';
import { MyReportsPage } from './pages/MyReportsPage';
import { CommunityImpactPage } from './pages/CommunityImpactPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminTeamsPage } from './pages/AdminTeamsPage';
import { AdminAnalyticsPage } from './pages/AdminAnalyticsPage';
import { AdminMapPage } from './pages/AdminMapPage';

// Admin Protected Route Wrapper
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-400 font-mono text-xs">
        Authenticating Secure Session...
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
            {/* Global Navbar */}
            <Navbar />

            {/* Main View Router */}
            <main className="flex-1">
              <Routes>
                {/* Public / Citizen Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/dashboard" element={<CitizenDashboard />} />
                <Route path="/report" element={<ReportIssuePage />} />
                <Route path="/track" element={<TrackIssuePage />} />
                <Route path="/explore" element={<ExploreIssuesPage />} />
                <Route path="/my-reports" element={<MyReportsPage />} />
                <Route path="/impact" element={<CommunityImpactPage />} />
                <Route path="/profile" element={<ProfilePage />} />

                {/* Admin Command Center Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/teams"
                  element={
                    <AdminRoute>
                      <AdminTeamsPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/analytics"
                  element={
                    <AdminRoute>
                      <AdminAnalyticsPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/map"
                  element={
                    <AdminRoute>
                      <AdminMapPage />
                    </AdminRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Global Footer */}
            <Footer />

            {/* Global Botpress AI Chatbot */}
            <BotpressChatbot />
          </div>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
