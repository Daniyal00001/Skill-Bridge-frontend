import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Public Pages
import LandingPage from "./pages/LandingPage";
import AboutPage from "./pages/AboutPage";
import HowItWorksPage from "./pages/HowItWorksPage";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";

// Dashboard Pages
import ClientDashboard from "./pages/client/ClientDashboard";
import PostProjectPage from "./pages/client/PostProject";
import ClientProjectsPage from "./pages/client/ClientProjects";
import ClientProjectDetailsPage from "./pages/client/ClientProjectDetails";
import ProjectProposalsPage from "./pages/client/ProjectProposals";
import ClientMessagesPage from "./pages/client/ClientMessages";
import ClientReviewsPage from "./pages/client/ClientReviews";
import HelpMeFindPage from "./pages/client/HelpMeFind";
import ClientSettingsPage from "./pages/client/ClientSettings";
import ClientDraftsPage from "./pages/client/ClientDrafts";
import BrowseProjectsPage from "./pages/client/BrowseProjects";
import MyProposalsPage from "./pages/client/MyProposals";
import ActiveProjectsPage from "./pages/client/ActiveProjects";
import ClientProfilePage from "./pages/client/ClientProfile";
import FreelancerDashboard from "./pages/freelancer/FreelancerDashboard";
import FreelancerBrowseProjects from "./pages/freelancer/FreelancerBrowseProjects";
import { default as FreelancerProposalsPage } from "./pages/freelancer/FreelancerProposals";
import { default as FreelancerProjectsPage } from "./pages/freelancer/FreelancerProjects";
import { default as FreelancerMessagesPage } from "./pages/freelancer/FreelancerMessages";
import { default as FreelancerProfilePage } from "./pages/freelancer/FreelancerProfile";
import FreelancerProjectDetails from "./pages/freelancer/FreelancerProjectDetails";
import AdminDashboard from "./pages/admin/AdminDashboard";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Client Routes */}
            <Route path="/client" element={<ClientDashboard />} />
            <Route path="/client/post-project" element={<PostProjectPage />} />
            <Route path="/client/projects" element={<ClientProjectsPage />} />
            <Route path="/client/help-me-find" element={<HelpMeFindPage />} />
            <Route path="/client/drafts" element={<ClientDraftsPage />} />
            <Route path="/client/projects/:projectId" element={<ClientProjectDetailsPage />} />
            <Route path="/client/projects/:projectId/proposals" element={<ProjectProposalsPage />} />
            <Route path="/client/messages" element={<ClientMessagesPage />} />
            <Route path="/client/browse" element={<BrowseProjectsPage />} />
            <Route path="/client/proposals" element={<MyProposalsPage />} />
            <Route path="/client/active-projects" element={<ActiveProjectsPage />} />
            <Route path="/client/active-projects" element={<ActiveProjectsPage />} />
            <Route path="/client/profile" element={<ClientProfilePage />} />
            <Route path="/client/reviews" element={<ClientReviewsPage />} />

            {/* Freelancer Routes */}
            <Route path="/freelancer" element={<FreelancerDashboard />} />
            <Route path="/freelancer/browse" element={<FreelancerBrowseProjects />} />
            <Route path="/freelancer/proposals" element={<FreelancerProposalsPage />} />
            <Route path="/freelancer/projects" element={<FreelancerProjectsPage />} />
            <Route path="/freelancer/messages" element={<FreelancerMessagesPage />} />
            <Route path="/freelancer/profile" element={<FreelancerProfilePage />} />
            <Route path="/freelancer/projects/:projectId" element={<FreelancerProjectDetails />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />

            <Route path="/settings" element={<ClientSettingsPage />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
