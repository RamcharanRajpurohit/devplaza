import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { JSX } from 'react';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();

  console.log('Protected Route - Auth State:', { 
    isAuthenticated,
    token: localStorage.getItem('token')
  });

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;
