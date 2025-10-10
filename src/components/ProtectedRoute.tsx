import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export const ProtectedRoute = ({ children, requireOnboarding = false }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isModerator, loading: roleLoading } = useAdminAuth();
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      if (user && requireOnboarding) {
        const { data } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("user_id", user.id)
          .single();

        setOnboardingCompleted(data?.onboarding_completed || false);
      }
      setCheckingProfile(false);
    };

    if (!authLoading) {
      checkProfile();
    }
  }, [user, authLoading, requireOnboarding]);

  if (authLoading || checkingProfile || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-card">
        <div className="space-y-4 w-full max-w-md p-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect admins and moderators to admin panel
  if ((isAdmin || isModerator) && requireOnboarding) {
    return <Navigate to="/admin" replace />;
  }

  if (requireOnboarding && !onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};
