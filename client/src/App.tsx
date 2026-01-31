import './App.css'
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Singup from './components/auth/singup';
import DevPlazaForgotPassword from './components/auth/forgot';
import AuthPage from './components/auth/Login';
import CodingProfileDashboard from './components/dashboard/profile';
import ProtectedRoute from './components/common/ProtectedRoute';
import Settings from './components/dashboard/Settings';
import NotFound from './components/common/NotFound';
import { GoogleOAuthProvider } from '@react-oauth/google';
import DevPlazaOTP from './components/auth/otp';
import UserInfoForm from './components/auth/UserInfoForm';
import DevPlazaLanding from './components/landing/main';
import ProblemOfTheDay from './components/potd/ProblemOfTheDay';
import Contests from './components/contests/Contests';

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-xl font-bold text-red-600">Configuration Error</h1>
          <p className="text-gray-600 mt-2">Google Client ID not found</p>
          <p className="text-sm text-gray-500 mt-1">
            Check your .env file and restart the dev server
          </p>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <ToastProvider>
        
            <BrowserRouter>
              <AuthRoutes />
            </BrowserRouter>
          
        </ToastProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

function AuthRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Auth Routes with redirect */}
      <Route
        path="/auth/login"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <AuthPage />}
      />
      <Route
        path="/auth/signup"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Singup />}
      />
      <Route
        path="/forgot-password"
        element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <DevPlazaForgotPassword />
        }
      />
      <Route
        path="/auth/otp"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <DevPlazaOTP />}
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <CodingProfileDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/:username"
        element={
        
            <CodingProfileDashboard/>
          
        }
      />

      {/* Public + Default Routes */}
      <Route path="/" element={<DevPlazaLanding />} />
      <Route path="/potd" element={<ProblemOfTheDay />} />
      <Route path="/contests" element={<Contests />} />
      <Route path="/complete-profile" element={<UserInfoForm />} />
      <Route path="/profile/:username" element={<CodingProfileDashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
