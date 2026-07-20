import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ThemeProvider } from "./components/ThemeProvider";
import AppHeader from "./components/AppHeader";
import BottomNav from "./components/BottomNav";
import AppErrorBoundary from "./components/AppErrorBoundary";
import PostAuthRedirect from "./components/PostAuthRedirect";
import ProtectedRoute from "./components/ProtectedRoute";
import MiniAudioPlayer from "./components/MiniAudioPlayer";
import { AudioPlayerProvider } from "./contexts/AudioPlayerProvider";
import { AuthProvider } from "./hooks/useAuth";

// Corrigindo caminhos de importação baseados na estrutura real de arquivos
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Reading = lazy(() => import("./pages/Reading"));
const Explore = lazy(() => import("./pages/Explore"));
const Profile = lazy(() => import("./pages/Profile"));
const Auth = lazy(() => import("./pages/Auth"));
const Plans = lazy(() => import("./pages/Plans"));
const Journal = lazy(() => import("./pages/Journal"));
const Search = lazy(() => import("./pages/Search"));
const WriterList = lazy(() => import("./pages/writer/WriterList"));
const WriterEditor = lazy(() => import("./pages/writer/WriterEditor"));
const ChatHistory = lazy(() => import("./pages/ChatHistory"));
const AdminKnowledge = lazy(() => import("./pages/admin/Knowledge"));
const AdminErrors = lazy(() => import("./pages/admin/ClientErrors"));
const OAuthConsent = lazy(() => import("./pages/OAuthConsent"));
const Terms = lazy(() => import("./pages/legal/Terms"));
const Privacy = lazy(() => import("./pages/legal/Privacy"));
const Licenses = lazy(() => import("./pages/legal/Licenses"));
const Contribute = lazy(() => import("./pages/Contribute"));
const Planning = lazy(() => import("./pages/Planning"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const App = () => (
  <AppErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <AudioPlayerProvider>
              <Toaster />
              <BrowserRouter>
                <AppHeader />
                <PostAuthRedirect />
                <Suspense fallback={<div className="flex h-screen items-center justify-center font-serif text-muted-foreground">Carregando...</div>}>
                  <main id="main">
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/auth/v1/consent" element={<OAuthConsent />} />
                      
                      {/* ProtectedRoute espera children, então usamos um componente de layout que renderiza o Outlet */}
                      <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/reading" element={<Reading />} />
                        <Route path="/explore" element={<Explore />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/plans" element={<Plans />} />
                        <Route path="/journal" element={<Journal />} />
                        <Route path="/search" element={<Search />} />
                        <Route path="/writer" element={<WriterList />} />
                        <Route path="/writer/:id" element={<WriterEditor />} />
                        <Route path="/chat-history" element={<ChatHistory />} />
                        <Route path="/admin/knowledge" element={<AdminKnowledge />} />
                        <Route path="/admin/errors" element={<AdminErrors />} />
                        <Route path="/contribute" element={<Contribute />} />
                        <Route path="/planning" element={<Planning />} />
                      </Route>
                      
                      <Route path="/legal/termos" element={<Terms />} />
                      <Route path="/legal/privacidade" element={<Privacy />} />
                      <Route path="/legal/licencas" element={<Licenses />} />
                    </Routes>
                  </main>
                </Suspense>
                <MiniAudioPlayer />
                <BottomNav />
              </BrowserRouter>
            </AudioPlayerProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </AppErrorBoundary>
);

export default App;
