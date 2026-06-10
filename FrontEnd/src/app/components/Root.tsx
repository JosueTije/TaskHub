import { Outlet, Navigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from './Layout';
import { LoadingScreen } from './ProtectedRoute';

export function Root() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  const publicRoutes = ["/login", "/otp", "/change-password", "/forgot-password"];

  const isPublicRoute = publicRoutes.includes(location.pathname);

  if (isLoading && !isPublicRoute) {
    return <LoadingScreen />;
  }

  if (!isPublicRoute && (!isAuthenticated || !user)) {
    return <Navigate to="/login" replace />;
  }

  
  if (
    user?.needsPasswordReset &&
    location.pathname !== "/change-password"
  ) {
    return <Navigate to="/change-password" replace />;
  }

  return <Layout />;
}