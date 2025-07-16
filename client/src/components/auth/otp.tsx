import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Mail, RefreshCw } from 'lucide-react';

export default function DevPlazaOTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const email = "user@example.com"; // This would come from props or context

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

interface HandleChangeEvent {
    target: {
        value: string;
    };
}

type OtpInputRefs = Array<HTMLInputElement | null>;

const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp: string[] = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
    }
};

interface OtpInputKeyDownEvent extends React.KeyboardEvent<HTMLInputElement> {}

const handleKeyDown = (index: number, e: OtpInputKeyDownEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
    }
};

interface HandlePasteEvent extends React.ClipboardEvent<HTMLInputElement> {}

interface OtpPasteResult {
    pastedData: string;
    newOtp: string[];
}

const handlePaste = (e: HandlePasteEvent): void => {
    e.preventDefault();
    const pastedData: string = e.clipboardData.getData('text').slice(0, 6);
    const newOtp: string[] = [...otp];
    
    for (let i = 0; i < pastedData.length; i++) {
        if (i < 6) {
            newOtp[i] = pastedData[i];
        }
    }
    
    setOtp(newOtp);
    
    // Focus next empty input or last input
    const nextIndex: number = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
};

  const handleSubmit = () => {
    const otpCode = otp.join('');
    if (otpCode.length === 6) {
      console.log('OTP submitted:', otpCode);
      // Handle OTP verification
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setCanResend(false);
    setCountdown(60);
    
    // Simulate API call
    setTimeout(() => {
      setIsResending(false);
      console.log('OTP resent');
    }, 2000);
  };

  const handleBack = () => {
    console.log('Back to sign up');
  };

  const isComplete = otp.every(digit => digit !== '');

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
            Back
          </button>
          
          <div className="flex items-center mb-8">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
              <span className="text-black font-bold text-sm">D</span>
            </div>
            <h1 className="text-white text-xl font-semibold">DevPlaza</h1>
          </div>
          
          <h2 className="text-white text-xl font-normal mb-2">Verify your email</h2>
          <p className="text-neutral-400 text-sm">
            We've sent a 6-digit verification code to{' '}
            <span className="text-white font-medium">{email}</span>
          </p>
        </div>

        {/* Email Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-neutral-400" />
          </div>
        </div>

        {/* OTP Input Fields */}
        <div className="mb-6">
          <label className="block text-white text-sm font-medium mb-4">
            Enter verification code
          </label>
          <div className="flex gap-3 justify-center">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-xl font-semibold bg-neutral-800 text-white rounded-lg border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-200 disabled:opacity-50"
            >
              {isResending ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Sending...
                </span>
              ) : (
                'Resend code'
              )}
            </button>
          ) : (
            <p className="text-neutral-400 text-sm">
              Resend code in {countdown}s
            </p>
          )}
        </div>

        {/* Verify Button */}
        <button
          onClick={handleSubmit}
          disabled={!isComplete}
          className="w-full py-3 px-4 bg-neutral-700 text-white rounded-lg font-medium hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:ring-offset-neutral-900 transition-colors duration-200 mb-6 disabled:bg-neutral-800 disabled:cursor-not-allowed"
        >
          Verify Code
        </button>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-sm text-neutral-400">
            Didn't receive the code?{' '}
            <button className="text-white hover:text-neutral-300 underline font-medium">
              Check spam folder
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}