import './App.css'
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Singup from './components/auth/singup';
import DevPlazaForgotPassword from './components/auth/forgot';
import AuthPage from './components/auth/Login';
import CodingProfileDashboard from './components/user/showUser';
import ProtectedRoute from './components/common/ProtectedRoute';
import PublicProfile from './components/profile/PublicProfile';
import Settings from './components/dashboard/Settings';
import NotFound from './components/common/NotFound';
import { GoogleOAuthProvider } from '@react-oauth/google';
import DevPlazaOTP from './components/auth/otp';
import { SignupProvider } from './context/SignupContext';
import ShowUser from './components/user/showUser';
import UserInfoForm from './components/auth/UserInfoForm';




function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!googleClientId) {
    console.error('Google Client ID not found in environment variables');
    console.error('Make sure VITE_GOOGLE_CLIENT_ID is set in your .env file');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-xl font-bold text-red-600">Configuration Error</h1>
          <p className="text-gray-600 mt-2">Google Client ID not found</p>
          <p className="text-sm text-gray-500 mt-1">Check your .env file and restart the dev server</p>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <ToastProvider>
          <SignupProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/auth/*" element={<AuthPage />} />
                <Route path="/auth/login" element={<AuthPage />} />
                <Route path="/auth/signup" element={<Singup/>} />
                <Route path="/forgot-password" element={<DevPlazaForgotPassword />} />
                <Route path ="/auth/otp" element={<DevPlazaOTP />}/>
                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <CodingProfileDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
                <Route path="/complete-profile" element={<UserInfoForm/>} />
                <Route 
                  path="/user/:username" 
                  element={
                    <ProtectedRoute>
                      <ShowUser />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Public Profile Route */}
                <Route path="/profile/:username" element={<PublicProfile />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </SignupProvider>
        </ToastProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}

export default App