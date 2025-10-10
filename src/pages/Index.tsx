import { SwipeInterface } from "@/components/SwipeInterface";
import { KENYAN_TREES } from "@/data/kenya";
import { Button } from "@/components/ui/button";
import { Leaf, Heart, Globe, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useNavigate } from "react-router-dom";
import heroForest from "@/assets/hero-forest.jpg";
import { toast } from "sonner";

const Index = () => {
  const { signOut, user } = useAuth();
  const { canModerate } = useAdminAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">Canopy Connections</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              Dashboard
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/community")}>
              Community
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/verifications")}>
              Verifications
            </Button>
            {canModerate && (
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
                <Shield className="w-4 h-4 mr-2" />
                Admin
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-16">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroForest})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-primary/30">
            <Leaf className="w-4 h-4 text-primary-foreground" />
            <span className="text-sm text-primary-foreground font-medium">
              Swipe Right to Save the Planet
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Tinder for Tree Planting
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            Match with the perfect tree species for your land. Swipe right to plant, swipe left to pass. 
            Every match makes a real difference.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              variant="hero"
              size="xl"
              onClick={() => {
                document.getElementById('swipe-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Start Swiping
            </Button>
            <div className="flex items-center gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-secondary" />
                <span className="text-sm">10K+ Matches</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-secondary" />
                <span className="text-sm">50+ Countries</span>
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
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Leaf className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Browse Trees</h3>
              <p className="text-muted-foreground">
                Discover diverse tree species perfectly matched to your climate and soil conditions
              </p>
            </div>
            
            <div className="text-center space-y-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold">Swipe Right</h3>
              <p className="text-muted-foreground">
                Match with trees that fit your land. Each right swipe brings you closer to a greener future
              </p>
            </div>
            
            <div className="text-center space-y-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                <Globe className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Make Impact</h3>
              <p className="text-muted-foreground">
                Your matches contribute to reforestation projects worldwide. Track your environmental impact
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Swipe Section */}
      <section id="swipe-section" className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Find Your Perfect Match
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Each tree has unique benefits and requirements. Swipe through our curated selection 
              and discover the perfect species for your land.
            </p>
          </div>
          
          <SwipeInterface trees={KENYAN_TREES} />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground">
            Together, we're making the world greener, one swipe at a time 🌱
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
