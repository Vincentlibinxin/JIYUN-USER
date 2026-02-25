import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/lib/auth';
import Layout from '@/components/Layout';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import RegisterSuccessPage from '@/pages/RegisterSuccessPage';
import HomePage from '@/pages/HomePage';
import ParcelsPage from '@/pages/ParcelsPage';
import ForecastPage from '@/pages/ForecastPage';
import QuotePage from '@/pages/QuotePage';
import ProfilePage from '@/pages/ProfilePage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register-success" element={<RegisterSuccessPage />} />
          
          <Route element={<Layout />}>
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
