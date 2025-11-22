import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Heart, Star, Trash2, Leaf, Home } from "lucide-react";
import { toast } from "sonner";
import { logger } from "@/utils/logger";
import { KENYAN_TREES } from "@/data/kenya";

interface Match {
  id: string;
  tree_id: number;
  tree_name: string;
  compatibility_score: number;
  matched_at: string;
  favorited: boolean;
  notes: string | null;
}

const Matches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("tree_matches")
          .select("*")
          .eq("user_id", user.id)
          .order("matched_at", { ascending: false });

        if (error) throw error;
        setMatches(data || []);
      } catch (error) {
        toast.error("Failed to load matches");
        logger.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [user]);

  const toggleFavorite = async (matchId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("tree_matches")
        .update({ favorited: !currentStatus })
        .eq("id", matchId);

      if (error) throw error;

      setMatches((prev) =>
        prev.map((m) => (m.id === matchId ? { ...m, favorited: !currentStatus } : m))
      );

      toast.success(!currentStatus ? "Added to favorites" : "Removed from favorites");
    } catch (error) {
      toast.error("Failed to update favorite");
    }
  };

  const deleteMatch = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from("tree_matches")
        .delete()
        .eq("id", matchId);

      if (error) throw error;

      setMatches((prev) => prev.filter((m) => m.id !== matchId));
      toast.success("Match deleted");
    } catch (error) {
      toast.error("Failed to delete match");
    }
  };

  const getTreeImage = (treeId: number) => {
    const tree = KENYAN_TREES.find((t) => t.dbId === treeId);
    return tree?.image;
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-orange-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 flex justify-between items-center">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="px-2 sm:px-4">
            <Home className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Home</span>
          </Button>
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <span className="font-bold text-base sm:text-lg">Your Matches</span>
          </div>
        </div>
      </nav>

      <div className="pt-20 px-3 sm:px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Your Tree Matches</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              You've matched with {matches.length} tree{matches.length !== 1 ? "s" : ""}
            </p>
          </div>

          {matches.length === 0 ? (
            <Card className="p-8 sm:p-12 text-center">
              <Heart className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl sm:text-2xl font-bold mb-2">No matches yet</h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-6">
                Start swiping to find your perfect trees!
              </p>
              <Button variant="hero" onClick={() => navigate("/")} className="w-full sm:w-auto">
                Start Swiping
              </Button>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              {matches.map((match) => (
                <Card key={match.id} className="overflow-hidden">
                  <div className="relative h-48">
                    <img
                      src={getTreeImage(match.tree_id)}
                      alt={match.tree_name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-4 right-4">
                      <div className={`${getCompatibilityColor(match.compatibility_score)} px-3 py-1 rounded-full`}>
                        <span className="text-white font-bold">{match.compatibility_score}%</span>
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-2xl font-bold">{match.tree_name}</h3>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Matched {new Date(match.matched_at).toLocaleDateString()}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant={match.favorited ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => toggleFavorite(match.id, match.favorited)}
                      >
                        <Star className={`w-4 h-4 mr-2 ${match.favorited ? "fill-current" : ""}`} />
                        {match.favorited ? "Favorited" : "Favorite"}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate(`/verifications?matchId=${match.id}&treeName=${encodeURIComponent(match.tree_name)}`)}
                      >
                        Verify Planting
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMatch(match.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Matches;
