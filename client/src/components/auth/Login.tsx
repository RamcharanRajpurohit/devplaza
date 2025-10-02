import React, { useState,useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";
import axios from "axios";
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';
import { useAuthStore } from '../../services/authState';
import { ArrowLeft } from "lucide-react";

const API = import.meta.env.VITE_API_BASE || "https://localhost:5000";

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
   const { isAuthenticated } = useAuth();
  
      useEffect(() => {
      if (isAuthenticated) {
          // If user is authenticated, redirect to dashboard
          window.location.href = '/dashboard';
          }
      }, [isAuthenticated]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🔄 Attempting login for:', email);
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(email, password);

      if (response.data.accessToken) {
        console.log('✅ Login successful');
        login(response.data.accessToken, response.data.user);
        console.log(response.data.user);
        navigate('/dashboard');
      } else {
        setError(response.data.message || 'Unexpected response');
      }
    } catch (err: any) {
      const status = err.response?.status;
      const data = err.response?.data;

      console.error('❌ Login error:', data);

      if (status === 403 && data?.code === "USER_NOT_VERIFIED") {
        useAuthStore.getState().setEmail(email);
        console.log('🚀 Redirecting to OTP verification for:', email);
        navigate('/auth/otp');
      } else {
        setError(data?.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    console.log('🔄 Processing Google login');
    try {
      const res = await axios.post(`${API}/api/auth/google`, { id_token: credentialResponse.credential }, { withCredentials: true });
      login(res.data.accessToken, res.data.user);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      
    } catch (err: any) {
      setError(err.response?.data?.message || "Google login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 flex items-center justify-center px-4 relative">

      {/* 🆕 Back button OUTSIDE the frame at top-left corner */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 flex items-center text-md text-red-400 hover:text-red-300 transition-colors duration-200"
      >
        <ArrowLeft className="h-5 w-5 mr-2 " /> Back
      </button>

      <div className="max-w-md w-full bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-lg p-8 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
          Login to DevPlaza
        </h2>
        
        {error && (
          <div className="bg-red-900/50 border border-red-800 text-red-200 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-red-600 focus:outline-none transition-all duration-200"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-red-600 focus:outline-none transition-all duration-200"
              placeholder="Password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 py-3 rounded-lg text-sm font-medium transition-all duration-300 shadow-lg shadow-red-900/30 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-red-200" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v16a8 8 0 01-8-8z"/>
                </svg>
                <span>Loading...</span>
              </>
            ) : (
              <span>Login</span>
            )}
          </button>

          <div className="mt-4 text-center">
            <Link
              to="/forgot-password"
              className="text-sm text-red-400 hover:cursor-pointer hover:text-red-300 transition-colors duration-200"
            >
              Forgot your password?
            </Link>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-br from-gray-900 via-red-950 to-black text-gray-400 font-medium">OR</span>
            </div>
          </div>

          <div className="flex justify-center w-full">
            <div className="">
              <GoogleLogin 
                onSuccess={handleGoogleSuccess} 
                onError={() => setError("Google login failed")}
                size="large"
                width="100%"
              />
            </div>
          </div>

          <div className="mt-6 text-center">
            <span className="text-sm text-gray-400">Don't have an account? </span>
            <Link to="/auth/signup" className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors duration-200">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
