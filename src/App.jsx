import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import PublicLayout from '@/components/PublicLayout';
import AdminLayout from '@/components/AdminLayout';

// Auth pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

// Public pages
import Home from '@/pages/Home';
import Explore from '@/pages/Explore';
import SearchPage from '@/pages/SearchPage';
import MapPage from '@/pages/MapPage';
import AssetDetail from '@/pages/AssetDetail';
import Learn from '@/pages/Learn';
import Glossary from '@/pages/Glossary';
import News from '@/pages/News';
import KnowledgeGraph from '@/pages/KnowledgeGraph';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import UploadCentre from '@/pages/admin/UploadCentre';
import MetadataEditor from '@/pages/admin/MetadataEditor';
import ApprovalQueue from '@/pages/admin/ApprovalQueue';
import AIStudio from '@/pages/admin/AIStudio';
import Publishing from '@/pages/admin/Publishing';
import CalendarPage from '@/pages/admin/CalendarPage';
import Analytics from '@/pages/admin/Analytics';
import UsersRoles from '@/pages/admin/UsersRoles';
import AuditLogPage from '@/pages/admin/AuditLogPage';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        {/* Public portal */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/asset/:id" element={<AssetDetail />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/glossary" element={<Glossary />} />
          <Route path="/news" element={<News />} />
          <Route path="/knowledge-graph" element={<KnowledgeGraph />} />
        </Route>

        {/* Admin portal */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="upload" element={<UploadCentre />} />
          <Route path="repository" element={<SearchPage />} />
          <Route path="metadata" element={<MetadataEditor />} />
          <Route path="review" element={<ApprovalQueue />} />
          <Route path="ai-studio" element={<AIStudio />} />
          <Route path="publishing" element={<Publishing />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="users" element={<UsersRoles />} />
          <Route path="audit" element={<AuditLogPage />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App