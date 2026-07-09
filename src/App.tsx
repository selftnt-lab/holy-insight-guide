import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import BottomNav from "@/components/BottomNav";
import AppHeader from "@/components/AppHeader";
import Dashboard from "@/pages/Dashboard";
import Reading from "@/pages/Reading";
import Explore from "@/pages/Explore";
import Profile from "@/pages/Profile";
import Auth from "@/pages/Auth";
import ChatHistory from "@/pages/ChatHistory";
import Plans from "@/pages/Plans";
import Search from "@/pages/Search";
import Journal from "@/pages/Journal";
import Terms from "@/pages/legal/Terms";
import Privacy from "@/pages/legal/Privacy";
import Licenses from "@/pages/legal/Licenses";
import NotFound from "@/pages/NotFound";
import AdminKnowledge from "@/pages/admin/Knowledge";
import WriterList from "@/pages/writer/WriterList";
import WriterEditor from "@/pages/writer/WriterEditor";
import WriterPrint from "@/pages/writer/WriterPrint";
import { AudioPlayerProvider } from "@/contexts/AudioPlayerProvider";
import MiniAudioPlayer from "@/components/MiniAudioPlayer";
import AppErrorBoundary from "@/components/AppErrorBoundary";




const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AudioPlayerProvider>
              <AppErrorBoundary>
                <AppHeader />
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/reading" element={<ProtectedRoute><Reading /></ProtectedRoute>} />
                  <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/chat-history" element={<ProtectedRoute><ChatHistory /></ProtectedRoute>} />
                  <Route path="/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
                  <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
                  <Route path="/journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
                  <Route path="/admin/knowledge" element={<ProtectedRoute><AdminKnowledge /></ProtectedRoute>} />
                  <Route path="/writer" element={<ProtectedRoute><WriterList /></ProtectedRoute>} />
                  <Route path="/writer/new" element={<ProtectedRoute><WriterEditor /></ProtectedRoute>} />
                  <Route path="/writer/:id" element={<ProtectedRoute><WriterEditor /></ProtectedRoute>} />
                  <Route path="/writer/:id/print" element={<ProtectedRoute><WriterPrint /></ProtectedRoute>} />
                  <Route path="/legal/termos" element={<Terms />} />
                  <Route path="/legal/privacidade" element={<Privacy />} />
                  <Route path="/legal/licencas" element={<Licenses />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <MiniAudioPlayer />
                <BottomNav />
              </AppErrorBoundary>
            </AudioPlayerProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
