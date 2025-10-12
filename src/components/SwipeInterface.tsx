import { useState, useEffect, useRef } from "react";
import { TreeCard } from "./TreeCard";
import { LocationDetector } from "./LocationDetector";
import { Button } from "@/components/ui/button";
import { X, Heart, RotateCcw, History, Info } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  calculateKenyanCompatibility,
  calculateKenyanCompatibilityWithWeather,
  getKenyanSeasonalRecommendation, 
  calculateKenyanSuccessProbability,
  type SeasonalRecommendation,
  type SuccessProbability
} from "@/utils/kenyaCompatibility";
import type { KenyanTreeSpecies } from "@/data/kenya";
import { KenyanTreeCard } from "./KenyanTreeCard";
import { TreeDetailDialog } from "./TreeDetailDialog";

interface SwipeInterfaceProps {
  trees: KenyanTreeSpecies[];
}

export const SwipeInterface = ({ trees }: SwipeInterfaceProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchedTreeIds, setMatchedTreeIds] = useState<Set<number>>(new Set());
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [compatibilityScore, setCompatibilityScore] = useState(0);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [seasonalData, setSeasonalData] = useState<SeasonalRecommendation | null>(null);
  const [successData, setSuccessData] = useState<SuccessProbability | null>(null);
  const [filteredTrees, setFilteredTrees] = useState<KenyanTreeSpecies[]>(trees);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const hasShownToast = useRef(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const currentTree = filteredTrees[currentIndex];

  // Fetch user profile, weather data, and existing matches
  useEffect(() => {
    fetchProfileAndWeather();
    fetchExistingMatches();
  }, [user]);

  const fetchExistingMatches = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("tree_matches")
        .select("tree_id")
        .eq("user_id", user.id);

      if (error) throw error;
      
      const matchedIds = new Set(data?.map(m => m.tree_id) || []);
      setMatchedTreeIds(matchedIds);
    } catch (error) {
      console.error("Error fetching matches:", error);
    }
  };

  const fetchProfileAndWeather = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();
    
    setUserProfile(data);

    // Filter and sort trees based on user's location
    if (data) {
      const treesWithScores = trees.map(tree => {
        const score = calculateKenyanCompatibility(tree, data);
        return { tree, score };
      });
      
      // Sort by compatibility score (highest first)
      treesWithScores.sort((a, b) => b.score - a.score);
      
      // Filter to only show trees with at least 45% compatibility (lowered threshold)
      const suitable = treesWithScores
        .filter(({ score }) => score >= 45)
        .map(({ tree }) => tree);
      
      console.log(`📊 Total trees: ${trees.length}, Suitable: ${suitable.length}, Threshold: 45%`);
      
      if (suitable.length > 0) {
        setFilteredTrees(suitable);
        if (!hasShownToast.current) {
          toast.success(`Found ${suitable.length} trees perfect for your location!`, {
            description: `${data.county}, ${data.agro_zone || 'Agro-zone not set'}`
          });
          hasShownToast.current = true;
        }
      } else {
        // If no highly compatible trees, show all but notify user
        setFilteredTrees(trees);
        if (!hasShownToast.current) {
          toast.info('Showing all trees - update your profile for better matches');
          hasShownToast.current = true;
        }
      }
    }

    // If user has location data, fetch weather
    if (data?.latitude && data?.longitude) {
      const { data: weather } = await supabase.functions.invoke('get-weather-data', {
        body: {
          latitude: data.latitude,
          longitude: data.longitude,
        },
      });
      
      if (weather) {
        setWeatherData(weather);
      }
    }
  };

  const handleLocationDetected = async (location: { latitude: number; longitude: number; weatherData: any }) => {
    // Update user profile with new location
    const { error } = await supabase
      .from("profiles")
      .update({
        latitude: location.latitude,
        longitude: location.longitude,
      })
      .eq("user_id", user?.id);

    if (!error) {
      setWeatherData(location.weatherData);
      await fetchProfileAndWeather();
      toast.success("Location updated! Compatibility scores refreshed.");
    }
  };

  // Calculate compatibility when tree or profile changes
  useEffect(() => {
    if (currentTree && userProfile) {
      // Use Kenya-specific compatibility calculation
      const score = weatherData && userProfile.latitude && userProfile.longitude
        ? calculateKenyanCompatibilityWithWeather(currentTree, userProfile, weatherData)
        : calculateKenyanCompatibility(currentTree, userProfile);
      
      setCompatibilityScore(score);
      
      // Calculate Kenya-specific seasonal recommendation
      const seasonal = getKenyanSeasonalRecommendation(currentTree, userProfile, weatherData);
      setSeasonalData(seasonal);
      
      // Calculate Kenya-specific success probability
      const success = calculateKenyanSuccessProbability(currentTree, userProfile, weatherData);
      setSuccessData(success);
    }
  }, [currentTree, userProfile, weatherData]);

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (isAnimating || !user) return;

    // Check if already matched
    if (direction === 'right' && matchedTreeIds.has(currentTree.dbId)) {
      toast.info(`Already matched with ${currentTree.englishName}!`, {
        description: "Check your matches page to see all your trees.",
      });
      
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 300);
      return;
    }

    setIsAnimating(true);
    setSwipeDirection(direction);

    if (direction === 'right') {
      // Save match to database first
      try {
        const { error } = await supabase
          .from("tree_matches")
          .insert({
            user_id: user.id,
            tree_id: currentTree.dbId,
            tree_name: currentTree.englishName,
            compatibility_score: compatibilityScore,
          });

        if (error) {
          if (error.message.includes("duplicate")) {
            toast.info(`Already matched with ${currentTree.englishName}!`);
          } else {
            throw error;
          }
        } else {
          // Only update local state if database insert succeeds
          setMatchedTreeIds(prev => new Set([...prev, currentTree.dbId]));
          
          toast.success(`🌳 Matched with ${currentTree.englishName}!`, {
            description: `${compatibilityScore}% compatibility - Great choice!`,
          });
        }
      } catch (error: any) {
        console.error("Error saving match:", error);
        toast.error("Failed to save match");
      }
    } else {
      toast.info(`Passed on ${currentTree.englishName}`, {
        description: "Keep swiping to find your perfect tree!",
      });
    }

    setTimeout(() => {
      setCurrentIndex(currentIndex + 1);
      setIsAnimating(false);
      setSwipeDirection(null);
    }, 300);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    toast.info("Starting over!", {
      description: "Let's find the perfect trees for you!",
    });
  };

  if (currentIndex >= filteredTrees.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-6 animate-fade-in">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            All Done! 🎉
          </h2>
          <p className="text-lg text-muted-foreground max-w-md">
            You've seen all available trees!
          </p>
          <p className="text-muted-foreground">
            Check your matches page to see the {matchedTreeIds.size} tree{matchedTreeIds.size !== 1 ? 's' : ''} you've matched with.
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="hero" size="lg" onClick={handleReset} className="gap-2">
            <RotateCcw className="w-5 h-5" />
            Start Over
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate("/matches")} className="gap-2">
            <Heart className="w-5 h-5" />
            View Matches
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6 animate-fade-in" role="region" aria-label="Tree matching interface">
      {/* Location Detection & View Matches */}
      <div className="flex gap-2 sm:gap-3 w-full max-w-sm px-4 sm:px-0">
        <Button
          variant="outline"
          onClick={() => navigate("/matches")}
          className="gap-2 flex-1 h-11 sm:h-10"
          aria-label={`View your ${matchedTreeIds.size} tree matches`}
        >
          <History className="w-4 h-4" aria-hidden="true" />
          <span className="text-sm sm:text-base">Matches ({matchedTreeIds.size})</span>
        </Button>
      </div>

      {/* GPS Detection */}
      <LocationDetector onLocationDetected={handleLocationDetected} className="w-full max-w-sm px-4 sm:px-0" />

      {/* Progress indicator */}
      <div className="w-full max-w-sm px-4 sm:px-0">
        <div className="flex justify-between text-xs sm:text-sm text-muted-foreground mb-2">
          <span>Progress</span>
          <span aria-live="polite">{currentIndex + 1} / {filteredTrees.length}</span>
        </div>
        <div 
          className="h-2 bg-muted rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={currentIndex + 1}
          aria-valuemin={1}
          aria-valuemax={filteredTrees.length}
          aria-label={`Tree selection progress: ${currentIndex + 1} of ${filteredTrees.length}`}
        >
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / filteredTrees.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Card Stack */}
      <div className="relative w-full max-w-sm h-[500px] sm:h-[600px] px-4 sm:px-0">
        {/* Current card */}
        <div
          className={`absolute inset-0 transition-all duration-300 cursor-pointer ${
            isAnimating && swipeDirection === 'left' ? 'animate-swipe-left' : ''
          } ${
            isAnimating && swipeDirection === 'right' ? 'animate-swipe-right' : ''
          }`}
          role="group"
          aria-label="Current tree card"
          onClick={() => setShowDetailDialog(true)}
        >
          <KenyanTreeCard 
            {...currentTree} 
            compatibilityScore={compatibilityScore}
            seasonalData={seasonalData || undefined}
            successData={successData || undefined}
          />
          {/* Click indicator */}
          <div className="absolute top-4 left-4 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
            <Info className="w-4 h-4" />
            Click for details & purchase
          </div>
        </div>

        {/* Next card preview */}
        {currentIndex + 1 < filteredTrees.length && (
          <div className="absolute inset-0 -z-10 scale-95 opacity-50" aria-hidden="true">
            <KenyanTreeCard {...filteredTrees[currentIndex + 1]} />
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-4 sm:gap-6 items-center px-4 sm:px-0" role="group" aria-label="Swipe actions">
        <Button
          variant="swipe"
          size="icon"
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full"
          onClick={() => handleSwipe('left')}
          disabled={isAnimating}
          aria-label={`Pass on ${currentTree?.englishName}`}
        >
          <X className="w-7 h-7 sm:w-8 sm:h-8 text-destructive" aria-hidden="true" />
        </Button>
        
        <div className="text-center min-w-[80px] sm:min-w-[100px]">
          <p className="text-xs sm:text-sm text-muted-foreground" aria-live="polite">
            {matchedTreeIds.size} tree{matchedTreeIds.size !== 1 ? 's' : ''} matched
          </p>
        </div>

        <Button
          variant="swipe"
          size="icon"
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full"
          onClick={() => handleSwipe('right')}
          disabled={isAnimating}
          aria-label={`Match with ${currentTree?.englishName}`}
        >
          <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-secondary" aria-hidden="true" />
        </Button>
      </div>

      {/* Instructions */}
      <p className="text-xs sm:text-sm text-center text-muted-foreground max-w-sm px-4" role="note">
        Click card for details • Swipe right to match • Swipe left to pass
      </p>

      {/* Tree Detail Dialog */}
      <TreeDetailDialog
        tree={currentTree}
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        compatibilityScore={compatibilityScore}
        seasonalData={seasonalData || undefined}
        successData={successData || undefined}
      />
    </div>
  );
};
