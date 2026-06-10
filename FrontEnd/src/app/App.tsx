import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { Root } from './components/Root';
import { Login } from './pages/Login';
import { OTP } from './pages/OTP';
import { ForgotPassword } from './pages/ForgotPassword';
import { ChangePassword } from './pages/ChangePassword';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { CreateProject } from './pages/CreateProject';
import { ProjectDetail } from './pages/ProjectDetail';
import { RiskClassification } from './pages/RiskClassification';
import { ExecutiveSummary } from './pages/ExecutiveSummary';
import { GlobalExecutiveSummary } from './pages/GlobalExecutiveSummary';
import { ArchivedProjects } from './pages/ArchivedProjects';
import { ArchivedProjectMetrics } from './pages/ArchivedProjectMetrics';
import { Sprints } from './pages/Sprints';
import { Metrics } from './pages/Metrics';
import { AIAssistant } from './pages/AIAssistant';
import { Gamification } from './pages/Gamification';
import { ProjectGamification } from './pages/ProjectGamification';
import { Notifications } from './pages/Notifications';
import { ResetPassword } from './pages/ResetPassword';
import { UserManagement } from './pages/UserManagement';

function RequireRole({ roles, children }: { roles: string[]; children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user || !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <NotificationsProvider>
      <Toaster position="top-right" richColors closeButton />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/otp" element={<OTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Protected routes */}
          <Route path="/" element={<Root />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="create-project" element={<CreateProject />} />
            <Route path="project/:id" element={<ProjectDetail />} />
            <Route path="project/:id/risk" element={<RiskClassification />} />
            <Route path="project/:id/summary" element={<ExecutiveSummary />} />
            <Route path="executive-summary" element={<GlobalExecutiveSummary />} />
            <Route path="archived-projects" element={<RequireRole roles={['ADMIN', 'PM']}><ArchivedProjects /></RequireRole>} />
            <Route path="archived/:id" element={<RequireRole roles={['ADMIN', 'PM']}><ArchivedProjectMetrics /></RequireRole>} />
            <Route path="sprints" element={<Sprints />} />
            <Route path="metrics" element={<RequireRole roles={['ADMIN', 'PM']}><Metrics /></RequireRole>} />
            <Route path="ai" element={<AIAssistant />} />
            <Route path="gamification" element={<Gamification />} />
            <Route path="gamification/project/:id" element={<ProjectGamification />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="user-management" element={<RequireRole roles={['ADMIN']}><UserManagement /></RequireRole>} />
          </Route>
          
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      </NotificationsProvider>
    </AuthProvider>
  );
}

export default App;