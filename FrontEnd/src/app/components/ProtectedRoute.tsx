import React from 'react';
import { Navigate } from 'react-router';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();


  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.needsPasswordReset) {
    return <Navigate to="/change-password" replace />;
  }

  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}


export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-[#E31837] animate-spin mx-auto mb-4" />
        <p className="text-white text-lg">Cargando...</p>
      </div>
    </div>
  );
}
