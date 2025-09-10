import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user} = useAuth();
  const { showToast } = useToast();

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!user.hasProfile) {
    showToast('Please complete your profile first', 'info');
    return <Navigate to="/complete-profile" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;