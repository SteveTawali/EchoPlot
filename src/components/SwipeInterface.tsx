import { useState } from "react";
import { TreeCard } from "./TreeCard";
import { Button } from "@/components/ui/button";
import { X, Heart, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface Tree {
  id: number;
  name: string;
  scientificName: string;
  image: string;
  benefits: string[];
  climate: string;
  growthRate: string;
}

interface SwipeInterfaceProps {
  trees: Tree[];
}

export const SwipeInterface = ({ trees }: SwipeInterfaceProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchedTrees, setMatchedTrees] = useState<Tree[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const currentTree = trees[currentIndex];

  const handleSwipe = (direction: 'left' | 'right') => {
    if (isAnimating) return;

    setIsAnimating(true);
    setSwipeDirection(direction);

    if (direction === 'right') {
      setMatchedTrees([...matchedTrees, currentTree]);
      toast.success(`🌳 Matched with ${currentTree.name}!`, {
        description: "Great choice for your land!",
      });
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
    <div className="flex flex-col items-center space-y-6 animate-fade-in">
      {/* Progress indicator */}
      <div className="w-full max-w-sm">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Progress</span>
          <span>{currentIndex + 1} / {trees.length}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
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
        >
          <TreeCard {...currentTree} />
        </div>

        {/* Next card preview */}
        {currentIndex + 1 < trees.length && (
          <div className="absolute inset-0 -z-10 scale-95 opacity-50">
            <TreeCard {...trees[currentIndex + 1]} />
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-6 items-center">
        <Button
          variant="swipe"
          size="icon"
          className="w-16 h-16 rounded-full"
          onClick={() => handleSwipe('left')}
          disabled={isAnimating}
        >
          <X className="w-8 h-8 text-destructive" />
        </Button>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {matchedTrees.length} tree{matchedTrees.length !== 1 ? 's' : ''} matched
          </p>
        </div>

        <Button
          variant="swipe"
          size="icon"
          className="w-16 h-16 rounded-full"
          onClick={() => handleSwipe('right')}
          disabled={isAnimating}
        >
          <Heart className="w-8 h-8 text-secondary" />
        </Button>
      </div>

      {/* Instructions */}
      <p className="text-sm text-center text-muted-foreground max-w-sm">
        Swipe right to match with trees perfect for your land, or left to pass
      </p>
    </div>
  );
};
