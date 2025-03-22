
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminProvider } from "@/context/AdminContext";
import AdminLayout from "@/components/layout/AdminLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/admin/Dashboard";
import HeroSection from "./pages/admin/HeroSection";
import Categories from "./pages/admin/Categories";
import Albums from "./pages/admin/Albums";
import Images from "./pages/admin/Images";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AdminProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            
            {/* Admin routes */}
            <Route 
              path="/admin" 
              element={
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              } 
            />
            <Route 
              path="/admin/hero" 
              element={
                <AdminLayout>
                  <HeroSection />
                </AdminLayout>
              } 
            />
            <Route 
              path="/admin/categories" 
              element={
                <AdminLayout>
                  <Categories />
                </AdminLayout>
              } 
            />
            <Route 
              path="/admin/albums" 
              element={
                <AdminLayout>
                  <Albums />
                </AdminLayout>
              } 
            />
            <Route 
              path="/admin/images" 
              element={
                <AdminLayout>
                  <Images />
                </AdminLayout>
              } 
            />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AdminProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
