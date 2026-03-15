import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Protected Route Guards
import {
  ProtectedRoute,
  RoleRoute,
  GuestRoute,
} from "@/components/ProtectedRoute";

// Public Pages
import LandingPage from "./pages/LandingPage";
import AboutPage from "./pages/AboutPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfService from "./pages/legal/TermsOfService";
import ScrollToTop from "./components/layout/ScrollToTop";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import GoogleSuccess from "./pages/auth/GoogleSuccess";
import SelectRole from "./pages/auth/SelectRole";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

// Client Pages
import ClientDashboard from "./pages/client/ClientDashboard";
import PostProjectPage from "./pages/client/PostProject";
import ClientProjectsPage from "./pages/client/ClientProjects";
import ProjectProposalsPage from "./pages/client/ProjectProposals";
import ClientMessagesPage from "./pages/client/ClientMessages";
import ClientReviewsPage from "./pages/client/ClientReviews";
import BrowseFreelancersPage from "./pages/client/BrowseFreelancers";
import AIAssistantPage from "./pages/client/AIAssistant";
import ClientSettingsPage from "./pages/client/ClientSettings";
import ClientDraftsPage from "./pages/client/ClientDrafts";
import MyProposalsPage from "./pages/client/MyProposals";
import ClientProfilePage from "./pages/client/ClientProfile";
import ClientProjectDetailsPage from "./pages/client/ClientProjectDetails";
import FreelancerProfileDetail from "./pages/client/FreelancerProfileDetail";

// Freelancer Pages
import FreelancerDashboard from "./pages/freelancer/FreelancerDashboard";
import FreelancerBrowseProjects from "./pages/freelancer/FreelancerBrowseProjects";
import { default as FreelancerProposalsPage } from "./pages/freelancer/FreelancerProposals";
import { default as FreelancerProjectsPage } from "./pages/freelancer/FreelancerProjects";
import { default as FreelancerMessagesPage } from "./pages/freelancer/FreelancerMessages";
import FreelancerProjectDetails from "./pages/freelancer/FreelancerProjectDetails";
import FreelancerProfile from "./pages/freelancer/FreelancerProfile";
import FreelancerSettings from "./pages/freelancer/FreelancerSettings";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import ProjectModeration from "./pages/admin/ProjectModeration";
import DisputeManagement from "./pages/admin/DisputeManagement";
import Analytics from "./pages/admin/Analytics";
import Security from "./pages/admin/Security";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* ── Public Routes ─────────────────────────────────── */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            {/* Google OAuth callback page */}
            <Route path="/auth/google/success" element={<GoogleSuccess />} />

            {/* ── Guest Routes ───────────────────────────────────── */}
            {/* Already logged in? → redirected to their dashboard  */}
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>

            {/* ── Protected Routes ───────────────────────────────── */}
            {/* Not logged in? → redirected to /login               */}
            <Route element={<ProtectedRoute />}>
              <Route path="/select-role" element={<SelectRole />} />
              {/* ── Client Only ──────────────────────────────────── */}
              <Route element={<RoleRoute allowedRole="CLIENT" />}>
                <Route path="/client" element={<ClientDashboard />} />
                <Route
                  path="/client/post-project"
                  element={<PostProjectPage />}
                />
                <Route path="/client/drafts" element={<ClientDraftsPage />} />
                <Route
                  path="/client/projects"
                  element={<ClientProjectsPage />}
                />
                <Route
                  path="/client/projects/:projectId"
                  element={<ClientProjectDetailsPage />}
                />
                <Route
                  path="/client/projects/:projectId/proposals"
                  element={<ProjectProposalsPage />}
                />
                <Route
                  path="/client/messages"
                  element={<ClientMessagesPage />}
                />
                <Route path="/client/reviews" element={<ClientReviewsPage />} />
                <Route
                  path="/client/ai-assistant"
                  element={<AIAssistantPage />}
                />
                <Route
                  path="/client/active-projects"
                  element={<Navigate to="/client/projects" replace />}
                />
                <Route
                  path="/client/browse"
                  element={<BrowseFreelancersPage />}
                />
                <Route
                  path="/freelancer/:id"
                  element={<FreelancerProfileDetail />}
                />
                <Route path="/client/proposals" element={<MyProposalsPage />} />
                <Route path="/client/profile" element={<ClientProfilePage />} />
                <Route path="/settings" element={<ClientSettingsPage />} />
                {/* Redirect legacy route */}
                <Route
                  path="/client/help-me-find"
                  element={<AIAssistantPage />}
                />
              </Route>

              {/* ── Freelancer Only ───────────────────────────────── */}
              <Route element={<RoleRoute allowedRole="FREELANCER" />}>
                <Route path="/freelancer" element={<FreelancerDashboard />} />
                <Route
                  path="/freelancer/browse"
                  element={<FreelancerBrowseProjects />}
                />
                <Route
                  path="/freelancer/proposals"
                  element={<FreelancerProposalsPage />}
                />
                <Route
                  path="/freelancer/projects"
                  element={<FreelancerProjectsPage />}
                />
                <Route
                  path="/freelancer/messages"
                  element={<FreelancerMessagesPage />}
                />
                <Route
                  path="/freelancer/profile"
                  element={<FreelancerProfile />}
                />
                <Route
                  path="/freelancer/projects/:projectId"
                  element={<FreelancerProjectDetails />}
                />
                <Route
                  path="/freelancer/settings"
                  element={<FreelancerSettings />}
                />
              </Route>

              {/* ── Admin Only ────────────────────────────────────── */}
              <Route element={<RoleRoute allowedRole="ADMIN" />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/projects" element={<ProjectModeration />} />
                <Route path="/admin/disputes" element={<DisputeManagement />} />
                <Route path="/admin/analytics" element={<Analytics />} />
                <Route path="/admin/security" element={<Security />} />
              </Route>
            </Route>

            {/* ── 404 ──────────────────────────────────────────────── */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
