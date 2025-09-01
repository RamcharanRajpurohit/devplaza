import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 flex flex-col items-center justify-center text-white">
    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-400 to-red-200 bg-clip-text text-transparent">Welcome to DevPlaza</h1>
    <p className="mb-8 text-lg text-gray-300">Your coding journey starts here.</p>
    <div className="space-x-4">
      <Link to="/auth" className="bg-gradient-to-r from-red-800 to-red-600 px-6 py-2 rounded-lg text-red-100 font-semibold shadow-lg hover:from-red-700 hover:to-red-500 transition-all">Login</Link>
      <Link to="/register" className="bg-gradient-to-r from-gray-800 to-gray-700 px-6 py-2 rounded-lg text-gray-100 font-semibold shadow-lg hover:from-red-600 hover:to-red-500 transition-all">Sign Up</Link>
    </div>
  </div>
);

export default LandingPage;
