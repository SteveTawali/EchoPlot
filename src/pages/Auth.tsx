import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Leaf, Eye, EyeOff } from "lucide-react";
import { signInSchema, signUpSchema, validateInput } from "@/utils/validation";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();

  // Check if user is coming from password reset email
  useEffect(() => {
    // Check URL hash for recovery token (Supabase uses hash for magic links)
    const checkRecoveryMode = () => {
      // Check URL hash first (desktop browsers)
      const hash = window.location.hash;
      if (hash) {
        const hashParams = new URLSearchParams(hash.substring(1));
        const type = hashParams.get('type');

        if (type === 'recovery') {
          setIsResettingPassword(true);
          setIsForgotPassword(false);
          setIsLogin(false);
          return;
        }
      }

      // Also check query parameters (mobile browsers sometimes use this)
      const type = searchParams.get('type');
      if (type === 'recovery') {
        setIsResettingPassword(true);
        setIsForgotPassword(false);
        setIsLogin(false);
      }
    };

    checkRecoveryMode();
  }, [searchParams]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!email) {
        toast.error("Please enter your email address");
        setLoading(false);
        return;
      }

      const { error } = await resetPassword(email);
      if (error) {
        toast.error(error.message || "Failed to send reset email");
      } else {
        toast.success("Password reset email sent! Check your inbox.");
        setIsForgotPassword(false);
        setIsLogin(true);
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (newPassword !== confirmPassword) {
        toast.error("Passwords do not match");
        setLoading(false);
        return;
      }

      if (newPassword.length < 6) {
        toast.error("Password must be at least 6 characters");
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        toast.error(error.message || "Failed to reset password");
      } else {
        toast.success("Password updated successfully! Please sign in.");
        setIsResettingPassword(false);
        setIsLogin(true);
        setNewPassword("");
        setConfirmPassword("");
        // Clear the hash from URL
        window.history.replaceState(null, "", window.location.pathname);
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Validate sign in input
        const validation = validateInput(signInSchema, { email, password });
        if (!validation.success) {
          const firstError = validation.errors?.errors[0];
          toast.error(firstError?.message || "Invalid input");
          setLoading(false);
          return;
        }

        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message || "Failed to sign in");
        } else {
          toast.success("Welcome back!");
          navigate("/");
        }
      } else {
        // Validate sign up input
        const validation = validateInput(signUpSchema, { email, password, fullName });
        if (!validation.success) {
          const firstError = validation.errors?.errors[0];
          toast.error(firstError?.message || "Invalid input");
          setLoading(false);
          return;
        }

        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Please sign in instead.");
          } else {
            toast.error(error.message || "Failed to sign up");
          }
        } else {
          toast.success("Account created! Welcome to LeafSwipe.");
          navigate("/onboarding");
        }
      }
    } catch (error) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-card p-4">
      <Card className="w-full max-w-md p-8 shadow-card">
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
            <img src="/square-logo.webp" alt="LeafSwipe" className="h-24 w-24" />
          </div>
          <h1 className="text-3xl font-bold text-center">LeafSwipe</h1>
          <p className="text-muted-foreground text-center mt-2">
            {isResettingPassword
              ? "Set your new password"
              : isLogin
                ? "Welcome back!"
                : "Transform tree planting into intergenerational stewardship"}
          </p>
        </div>

        <form onSubmit={isResettingPassword ? handleResetPassword : isForgotPassword ? handleForgotPassword : handleSubmit} className="space-y-4">
          {!isLogin && !isForgotPassword && !isResettingPassword && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={!isLogin}
                disabled={loading}
              />
            </div>
          )}

          {!isResettingPassword && (
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          )}

          {isResettingPassword ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Must be at least 6 characters
                </p>
              </div>
            </>
          ) : !isForgotPassword && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {!isLogin && (
                <p className="text-xs text-muted-foreground">
                  Must be at least 6 characters with uppercase, lowercase, and number
                </p>
              )}
            </div>
          )}

          {isLogin && !isForgotPassword && !isResettingPassword && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsForgotPassword(true)}
                className="text-sm text-primary hover:underline"
                disabled={loading}
              >
                Forgot password?
              </button>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            variant="hero"
            disabled={loading}
          >
            {loading
              ? "Loading..."
              : isResettingPassword
                ? "Update Password"
                : isForgotPassword
                  ? "Send Reset Link"
                  : isLogin
                    ? "Sign In"
                    : "Sign Up"}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          {isResettingPassword ? (
            <button
              type="button"
              onClick={() => {
                setIsResettingPassword(false);
                setIsLogin(true);
                window.history.replaceState(null, "", window.location.pathname);
              }}
              className="text-sm text-primary hover:underline"
              disabled={loading}
            >
              Back to sign in
            </button>
          ) : isForgotPassword ? (
            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(false);
                setIsLogin(true);
              }}
              className="text-sm text-primary hover:underline"
              disabled={loading}
            >
              Back to sign in
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:underline"
              disabled={loading}
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Auth;
