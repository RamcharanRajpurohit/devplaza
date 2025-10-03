import React, { useState,useEffect } from 'react';
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API = import.meta.env.VITE_API_BASE || "https://localhost:5000";

export default function DevPlazaForgotPassword() {
    const { isAuthenticated,user,setEmail } = useAuth();
  const [email, setmail] = useState(user?.email|| '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  
      useEffect(() => {
      if (isAuthenticated) {
          // If user is authenticated, redirect to dashboard
          window.location.href = '/dashboard';
          }
      }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      console.log('🔄 Sending forgot password request for:', email);
      const response = await axios.post(`${API}/api/auth/forgot-password`, { email });
      
      console.log('✅ Forgot password request successful:', response.data);
      setEmail(email)
      setMessage(response.data.message || 'Reset code sent to your email');
      setIsEmailSent(true);
      
      // Navigate to OTP after a short delay
      setTimeout(() => {
        navigate('/auth/otp');
      }, 2000);
      
    } catch (err: any) {
      console.error('❌ Forgot password error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleBack = () => {
    navigate('/auth/login');
  };

  const handleResend = () => {
    setIsEmailSent(false);
    setError('');
    setMessage('');
  };

  const handleOpenEmail = () => {
    // Navigate to OTP page
    navigate('/auth/otp');
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-lg p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
            Check your email
          </h2>
          
          {message && (
            <div className="bg-green-900/50 border border-green-800 text-green-200 px-4 py-2 rounded mb-4">
              {message}
            </div>
          )}

          <p className="text-gray-300 mb-6">
            We've sent a password reset code to{' '}
            <span className="text-red-300 font-medium">{email}</span>
          </p>

          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6">
            <h3 className="text-red-300 font-medium mb-2">Next steps:</h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Check your email inbox</li>
              <li>• Copy the reset code</li>
              <li>• Enter it on the next page</li>
            </ul>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleOpenEmail}
            className="w-full bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 py-3 rounded-lg text-sm font-medium transition-all duration-300 shadow-lg shadow-red-900/30 mb-4"
          >
            Continue to Verification
          </button>

          {/* Resend and Back Links */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-400">
              Didn't receive the email?{' '}
              <button 
                onClick={handleResend}
                className="text-red-400 hover:text-red-300 underline font-medium"
              >
                Try again
              </button>
            </p>
            <button
              onClick={handleBack}
              className="text-sm text-gray-400 hover:text-red-300 transition-colors duration-200"
            >
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 flex items-center justify-center px-4">
      <button
              onClick={() => navigate(-1)}
              className="absolute top-4 left-4 flex items-center text-md text-red-400 hover:text-red-300 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 mr-2 " /> Back
            </button>
      <div className="max-w-md w-full bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-lg p-8 shadow-xl">
        {/* Header with Back Button */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-400 hover:text-red-300 mb-6 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to sign in
          </button>
          
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
            Forgot your password?
          </h2>
          <p className="text-gray-400 text-sm">
            No worries! Enter your email address and we'll send you a code to reset your password.
          </p>
        </div>

        {/* Lock Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-900/30 border border-red-800 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-red-400" />
          </div>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-800 text-red-200 px-4 py-2 rounded mb-4 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setmail(e.target.value);
                setError('');
              }}
              className="w-full p-3 bg-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-red-600 focus:outline-none transition-all duration-200"
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 py-3 rounded-lg text-sm font-medium transition-all duration-300 shadow-lg shadow-red-900/30 flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-red-200" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v16a8 8 0 01-8-8z"/>
                </svg>
                <span>Sending...</span>
              </>
            ) : (
              <span>Send Reset Code</span>
            )}
          </button>

          {/* Help Links */}
          <div className="text-center space-y-2 mt-6">
            <p className="text-sm text-gray-400">
              Remember your password?{' '}
              <Link 
                to="/auth/login"
                className="text-red-400 hover:text-red-300 underline font-medium"
              >
                Sign in
              </Link>
            </p>
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link 
                to="/auth/signup" 
                className="text-red-400 hover:text-red-300 underline font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}