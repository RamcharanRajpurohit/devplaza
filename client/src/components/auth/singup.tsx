import { useState ,useEffect} from "react";
import { GoogleLogin } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
// import { useAuthStore } from '../../services/authState';

import { useAuth } from '../../context/AuthContext';
import { ArrowLeft } from "lucide-react";

const API = import.meta.env.VITE_BACKEND_URL;

export default function Signup() {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
 
   const { login,setEmail} = useAuth();
    const { isAuthenticated } = useAuth();
   
       useEffect(() => {
       if (isAuthenticated) {
           // If user is authenticated, redirect to dashboard
           window.location.href = '/dashboard';
           }
       }, [isAuthenticated]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log('🔄 Submitting signup form:', formData);
    e.preventDefault();
    setMessage("");
    setLoading(true);
    
    try {
      const res = await axios.post(`${API}/api/auth/signup`, formData);
      console.log('✅ Signup successful:', res.data);  
      setEmail(formData.email);
      setMessage(res.data.message || "Verification code sent to your email");
      navigate('/auth/otp', { replace: true }); // Use replace to prevent back navigation
    } catch (err: any) {
      console.error('❌ Signup error:', err);
      if (err.response?.data?.message) {
        setMessage(err.response.data.message);
      } else if (err.message) {
        setMessage(err.message);
      } else {
        setMessage("Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };


  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    console.log('🔄 Processing Google signup');
    try {
      const res = await axios.post(`${API}/api/auth/google`, { id_token: credentialResponse.credential }, { withCredentials: true });
      login(res.data.accessToken, res.data.user);
      setTimeout(() => {
        navigate('/dashboard'); // or navigate('/dashboard') if no OTP needed
      }, 1500);
      
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Google login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 flex items-center justify-center px-4">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 flex items-center text-md text-red-400 hover:text-red-300 transition-colors duration-200"
      >
        <ArrowLeft className="h-5 w-5 mr-2 " /> Back
      </button>
      <div className="max-w-md w-full bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-lg p-8 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
          Sign Up for DevPlaza
        </h2>
        
        {message && (
          <div className={`mb-4 px-4 py-2 rounded ${
            message.includes('success') || message.includes('Welcome') 
              ? 'bg-green-900/50 border border-green-800 text-green-200' 
              : message.includes('Processing') 
              ? 'bg-blue-900/50 border border-blue-800 text-blue-200'
              : 'bg-red-900/50 border border-red-800 text-red-200'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              name="username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-3 bg-white rounded-lg border border-gray-700 text-black placeholder-gray-400 focus:ring-2 focus:ring-red-600 focus:outline-none transition-all duration-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 bg-white rounded-lg border border-gray-700 text-black placeholder-gray-400 focus:ring-2 focus:ring-red-600 focus:outline-none transition-all duration-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 bg-white rounded-lg border border-gray-700 text-black placeholder-gray-400 focus:ring-2 focus:ring-red-600 focus:outline-none transition-all duration-200"
              required
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
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Sign Up</span>
            )}
          </button>

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
                onError={() => setMessage("Google login failed")}
                size="large"
                width="100%"
              />
            </div>
          </div>

          <div className="mt-6 text-center">
            <span className="text-sm text-gray-400">Already have an account? </span>
            <Link 
              to="/auth/login" 
              className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors duration-200"
            >
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}