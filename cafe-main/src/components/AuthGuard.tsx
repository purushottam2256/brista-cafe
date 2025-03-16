import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const location = useLocation();
  
  // Simplified authentication check without session timeout
  const checkAuth = () => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    // Only check if isAdmin flag exists
    if (!isAdmin) {
      return false;
    }
    
    return true;
  };
  
  if (!checkAuth()) {
    // Redirect to login page with information that we came from a protected route
    return <Navigate to="/admin" state={{ fromProtected: true, from: location.pathname }} replace />;
  }
  
  return <>{children}</>;
};

export default AuthGuard;