import { Card } from "@/components/ui/card";
import { SeasonalInsights } from "./SeasonalInsights";
import type { SeasonalRecommendation, SuccessProbability } from "@/utils/compatibility";

interface TreeCardProps {
  name: string;
  scientificName: string;
  image: string;
  benefits: string[];
  climate: string;
  growthRate: string;
  onSwipe?: (direction: 'left' | 'right') => void;
  compatibilityScore?: number;
  description?: string;
  seasonalData?: SeasonalRecommendation;
  successData?: SuccessProbability;
}

export const TreeCard = ({
  name,
  scientificName,
  image,
  benefits,
  climate,
  growthRate,
  compatibilityScore,
  description,
  seasonalData,
  successData,
}: TreeCardProps) => {
  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-orange-500";
  };

  return (
    <Card className="w-full max-w-sm overflow-hidden shadow-card hover:shadow-hover transition-all duration-300" role="article" aria-label={`Tree card for ${name}`}>
      <div className="relative h-96 overflow-hidden">
        <img
          src={image}
          alt={`${name} (${scientificName}) tree with its characteristic foliage`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" aria-hidden="true" />
        
        {/* Compatibility Badge */}
        {compatibilityScore !== undefined && (
          <div className="absolute top-4 right-4">
            <div 
              className={`${getCompatibilityColor(compatibilityScore)} px-4 py-2 rounded-full backdrop-blur-sm`}
              role="status"
              aria-label={`${compatibilityScore} percent compatibility match`}
            >
              <span className="text-white font-bold text-lg" aria-hidden="true">{compatibilityScore}%</span>
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h2 className="text-3xl font-bold mb-1">{name}</h2>
          <p className="text-sm opacity-90 italic">{scientificName}</p>
        </div>
      </div>
      
      <div className="p-6 space-y-4 bg-gradient-card">
        {/* Seasonal Insights */}
        {seasonalData && successData && (
          <SeasonalInsights 
            seasonal={seasonalData}
            success={successData}
            treeName={name}
          />
        )}
        
        {description && (
          <div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        )}
        
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">Benefits</h3>
          <div className="flex flex-wrap gap-2" role="list" aria-label="Tree benefits">
            {benefits.map((benefit, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium"
                role="listitem"
              >
                {benefit}
              </span>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-1">Climate</h3>
            <p className="text-sm">{climate}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-1">Growth Rate</h3>
            <p className="text-sm">{growthRate}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
