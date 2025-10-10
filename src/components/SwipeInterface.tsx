import { useState, useEffect } from "react";
import { TreeCard } from "./TreeCard";
import { LocationDetector } from "./LocationDetector";
import { Button } from "@/components/ui/button";
import { X, Heart, RotateCcw, History } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  calculateCompatibility,
  calculateCompatibilityWithWeather,
  getSeasonalRecommendation, 
  calculateSuccessProbability,
  type SeasonalRecommendation,
  type SuccessProbability
} from "@/utils/compatibility";
import type { Tree } from "@/data/trees";

interface SwipeInterfaceProps {
  trees: Tree[];
}

export const SwipeInterface = ({ trees }: SwipeInterfaceProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchedTrees, setMatchedTrees] = useState<Tree[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [compatibilityScore, setCompatibilityScore] = useState(0);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [seasonalData, setSeasonalData] = useState<SeasonalRecommendation | null>(null);
  const [successData, setSuccessData] = useState<SuccessProbability | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const currentTree = trees[currentIndex];

  // Fetch user profile and weather data
  useEffect(() => {
    fetchProfileAndWeather();
  }, [user]);

  const fetchProfileAndWeather = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();
    
    setUserProfile(data);

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
      // Use enhanced compatibility if weather data is available
      const score = weatherData && userProfile.latitude && userProfile.longitude
        ? calculateCompatibilityWithWeather(currentTree, userProfile, weatherData)
        : calculateCompatibility(currentTree, userProfile);
      
      setCompatibilityScore(score);
      
      // Calculate seasonal recommendation
      const seasonal = getSeasonalRecommendation(currentTree, userProfile, weatherData);
      setSeasonalData(seasonal);
      
      // Calculate success probability
      const success = calculateSuccessProbability(currentTree, userProfile, weatherData);
      setSuccessData(success);
    }
  }, [currentTree, userProfile, weatherData]);

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (isAnimating || !user) return;

    setIsAnimating(true);
    setSwipeDirection(direction);

    if (direction === 'right') {
      setMatchedTrees([...matchedTrees, currentTree]);
      
      // Save match to database
      try {
        const { error } = await supabase
          .from("tree_matches")
          .insert({
            user_id: user.id,
            tree_id: currentTree.id,
            tree_name: currentTree.name,
            compatibility_score: compatibilityScore,
          });

        if (error && !error.message.includes("duplicate")) {
          throw error;
        }

        toast.success(`🌳 Matched with ${currentTree.name}!`, {
          description: `${compatibilityScore}% compatibility - Great choice!`,
        });
      } catch (error: any) {
        console.error("Error saving match:", error);
        toast.error("Failed to save match");
      }
    } else {
      toast.info(`Passed on ${currentTree.name}`, {
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
    setMatchedTrees([]);
    toast.info("Starting over!", {
      description: "Let's find the perfect trees for you!",
    });
  };

  if (currentIndex >= trees.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-6 animate-fade-in">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            All Done! 🎉
          </h2>
          <p className="text-lg text-muted-foreground max-w-md">
            You've matched with {matchedTrees.length} tree{matchedTrees.length !== 1 ? 's' : ''}!
          </p>
          {matchedTrees.length > 0 && (
            <div className="mt-6 space-y-2">
              <p className="font-semibold text-primary">Your Tree Matches:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {matchedTrees.map((tree) => (
                  <span
                    key={tree.id}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-full font-medium"
                  >
                    {tree.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <Button variant="hero" size="lg" onClick={handleReset} className="gap-2">
          <RotateCcw className="w-5 h-5" />
          Start Over
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6 animate-fade-in" role="region" aria-label="Tree matching interface">
      {/* Location Detection & View Matches */}
      <div className="flex gap-3 w-full max-w-sm">
        <Button
          variant="outline"
          onClick={() => navigate("/matches")}
          className="gap-2 flex-1"
          aria-label={`View your ${matchedTrees.length} tree matches`}
        >
          <History className="w-4 h-4" aria-hidden="true" />
          Matches ({matchedTrees.length})
        </Button>
      </div>

      {/* GPS Detection */}
      <LocationDetector onLocationDetected={handleLocationDetected} className="w-full max-w-sm" />

      {/* Progress indicator */}
      <div className="w-full max-w-sm">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Progress</span>
          <span aria-live="polite">{currentIndex + 1} / {trees.length}</span>
        </div>
        <div 
          className="h-2 bg-muted rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={currentIndex + 1}
          aria-valuemin={1}
          aria-valuemax={trees.length}
          aria-label={`Tree selection progress: ${currentIndex + 1} of ${trees.length}`}
        >
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / trees.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Card Stack */}
      <div className="relative w-full max-w-sm h-[600px]">
        {/* Current card */}
        <div
          className={`absolute inset-0 transition-all duration-300 ${
            isAnimating && swipeDirection === 'left' ? 'animate-swipe-left' : ''
          } ${
            isAnimating && swipeDirection === 'right' ? 'animate-swipe-right' : ''
          }`}
          role="group"
          aria-label="Current tree card"
        >
          <TreeCard 
            {...currentTree} 
            compatibilityScore={compatibilityScore}
            seasonalData={seasonalData || undefined}
            successData={successData || undefined}
          />
        </div>

        {/* Next card preview */}
        {currentIndex + 1 < trees.length && (
          <div className="absolute inset-0 -z-10 scale-95 opacity-50" aria-hidden="true">
            <TreeCard {...trees[currentIndex + 1]} />
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-6 items-center" role="group" aria-label="Swipe actions">
        <Button
          variant="swipe"
          size="icon"
          className="w-16 h-16 rounded-full"
          onClick={() => handleSwipe('left')}
          disabled={isAnimating}
          aria-label={`Pass on ${currentTree?.name}`}
        >
          <X className="w-8 h-8 text-destructive" aria-hidden="true" />
        </Button>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {matchedTrees.length} tree{matchedTrees.length !== 1 ? 's' : ''} matched
          </p>
        </div>

        <Button
          variant="swipe"
          size="icon"
          className="w-16 h-16 rounded-full"
          onClick={() => handleSwipe('right')}
          disabled={isAnimating}
          aria-label={`Match with ${currentTree?.name}`}
        >
          <Heart className="w-8 h-8 text-secondary" aria-hidden="true" />
        </Button>
      </div>

      {/* Instructions */}
      <p className="text-sm text-center text-muted-foreground max-w-sm" role="note">
        Swipe right to match with trees perfect for your land, or left to pass
      </p>
    </div>
  );
};
