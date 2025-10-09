import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const EmailVerification: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
   const { isAuthenticated } = useAuth();
  
      useEffect(() => {
      if (isAuthenticated) {
          window.location.href = '/dashboard';
          }
      }, [isAuthenticated]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await authService.verifyOtp(email, otp);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 flex items-center justify-center">
      <form onSubmit={handleVerify} className="bg-gradient-to-br from-gray-900 via-red-950 to-black p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-red-400 to-red-200 bg-clip-text text-transparent">Verify Your Email</h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 px-4 py-2 rounded bg-gray-800 text-white"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="OTP"
          className="w-full mb-4 px-4 py-2 rounded bg-gray-800 text-white"
          value={otp}
          onChange={e => setOtp(e.target.value)}
          required
        />
        {error && <div className="text-red-400 mb-2">{error}</div>}
        <button type="submit" className="w-full bg-gradient-to-r from-red-800 to-red-600 py-2 rounded-lg text-red-100 font-semibold">Verify</button>
      </form>
    </div>
  );
};

export default EmailVerification;
