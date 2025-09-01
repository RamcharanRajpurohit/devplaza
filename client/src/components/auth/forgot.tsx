import React, { useState } from 'react';
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../services/authState';
import { useNavigate } from 'react-router-dom';

export default function DevPlazaForgotPassword() {
  const { email: storedEmail } = useAuthStore();
  const [email, setEmail] = useState(storedEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
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

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (data.success) {
        useAuthStore.getState().setEmail(email);
        useAuthStore.getState().setIsVerifying(true);
        navigate('/auth/otp');
      }
    } catch (error) {
      setError('Failed to send reset email');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidEmail = (email:string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleBack = () => {
    console.log('Back to sign in');
  };

  const handleResend = () => {
    setIsEmailSent(false);
    setEmail('');
    setError('');
  };

  const handleOpenEmail = () => {
    console.log('Open email app');
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-8">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
                <span className="text-black font-bold text-sm">D</span>
              </div>
              <h1 className="text-white text-xl font-semibold">DevPlaza</h1>
            </div>
            
            <h2 className="text-white text-xl font-normal mb-2">Check your email</h2>
            <p className="text-neutral-400 text-sm">
              We've sent a password reset link to{' '}
              <span className="text-white font-medium">{email}</span>
            </p>
          </div>

          {/* Success Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-neutral-800 rounded-lg p-4 mb-6">
            <h3 className="text-white font-medium mb-2">Next steps:</h3>
            <ul className="text-neutral-300 text-sm space-y-1">
              <li>• Check your email inbox</li>
              <li>• Click the reset password link</li>
              <li>• Create a new password</li>
            </ul>
          </div>

          {/* Open Email Button */}
          <button
            onClick={handleOpenEmail}
            className="w-full py-3 px-4 bg-neutral-700 text-white rounded-lg font-medium hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:ring-offset-neutral-900 transition-colors duration-200 mb-4"
          >
            Open Email App
          </button>

          {/* Resend and Back Links */}
          <div className="text-center space-y-2">
            <p className="text-sm text-neutral-400">
              Didn't receive the email?{' '}
              <button 
                onClick={handleResend}
                className="text-white hover:text-neutral-300 underline font-medium"
              >
                Try again
              </button>
            </p>
            <button
              onClick={handleBack}
              className="text-sm text-neutral-400 hover:text-white transition-colors duration-200"
            >
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header with Back Button */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="flex items-center text-neutral-400 hover:text-white mb-6 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to sign in
          </button>
          
          <div className="flex items-center mb-8">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
              <span className="text-black font-bold text-sm">D</span>
            </div>
            <h1 className="text-white text-xl font-semibold">DevPlaza</h1>
          </div>
          
          <h2 className="text-white text-xl font-normal mb-2">Forgot your password?</h2>
          <p className="text-neutral-400 text-sm">
            No worries! Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {/* Lock Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-neutral-400" />
          </div>
        </div>

        {/* Email Input */}
        <div className="mb-6">
          <label htmlFor="email" className="block text-white text-sm font-medium mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            className="w-full px-4 py-3 bg-neutral-800 text-white rounded-lg border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-neutral-400"
            placeholder="Enter your email address"
          />
          {error && (
            <div className="mt-2 flex items-center text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-neutral-700 text-white rounded-lg font-medium hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:ring-offset-neutral-900 transition-colors duration-200 mb-6 disabled:bg-neutral-800 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Sending...
            </span>
          ) : (
            'Send Reset Link'
          )}
        </button>

        {/* Help Links */}
        <div className="text-center space-y-2">
          <p className="text-sm text-neutral-400">
            Remember your password?{' '}
            <button 
              onClick={handleBack}
              className="text-white hover:text-neutral-300 underline font-medium"
            >
              Sign in
            </button>
          </p>
          <p className="text-sm text-neutral-400">
            Need help?{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300 underline">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}