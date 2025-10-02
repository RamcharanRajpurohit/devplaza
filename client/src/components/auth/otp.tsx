import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Mail, RefreshCw, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../services/authState';
import { useSignup } from '../../context/SignupContext';
import { useAuth } from '../../context/AuthContext';

export default function DevPlazaOTP() {
   const { setSignupData } = useSignup();
  const { signupData, clearSignupData } = useSignup();
  const navigate = useNavigate();
  const{ login }= useAuth();
   const { isAuthenticated } = useAuth();
  
      useEffect(() => {
      if (isAuthenticated) {
          // If user is authenticated, redirect to dashboard
          window.location.href = '/dashboard';
          }
      }, [isAuthenticated]);

  // move this state above the redirect effect
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // Redirect if no email in state, but only when NOT in the middle of successful verification
  // useEffect(() => {
  //   const token = localStorage.getItem('token');

  //   // if there's a token we should not redirect to signup (prevents flash when signupData is cleared)
  //   if (!signupData?.email && !verificationSuccess && !token) {
  //     console.log('⚠️ No signup email in state and no token found, redirecting to signup');
  //     navigate('/auth/signup', { replace: true });
  //   } else if (!signupData?.email && token) {
  //     console.log('ℹ️ signupData missing but token present — skipping redirect');
  //   }
  // }, [signupData, navigate, verificationSuccess]);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const loginEmail= useAuthStore((state) => state.email);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;

    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(''); // Clear error when user types

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];

    for (let i = 0; i < pastedData.length; i++) {
      if (i < 6) {
        newOtp[i] = pastedData[i];
      }
    }

    setOtp(newOtp);

    // Focus next empty input or last input
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async () => {
    setSignupData({ 
      email: loginEmail,
    });
    console.log('🔄 Submitting OTP verification:', { email: signupData?.email  });
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const response = await fetch('https://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          otp: otpCode,
          email: signupData?.email
        }),
        credentials: 'include' // Add this to handle cookies if needed
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ OTP verification successful');
        if (data.token) {
          // store token first
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(signupData?.email));
          setVerificationSuccess(true);
          console.log("token recived", data.token)
          login(data.token, data.user);
          

          // show a short loader/transition to avoid abrupt flash of other routes/components
          // navigate after a short delay while keeping this component mounted so redirect checks
          // don't see cleared signupData prematurely.
          setTimeout(() => {
            try {
              // clear signup context AFTER navigation to avoid triggering signup redirect
              navigate('/complete-profile', { replace: true, state: { fromOTP: true } });
            } finally {
              // clear signup data slightly after navigation to keep this component stable
              setTimeout(() => {
                try {
                  clearSignupData();
                  console.log('🔄 Cleared signup context after navigation');
                } catch (err) {
                  console.error('❌ Failed to clear signup context:', err);
                }
              }, 50);
            }
          }, 900); // ~900ms transition to show success + loader
        } else {
          throw new Error('No token received from server');
        }
      } else {
        console.warn('⚠️ OTP verification failed:', data.message);
        setError(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('❌ OTP verification error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    console.log('🔄 Resending OTP to:', signupData?.email);
    setIsResending(true);
    setCanResend(false);
    setCountdown(60);
    setError('');

    try {
      const response = await fetch('https://localhost:5000/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signupData?.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to resend OTP.');
      }
    } catch (error) {
      setError('Failed to resend OTP. Please try again.');
      console.error('Error resending OTP:', error);
    } finally {
      setIsResending(false);
    }
  };

  const isComplete = otp.every((digit) => digit !== '');

  if (verificationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-gradient-to-br from-gray-900 via-red-950 to-black border border-green-500/30 rounded-lg p-8 shadow-xl text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-green-500 mb-2">Email Verified!</h2>
          <p className="text-gray-400">Redirecting to complete your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-lg p-8 shadow-xl">
        {/* Header with Back Button */}
        <div className="mb-8">
          <button
            className="flex items-center text-gray-400 hover:text-red-300 mb-6 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Sign Up
          </button>

          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
            Verify Your Email
          </h2>
          <p className="text-gray-400 text-sm">
            We've sent a 6-digit verification code to{' '}
            <span className="text-red-400 font-medium">{signupData?.email}</span>
          </p>
        </div>

        {/* Email Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center border border-red-900/30">
            <Mail className="w-8 h-8 text-red-400" />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 px-4 py-2 rounded bg-red-900/50 border border-red-800 text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* OTP Input Fields */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-4">
            Enter verification code
          </label>
          <div className="flex gap-3 justify-center">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-xl font-semibold bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all duration-200"
                maxLength={1}
              />
            ))}
          </div>
        </div>

        {/* Resend Code */}
        <div className="text-center mb-6">
          {canResend ? (
            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Resend code'
              )}
            </button>
          ) : (
            <p className="text-gray-400 text-sm">Resend code in {countdown}s</p>
          )}
        </div>

        {/* Verify Button */}
        <button
          onClick={handleSubmit}
          disabled={!isComplete || isVerifying}
          className="w-full bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 py-3 rounded-lg text-sm font-medium transition-all duration-300 shadow-lg shadow-red-900/30 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isVerifying ? (
            <>
              <svg className="animate-spin h-5 w-5 text-red-200" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v16a8 8 0 01-8-8z" />
              </svg>
              <span>Verifying...</span>
            </>
          ) : (
            <span>Verify Code</span>
          )}
        </button>

        {/* Help Text */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-400">
            Didn't receive the code?{' '}
            <button
              onClick={() => setError('Please check your spam folder or try resending the code.')}
              className="text-red-400 hover:text-red-300 underline font-medium transition-colors"
            >
              Check spam folder
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}