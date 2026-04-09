import { createBrowserRouter, Navigate } from "react-router";
import { Root } from "./components/Root";
import { Login } from "./pages/Login";
import { ForgotPassword } from "./pages/ForgotPassword";
import { OTP } from "./pages/OTP";
import { ChangePassword } from "./pages/ChangePassword";
import { Dashboard } from "./pages/Dashboard";
import { Projects } from "./pages/Projects";
import { CreateProject } from "./pages/CreateProject";
import { ProjectDetail } from "./pages/ProjectDetail";
import { RiskClassification } from "./pages/RiskClassification";
import { ExecutiveSummary } from "./pages/ExecutiveSummary";
import { GlobalExecutiveSummary } from "./pages/GlobalExecutiveSummary";
import { ArchivedProjects } from "./pages/ArchivedProjects";
import { Sprints } from "./pages/Sprints";
import { Metrics } from "./pages/Metrics";
import { AIAssistant } from "./pages/AIAssistant";
import { Gamification } from "./pages/Gamification";
import { ProjectGamification } from "./pages/ProjectGamification";
import { Notifications } from "./pages/Notifications";
import { UserManagement } from "./pages/UserManagement";
import { UserProfile } from "./pages/UserProfile";

export const router = createBrowserRouter([
  // Public routes (no authentication needed)
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/forgot-password",
    Component: ForgotPassword,
  },
  {
    path: "/otp",
    Component: OTP,
  },
  {
    path: "/change-password",
    Component: ChangePassword,
  },
  
  // Protected routes (authentication handled in Root component)
  {
    path: "/",
    Component: Root,
    children: [
      { 
        index: true, 
        element: <Navigate to="/dashboard" replace /> 
      },
      { path: "dashboard", Component: Dashboard },
      { path: "projects", Component: Projects },
      { path: "create-project", Component: CreateProject },
      { path: "project/:id", Component: ProjectDetail },
      { path: "project/:id/risk", Component: RiskClassification },
      { path: "project/:id/summary", Component: ExecutiveSummary },
      { path: "executive-summary", Component: GlobalExecutiveSummary },
      { path: "archived-projects", Component: ArchivedProjects },
      { path: "sprints", Component: Sprints },
      { path: "metrics", Component: Metrics },
      { path: "ai", Component: AIAssistant },
      { path: "gamification", Component: Gamification },
      { path: "gamification/project/:id", Component: ProjectGamification },
      { path: "notifications", Component: Notifications },
      { path: "user-management", Component: UserManagement },
      { path: "profile", Component: UserProfile },
    ],
  },
  
  // Catch-all redirect to login
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);
