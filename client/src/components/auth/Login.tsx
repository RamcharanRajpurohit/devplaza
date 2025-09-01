import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';
import { useAuthStore } from '../../services/authState';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🔄 Attempting login for:', email);
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      console.log('✅ Login successful');
      login(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('❌ Login error:', err);
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log('🔄 Navigating to forgot password with email:', email);
    useAuthStore.getState().setEmail(email);
    navigate('/auth/forgot-password');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 flex items-center justify-center px-4">
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
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:ring-2 focus:ring-red-600 focus:outline-none transition-all duration-200"
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
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:ring-2 focus:ring-red-600 focus:outline-none transition-all duration-200"
              placeholder="••••••••"
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
            <button 
              onClick={handleForgotPassword}
              className="text-sm text-red-400 hover:text-red-300 transition-colors duration-200"
            >
              Forgot your password?
            </button>
          </div>

          <div className="mt-6 text-center">
            <span className="text-sm text-gray-400">Don't have an account?</span>
            <Link to="/register" className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors duration-200">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;