import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { JSX } from 'react';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not authenticated and not loading, redirect to auth
  if (!isAuthenticated) {
    console.log('❌ User not authenticated, redirecting to /auth');
    return <Navigate to="/" replace />;
  }

  // If authenticated, render the protected content
  return children;
};

export default ProtectedRoute;