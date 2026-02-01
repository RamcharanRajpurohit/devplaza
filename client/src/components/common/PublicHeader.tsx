import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const PublicHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { showToast } = useToast();

  const isActive = (path: string) => location.pathname === path;

  const getNavLinkStyle = (path: string, baseStyle: string) => {
    if (isActive(path)) {
      return `${baseStyle} relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-red-400`;
    }
    return baseStyle;
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      showToast('Logged out successfully', 'success');
    } catch (error) {
      showToast('Error logging out', 'error');
    }
  };

  const btnStyles = {
    default: 'px-4 py-2 text-gray-300 hover:text-red-400 transition-colors duration-200',
    primary: 'px-6 py-2 bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 rounded-lg text-white font-medium transition-all duration-300 shadow-lg shadow-red-900/30',
    outline: 'px-4 py-2 border border-red-600/50 text-red-400 hover:bg-red-900/30 rounded-lg transition-all duration-200'
  };

  // Different nav links based on authentication status
  const publicNavLinks = [
    { to: '/potd', style: btnStyles.default, text: 'Problem of the Day' },
    { to: '/contests', style: btnStyles.default, text: 'Contests' },
    { to: '/auth/login', style: btnStyles.default, text: 'Login' },
    { to: '/auth/signup', style: btnStyles.primary, text: 'Sign Up' },
    { to: '/profile/ram', style: btnStyles.outline, text: 'View Demo Profile' }
  ];

  const authenticatedNavLinks = [
    { to: '/potd', style: btnStyles.default, text: 'Problem of the Day' },
    { to: '/contests', style: btnStyles.default, text: 'Contests' },
    { to: '/dashboard', style: btnStyles.default, text: 'Dashboard' },
    { to: '/settings', style: btnStyles.default, text: 'Settings' }
  ];

  const navLinks = isAuthenticated ? authenticatedNavLinks : publicNavLinks;

  return (
    <nav className="relative z-50 bg-black/50 backdrop-blur-sm border-b border-red-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
              DevPlaza
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              {navLinks.map((link, i) => (
                <Link key={i} to={link.to} className={getNavLinkStyle(link.to, link.style)}>{link.text}</Link>
              ))}
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 border border-red-600/50 text-red-400 hover:bg-red-900/30 rounded-lg transition-all duration-200"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-gray-300 hover:text-red-400 focus:outline-none transition-colors duration-200">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 bg-black/95 backdrop-blur-sm border-b border-red-900/30">
          <div className="px-4 pt-4 pb-6 space-y-4">
            {navLinks.map((link, i) => (
              <Link key={i} to={link.to} className={`block w-full ${getNavLinkStyle(link.to, link.style)}`} onClick={() => setIsMenuOpen(false)}>{link.text}</Link>
            ))}
            {isAuthenticated && (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-2 border border-red-600/50 text-red-400 hover:bg-red-900/30 rounded-lg transition-all duration-200"
              >
                <LogOut size={16} />
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default PublicHeader;
