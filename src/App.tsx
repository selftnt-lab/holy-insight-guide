import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ThemeProvider } from "./components/ThemeProvider";
import AppHeader from "./components/AppHeader";
import BottomNav from "./components/BottomNav";
import AppErrorBoundary from "./components/AppErrorBoundary";
import PostAuthRedirect from "./components/PostAuthRedirect";
import ProtectedRoute from "./components/ProtectedRoute";
import MiniAudioPlayer from "./components/MiniAudioPlayer";

const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Reading = lazy(() => import("./pages/Reading"));
const Explore = lazy(() => import("./pages/Explore"));
const Profile = lazy(() => import("./pages/Profile"));
const Auth = lazy(() => import("./pages/Auth"));
const Plans = lazy(() => import("./pages/Plans"));
const PlanDetail = lazy(() => import("./pages/PlanDetail"));
const Journal = lazy(() => import("./pages/Journal"));
const Search = lazy(() => import("./pages/Search"));
const Writer = lazy(() => import("./pages/Writer"));
const WriterEditor = lazy(() => import("./pages/WriterEditor"));
const ChatHistory = lazy(() => import("./pages/ChatHistory"));
const AdminKnowledge = lazy(() => import("./pages/AdminKnowledge"));
const AdminErrors = lazy(() => import("./pages/AdminErrors"));
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
      <ThemeProvider defaultTheme="light" storageKey="rc-bible-theme">
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <AppHeader />
            <PostAuthRedirect />
            <Suspense fallback={<div className="flex h-screen items-center justify-center">Carregando...</div>}>
              <main id="main">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth/v1/consent" element={<OAuthConsent />} />
                  
                  <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/reading" element={<Reading />} />
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/plans" element={<Plans />} />
                    <Route path="/plans/:id" element={<PlanDetail />} />
                    <Route path="/journal" element={<Journal />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/writer" element={<Writer />} />
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
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </AppErrorBoundary>
);

export default App;
