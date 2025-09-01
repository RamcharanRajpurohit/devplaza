import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 flex flex-col items-center justify-center text-white">
    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-400 to-red-200 bg-clip-text text-transparent">404 - Page Not Found</h1>
    <Link to="/" className="bg-gradient-to-r from-red-800 to-red-600 px-6 py-2 rounded-lg text-red-100 font-semibold shadow-lg hover:from-red-700 hover:to-red-500 transition-all">Go Home</Link>
  </div>
);

export default NotFound;
