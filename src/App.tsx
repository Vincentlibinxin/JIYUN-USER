import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/auth';
import Layout from '@/components/Layout';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import RegisterSuccessPage from '@/pages/RegisterSuccessPage';
import HomePage from '@/pages/HomePage';
import ParcelsPage from '@/pages/ParcelsPage';
import ForecastPage from '@/pages/ForecastPage';
import QuotePage from '@/pages/QuotePage';
import ProfilePage from '@/pages/ProfilePage';

function AuthLoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0f1012] text-white flex items-center justify-center">
      <div className="flex items-center gap-2 text-sm text-white/70">
        <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
        正在验证登录状态...
      </div>
    </div>
  );
}

function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout />;
}

function GuestOnlyRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<GuestOnlyRoute><LoginPage /></GuestOnlyRoute>} />
          <Route path="/register" element={<GuestOnlyRoute><RegisterPage /></GuestOnlyRoute>} />
          <Route path="/register-success" element={<GuestOnlyRoute><RegisterSuccessPage /></GuestOnlyRoute>} />
          
          <Route element={<ProtectedLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/parcels" element={<ParcelsPage />} />
            <Route path="/forecast" element={<ForecastPage />} />
            <Route path="/quote" element={<QuotePage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
