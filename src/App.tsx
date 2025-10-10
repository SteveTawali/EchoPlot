import React, { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/hooks/useLanguage";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import AdminLayout from "@/layouts/AdminLayout";

// Lazy load route components for better performance
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const KenyaOnboarding = lazy(() => import("./pages/KenyaOnboarding"));
const Matches = lazy(() => import("./pages/Matches"));
const Verifications = lazy(() => import("./pages/Verifications"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const VerificationQueue = lazy(() => import("./pages/admin/VerificationQueue"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const Profile = lazy(() => import("./pages/Profile"));
const ProfileDashboard = lazy(() => import("./pages/profile/ProfileDashboard"));
const ProfileEdit = lazy(() => import("./pages/profile/ProfileEdit"));
const PlantingHistory = lazy(() => import("./pages/profile/PlantingHistory"));
const RewardsWallet = lazy(() => import("./pages/profile/RewardsWallet"));
const Achievements = lazy(() => import("./pages/profile/Achievements"));
const ProfileSettings = lazy(() => import("./pages/profile/ProfileSettings"));
const NurseryMarketplace = lazy(() => import("./pages/NurseryMarketplace"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    },
  },
});

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="space-y-4 w-full max-w-md px-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <LanguageProvider>
            <Toaster />
            <Sonner />
            <OfflineIndicator />
            <BrowserRouter>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/onboarding" element={
                    <ProtectedRoute>
                      <KenyaOnboarding />
                    </ProtectedRoute>
                  } />
                  <Route path="/matches" element={
                    <ProtectedRoute requireOnboarding>
                      <Matches />
                    </ProtectedRoute>
                  } />
                  <Route path="/verifications" element={
                    <ProtectedRoute requireOnboarding>
                      <Verifications />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard" element={
                    <ProtectedRoute requireOnboarding>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/nursery" element={
                    <ProtectedRoute requireOnboarding>
                      <NurseryMarketplace />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin" element={
                    <ProtectedRoute requireOnboarding>
                      <AdminLayout>
                        <AdminOverview />
                      </AdminLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/verifications" element={
                    <ProtectedRoute requireOnboarding>
                      <AdminLayout>
                        <VerificationQueue />
                      </AdminLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/users" element={
                    <ProtectedRoute requireOnboarding>
                      <AdminLayout>
                        <AdminUsers />
                      </AdminLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/analytics" element={
                    <ProtectedRoute requireOnboarding>
                      <AdminLayout>
                        <AdminAnalytics />
                      </AdminLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute requireOnboarding>
                      <Profile />
                    </ProtectedRoute>
                  }>
                    <Route index element={<ProfileDashboard />} />
                    <Route path="dashboard" element={<ProfileDashboard />} />
                    <Route path="edit" element={<ProfileEdit />} />
                    <Route path="plantings" element={<PlantingHistory />} />
                    <Route path="rewards" element={<RewardsWallet />} />
                    <Route path="achievements" element={<Achievements />} />
                    <Route path="settings" element={<ProfileSettings />} />
                  </Route>
                  <Route path="/" element={
                    <ProtectedRoute requireOnboarding>
                      <Index />
                    </ProtectedRoute>
                  } />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </LanguageProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
