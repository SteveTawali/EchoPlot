import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { SeasonalRecommendation, SuccessProbability } from "@/utils/compatibility";

interface SeasonalInsightsProps {
  seasonal: SeasonalRecommendation;
  success: SuccessProbability;
  treeName: string;
}

export const SeasonalInsights = ({ seasonal, success, treeName }: SeasonalInsightsProps) => {
  const getSuccessColor = (rating: SuccessProbability['rating']) => {
    switch (rating) {
      case 'very-high': return 'text-green-600 bg-green-50 border-green-200';
      case 'high': return 'text-green-600 bg-green-50 border-green-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-orange-600 bg-orange-50 border-orange-200';
    }
  };

  const getSeasonColor = (rating: SeasonalRecommendation['currentSeasonRating']) => {
    switch (rating) {
      case 'optimal': return 'bg-green-500';
      case 'acceptable': return 'bg-yellow-500';
      case 'poor': return 'bg-orange-500';
    }
  };

  return (
    <Card className="p-4 space-y-4 bg-gradient-to-br from-background to-muted/20">
      {/* Success Probability */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Success Probability</span>
          </div>
          <Badge className={getSuccessColor(success.rating)}>
            {success.probability}% - {success.rating.replace('-', ' ').toUpperCase()}
          </Badge>
        </div>
        
        {/* Success Factors Breakdown */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Climate:</span>
            <span className="font-medium">{success.factors.climate}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Soil:</span>
            <span className="font-medium">{success.factors.soil}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Season:</span>
            <span className="font-medium">{success.factors.season}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Weather:</span>
            <span className="font-medium">{success.factors.weather}%</span>
          </div>
        </div>
      </div>

      {/* Seasonal Planting */}
      <div className="space-y-2 pt-2 border-t">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Planting Season</span>
          <div className={`w-2 h-2 rounded-full ${getSeasonColor(seasonal.currentSeasonRating)}`} />
        </div>
        
        <p className="text-sm text-muted-foreground">
          {seasonal.seasonalAdvice}
        </p>
        
        {seasonal.canPlantNow ? (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="w-4 h-4" />
            <span>Optimal planting window is NOW!</span>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">
            Best months: {seasonal.optimalMonths.join(', ')}
          </div>
        )}
      </div>

      {/* Risk Factors */}
      {success.riskFactors.length > 0 && (
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-semibold">Considerations</span>
          </div>
          <ul className="space-y-1">
            {success.riskFactors.map((risk, idx) => (
              <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">•</span>
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};