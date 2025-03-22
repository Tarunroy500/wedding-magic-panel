
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminProvider } from "@/context/AdminContext";
import { AuthProvider } from "@/context/AuthContext";
import AdminLayout from "@/components/layout/AdminLayout";
import RequireAuth from "@/components/auth/RequireAuth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/admin/Dashboard";
import HeroSection from "./pages/admin/HeroSection";
import Categories from "./pages/admin/Categories";
import Albums from "./pages/admin/Albums";
import Images from "./pages/admin/Images";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Create a client outside of the component
const queryClient = new QueryClient();

// Make sure to define App as a function component
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <AdminProvider>
              <Toaster />
              <Sonner />
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                
                {/* Protected admin routes */}
                <Route 
                  path="/admin" 
                  element={
                    <RequireAuth>
                      <AdminLayout>
                        <Dashboard />
                      </AdminLayout>
                    </RequireAuth>
                  } 
                />
                <Route 
                  path="/admin/hero" 
                  element={
                    <RequireAuth>
                      <AdminLayout>
                        <HeroSection />
                      </AdminLayout>
                    </RequireAuth>
                  } 
                />
                <Route 
                  path="/admin/categories" 
                  element={
                    <RequireAuth>
                      <AdminLayout>
                        <Categories />
                      </AdminLayout>
                    </RequireAuth>
                  } 
                />
                <Route 
                  path="/admin/albums" 
                  element={
                    <RequireAuth>
                      <AdminLayout>
                        <Albums />
                      </AdminLayout>
                    </RequireAuth>
                  } 
                />
                <Route 
                  path="/admin/images" 
                  element={
                    <RequireAuth>
                      <AdminLayout>
                        <Images />
                      </AdminLayout>
                    </RequireAuth>
                  } 
                />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AdminProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
