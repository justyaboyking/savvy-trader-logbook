
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Stats from "./pages/Stats";
import TradeEntry from "./pages/TradeEntry";
import Lessons from "./pages/Lessons";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import { motion, AnimatePresence } from "framer-motion";
import EditTrade from "./pages/EditTrade";
import AdminDashboard from "./pages/AdminDashboard";
import UserStats from "./pages/UserStats";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AnimatePresence mode="wait">
            <Routes>
              {/* Redirect the index to login page */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              
              {/* Main app routes (protected) */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/trade-entry" element={<TradeEntry />} />
              <Route path="/lessons" element={<Lessons />} />
              
              {/* Admin routes */}
              <Route path="/admin" element={<Admin />} />
              
              {/* New routes */}
              <Route path="/edit-trade/:id" element={<EditTrade />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/user-stats/:userId" element={<UserStats />} />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
