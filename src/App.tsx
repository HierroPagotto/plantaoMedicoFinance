
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<ProtectedRoute><Logout /></ProtectedRoute>} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/shifts" element={<ProtectedRoute><Shifts /></ProtectedRoute>} />
          <Route path="/shifts/new" element={<ProtectedRoute><NewShift /></ProtectedRoute>} />
          <Route path="/finance" element={<ProtectedRoute><Finance /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/doctor-registration" element={<ProtectedRoute><DoctorRegistration /></ProtectedRoute>} />
          <Route path="/doctor-profile" element={<ProtectedRoute><DoctorProfile /></ProtectedRoute>} />
          <Route path="/doctor-profile/:id" element={<DoctorProfilePublic />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
