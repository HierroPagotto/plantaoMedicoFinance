import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PasswordReset from "./pages/PasswordReset";
import Dashboard from "./pages/Dashboard";
import Shifts from "./pages/Shifts";
import NewShift from "./pages/NewShift";
import Finance from "./pages/Finance";
import History from "./pages/History";
import Settings from "./pages/Settings";
import DoctorRegistration from "./pages/DoctorRegistration";
import DoctorProfile from "./pages/DoctorProfile";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Logout from "./components/auth/Logout";
import DoctorProfilePublic from "./pages/DoctorProfilePublic";
import AdminUsers from './pages/Admin/Users';
import AdminHospitals from './pages/Admin/Hospitals';
import AdminOpportunities from './pages/Admin/Opportunities';
import LandingPage from './pages/LandingPage';
import HospitalDashboard from './pages/Hospital/Dashboard';
import HospitalStaffPage from './pages/Hospital/Staff';
import HospitalRegister from './pages/Hospital/Register';
import HospitalOpportunitiesPage from './pages/Hospital/Opportunities';
import HospitalNewOpportunityPage from './pages/Hospital/OpportunityNew';
import HospitalOpportunityDetailPage from './pages/Hospital/OpportunityDetail';
import HospitalSettingsPage from './pages/Hospital/Settings';
import MarketplacePage from './pages/Marketplace/Index';
import MarketplaceDetailPage from './pages/Marketplace/Detail';
import MyApplicationsPage from './pages/Marketplace/MyApplications';

const queryClient = new QueryClient();

function AdminRoute({ children }: { children: React.ReactNode }) {
  const userData = typeof window !== 'undefined' ? localStorage.getItem('userData') : null;
  const isAdmin = userData && JSON.parse(userData).is_admin;
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/register" element={<Register />} />
          <Route path="/password-reset" element={<PasswordReset />} />
          <Route path="/hospital/register" element={<HospitalRegister />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/shifts" element={<ProtectedRoute><Shifts /></ProtectedRoute>} />
          <Route path="/shifts/new" element={<ProtectedRoute><NewShift /></ProtectedRoute>} />
          <Route path="/finance" element={<ProtectedRoute><Finance /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/doctor-registration" element={<ProtectedRoute><DoctorRegistration /></ProtectedRoute>} />
          <Route path="/doctor-profile" element={<ProtectedRoute><DoctorProfile /></ProtectedRoute>} />
          <Route path="/doctor-profile/:id" element={<DoctorProfilePublic />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/hospitals" element={<AdminRoute><AdminHospitals /></AdminRoute>} />
            <Route path="/admin/opportunities" element={<AdminRoute><AdminOpportunities /></AdminRoute>} />
          </Route>

          <Route path="/hospital" element={<ProtectedRoute role="hospital_staff"><HospitalDashboard /></ProtectedRoute>} />
          <Route path="/hospital/staff" element={<ProtectedRoute role="hospital_staff"><HospitalStaffPage /></ProtectedRoute>} />
          <Route path="/hospital/settings" element={<ProtectedRoute role="hospital_staff"><HospitalSettingsPage /></ProtectedRoute>} />
          <Route path="/hospital/opportunities" element={<ProtectedRoute role="hospital_staff"><HospitalOpportunitiesPage /></ProtectedRoute>} />
          <Route path="/hospital/opportunities/new" element={<ProtectedRoute role="hospital_staff"><HospitalNewOpportunityPage /></ProtectedRoute>} />
          <Route path="/hospital/opportunities/:id" element={<ProtectedRoute role="hospital_staff"><HospitalOpportunityDetailPage /></ProtectedRoute>} />

          <Route path="/marketplace" element={<ProtectedRoute><MarketplacePage /></ProtectedRoute>} />
          <Route path="/marketplace/minhas-candidaturas" element={<ProtectedRoute><MyApplicationsPage /></ProtectedRoute>} />
          <Route path="/marketplace/:id" element={<ProtectedRoute><MarketplaceDetailPage /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
