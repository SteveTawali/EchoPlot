import { SwipeInterface } from "@/components/SwipeInterface";
import { KENYAN_TREES } from "@/data/kenya";
import { Button } from "@/components/ui/button";
import { Leaf, Heart, Globe, LogOut, Shield, User, ShoppingCart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useNavigate } from "react-router-dom";
import heroForest from "@/assets/hero-forest.jpg";
import { toast } from "sonner";
import { useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";

const Index = () => {
  const { signOut, user } = useAuth();
  const { canModerate } = useAdminAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Redirect to /auth if user has recovery token (mobile password reset fix)
  useEffect(() => {
    const hash = window.location.hash;
    const searchParams = new URLSearchParams(window.location.search);

    // Check if this is a password reset link
    if (hash.includes('type=recovery') || searchParams.get('type') === 'recovery') {
      // Preserve the full URL and redirect to /auth
      navigate('/auth' + window.location.search + window.location.hash);
    }
  }, [navigate]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 border-b border-border">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-3 flex justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <img
              src="/navbar-logo.webp"
              alt="LeafSwipe"
              className="h-14 sm:h-16 w-auto"
              style={{ imageRendering: 'crisp-edges' }}
            />
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <LanguageSwitcher />
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="hidden sm:flex">
              {t('nav.dashboard')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="px-2 sm:px-4 opacity-70"
              onClick={() => toast.info("Nursery Marketplace", {
                description: "Connect with verified nurseries to purchase your matched trees. Coming soon"
              })}
            >
              <ShoppingCart className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('nav.nursery')} 🔜</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/verifications")} className="hidden md:flex">
              {t('nav.verifications')}
            </Button>
            {canModerate && (
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin")} className="hidden lg:flex">
                <Shield className="w-4 h-4 mr-2" />
                {t('nav.admin')}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => navigate("/profile")} className="px-2 sm:px-4">
              <User className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('nav.profile')}</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="px-2 sm:px-4">
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('nav.signOut')}</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroForest})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in py-12">
          <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-6 border border-primary/30">
            <Leaf className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />
            <span className="text-xs sm:text-sm text-primary-foreground font-medium">
              {t('home.tagline')}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white mb-4 sm:mb-6">
            {t('home.welcome')} 🌳
          </h1>

          <p className="text-base sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
            {t('home.description')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              variant="hero"
              size="xl"
              onClick={() => {
                document.getElementById('swipe-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto"
            >
              {t('home.startSwiping')}
            </Button>
            <div className="flex items-center gap-4 sm:gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
                <span className="text-xs sm:text-sm">10K+ {t('home.matches')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
                <span className="text-xs sm:text-sm">50+ {t('home.countries')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12">
            {t('home.howItWorks')}
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Leaf className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{t('home.browseTrees')}</h3>
              <p className="text-muted-foreground">
                {t('home.browseDesc')}
              </p>
            </div>

            <div className="text-center space-y-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold">{t('home.swipeRight')}</h3>
              <p className="text-muted-foreground">
                {t('home.swipeDesc')}
              </p>
            </div>

            <div className="text-center space-y-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                <Globe className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">{t('home.makeImpact')}</h3>
              <p className="text-muted-foreground">
                {t('home.impactDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Swipe Section */}
      <section id="swipe-section" className="py-12 sm:py-16 md:py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              {t('home.findMatch')}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              {t('home.findMatchDesc')}
            </p>
          </div>

          <SwipeInterface trees={KENYAN_TREES} />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground">
            {t('home.footer')} 🌱
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
