import  { useState,useEffect } from 'react';

import { Menu, X,Users, Trophy, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
const DevPlazaLanding = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();

    useEffect(() => {
    if (isAuthenticated) {
        // If user is authenticated, redirect to dashboard
        window.location.href = '/dashboard';
        }
    }, [isAuthenticated]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950">
      {/* Navbar */}
      <nav className="relative z-50 bg-black/50 backdrop-blur-sm border-b border-red-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Brand */}
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
                DevPlaza
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                <Link  to='/auth/login' className="px-4 py-2 text-gray-300 hover:text-red-400 transition-colors duration-200">
                  Login
                </Link>
                <Link to ='/auth/signup' className="px-6 py-2 bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 rounded-lg text-white font-medium transition-all duration-300 shadow-lg shadow-red-900/30">
                  Sign Up
                </Link>
                <Link to ="/profile/ram"className="px-4 py-2 border border-red-600/50 text-red-400 hover:bg-red-900/30 rounded-lg transition-all duration-200">
                  View Demo Profile
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="p-2 rounded-md text-gray-300 hover:text-red-400 focus:outline-none transition-colors duration-200"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 inset-x-0 bg-black/95 backdrop-blur-sm border-b border-red-900/30">
            <div className="px-4 pt-4 pb-6 space-y-4">
              <Link  to="/auth/login" className="block w-full text-left px-4 py-2 text-gray-300 hover:text-red-400 transition-colors duration-200">
                Login
              </Link>
              <Link  to="/auth/signup"  className="block w-full px-6 py-2 bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 rounded-lg text-white font-medium transition-all duration-300 shadow-lg shadow-red-900/30">
                Sign Up
              </Link>
              <Link  to="/profile/ram"  className="block w-full px-4 py-2 border border-red-600/50 text-red-400 hover:bg-red-900/30 rounded-lg transition-all duration-200">
                View Demo Profile
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                    Showcase Your
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
                    CP Journey
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-gray-300 max-w-lg">
                  Create stunning developer profiles by aggregating your coding stats from LeetCode, Codeforces, GeeksforGeeks, and GitHub all in one place.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link  to="/auth/signup"  className="px-8 py-4 bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 rounded-lg text-white font-medium transition-all duration-300 shadow-lg shadow-red-900/30 transform hover:scale-105">
                  Get Started Free
                </Link>
                <Link  to="/profile/ram"  className="px-8 py-4 border border-red-600/50 text-red-400 hover:bg-red-900/30 rounded-lg transition-all duration-200 font-medium">
                  View Demo Profile
                </Link>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>Free to use</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>Live updates</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Trophy className="w-4 h-4" />
                  <span>All platforms</span>
                </div>
              </div>
            </div>

            {/* Right Content - Background Image Preview */}
            <div className="relative">
              <div className="relative h-96 bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-xl shadow-2xl overflow-hidden">
               
                 <img src="/demo.png" alt="DevPlaza Preview" className="w-full h-full object-cover" /> 
                
                {/* Placeholder background pattern */}
                <div 
                  className="w-full h-full bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `
                      radial-gradient(circle at 20% 80%, rgba(220, 38, 38, 0.3) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, rgba(239, 68, 68, 0.2) 0%, transparent 50%),
                      radial-gradient(circle at 40% 40%, rgba(185, 28, 28, 0.1) 0%, transparent 50%)
                    `
                  }}
                >
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-red-950/30"></div>
                  
                  {/* Optional: Add your logo or text overlay */}
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Get your professional developer profile ready in just three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-xl p-8 text-center group hover:scale-105 transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-red-800 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Sign Up</h3>
                <p className="text-gray-400">
                  Create your free DevPlaza account in seconds.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-xl p-8 text-center group hover:scale-105 transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-red-800 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Fill Info</h3>
                <p className="text-gray-400">
                  Add your usernames for LeetCode, Codeforces, GeeksforGeeks, and GitHub.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative bg-gradient-to-br from-gray-900 via-red-950 to-black border border-red-900/30 rounded-xl p-8 text-center group hover:scale-105 transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-red-800 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Get Profile</h3>
                <p className="text-gray-400">
                  Share your professional developer profile with live stats and achievements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-red-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
              DevPlaza
            </h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              DevPlaza is the ultimate platform for competitive programmers to showcase their coding journey. 
              Aggregate your profiles from multiple platforms, display live statistics, and benefit from our 
              intelligent caching system for fast, up-to-date information.
            </p>
            <div className="pt-6 border-t border-gray-800">
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} DevPlaza. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DevPlazaLanding;