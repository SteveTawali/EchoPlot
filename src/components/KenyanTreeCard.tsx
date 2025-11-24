import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Leaf, TrendingUp, Calendar, DollarSign } from "lucide-react";
import type { KenyanTreeSpecies } from "@/data/kenya";
import type { SeasonalRecommendation, SuccessProbability } from "@/utils/kenyaCompatibility";
import { useLanguage } from "@/hooks/useLanguage";
import { useTreeImage } from "@/hooks/useTreeImages";

interface KenyanTreeCardProps extends KenyanTreeSpecies {
  compatibilityScore?: number;
  seasonalData?: SeasonalRecommendation;
  successData?: SuccessProbability;
}

export const KenyanTreeCard = ({
  englishName,
  swahiliName,
  scientificName,
  suitableCounties,
  agroZones,
  price,
  uses,
  description,
  compatibilityScore,
  seasonalData,
  successData,
}: KenyanTreeCardProps) => {
  const { language } = useLanguage();
  const { imageUrl, loading: imageLoading } = useTreeImage(englishName);
  const displayName = language === 'sw' ? swahiliName : englishName;
  const displayDescription = description[language as 'en' | 'sw'];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-orange-500";
  };

  const getSuccessColor = (rating: string) => {
    switch (rating) {
      case 'very-high': return 'text-green-600';
      case 'high': return 'text-green-500';
      case 'moderate': return 'text-yellow-600';
      default: return 'text-orange-600';
    }
  };

  const getSeasonColor = (rating: string) => {
    switch (rating) {
      case 'optimal': return 'text-green-600';
      case 'acceptable': return 'text-yellow-600';
      default: return 'text-orange-600';
    }
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden shadow-card hover:shadow-lg transition-shadow">
      {/* Tree Image */}
      <div className="relative w-full h-48 bg-muted overflow-hidden">
        {imageLoading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <img
            src={imageUrl || undefined}
            alt={displayName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
        {/* Compatibility badge overlay */}
        {compatibilityScore !== undefined && (
          <div className={`absolute top-3 right-3 ${getScoreColor(compatibilityScore)} text-white px-3 py-1 rounded-full font-bold shadow-lg`}>
            {compatibilityScore}%
          </div>
        )}
      </div>

      {/* Header with compatibility score */}
      {compatibilityScore !== undefined && (
        <div className={`${getScoreColor(compatibilityScore)} text-white p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">{language === 'sw' ? 'Upatanifu' : 'Compatibility'}</p>
              <p className="text-3xl font-bold">{compatibilityScore}%</p>
            </div>
            <TrendingUp className="w-8 h-8" />
          </div>
        </div>
      )}

      <div className="p-6 flex-1 space-y-4">
        {/* Tree Names */}
        <div>
          <h3 className="text-2xl font-bold text-foreground">{displayName}</h3>
          <p className="text-sm text-muted-foreground italic">{scientificName}</p>
          {language === 'en' && (
            <p className="text-sm text-muted-foreground">Swahili: {swahiliName}</p>
          )}
        </div>

        {/* Description */}
        <p className="text-muted-foreground">{displayDescription}</p>

        {/* Price */}
        <div className="flex items-center gap-2 text-primary font-semibold">
          <DollarSign className="w-5 h-5" />
          <span>KSH {price.toLocaleString()}</span>
        </div>

        {/* Uses */}
        <div>
          <p className="text-sm font-semibold mb-2">{language === 'sw' ? 'Matumizi' : 'Uses'}:</p>
          <div className="flex flex-wrap gap-2">
            {uses.map((use) => (
              <Badge key={use} variant="secondary">
                {use}
              </Badge>
            ))}
          </div>
        </div>

        {/* Suitable Counties */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm font-semibold">{language === 'sw' ? 'Kaunti Zinazofaa' : 'Suitable Counties'}:</p>
          </div>
          <p className="text-sm text-muted-foreground">
            {suitableCounties.slice(0, 3).join(', ')}
            {suitableCounties.length > 3 && ` +${suitableCounties.length - 3} more`}
          </p>
        </div>

        {/* Agro Zones */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm font-semibold">{language === 'sw' ? 'Maeneo ya Kilimo' : 'Agro Zones'}:</p>
          </div>
          <div className="flex flex-wrap gap-1">
            {agroZones.map((zone) => (
              <Badge key={zone} variant="outline" className="text-xs">
                {zone}
              </Badge>
            ))}
          </div>
        </div>

        {/* Seasonal Recommendation */}
        {seasonalData && (
          <div className="bg-muted p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className={`w-4 h-4 ${getSeasonColor(seasonalData.currentSeasonRating)}`} />
              <p className="text-sm font-semibold">
                {language === 'sw' ? 'Ushauri wa Msimu' : 'Seasonal Advice'}:
              </p>
            </div>
            <p className="text-sm text-muted-foreground">{seasonalData.seasonalAdvice}</p>
            {!seasonalData.canPlantNow && (
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'sw' ? 'Wakati Bora' : 'Best Time'}: {seasonalData.optimalMonths.join(', ')}
              </p>
            )}
          </div>
        )}

        {/* Success Probability */}
        {successData && (
          <div className="bg-muted p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold">
                {language === 'sw' ? 'Uwezekano wa Mafanikio' : 'Success Probability'}:
              </p>
              <p className={`text-lg font-bold ${getSuccessColor(successData.rating)}`}>
                {successData.probability}%
              </p>
            </div>
            {successData.riskFactors.length > 0 && (
              <div className="space-y-1">
                {successData.riskFactors.map((factor, idx) => (
                  <p key={idx} className="text-xs text-muted-foreground">• {factor}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
