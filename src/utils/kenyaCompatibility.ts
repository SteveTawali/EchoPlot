import type { KenyanTreeSpecies } from "@/data/kenya";

interface KenyanUserProfile {
  county: string | null;
  agro_zone: string | null;
  conservation_goals: string[] | null;
  latitude?: number | null;
  longitude?: number | null;
}

interface WeatherData {
  current: {
    temperature: number;
    humidity: number;
  };
  estimated_annual_rainfall: number;
}

export interface SeasonalRecommendation {
  canPlantNow: boolean;
  optimalMonths: string[];
  currentSeasonRating: 'optimal' | 'acceptable' | 'poor';
  nextOptimalDate: string;
  seasonalAdvice: string;
}

export interface SuccessProbability {
  probability: number;
  rating: 'very-high' | 'high' | 'moderate' | 'low';
  factors: {
    location: number;
    agroZone: number;
    season: number;
    weather: number;
  };
  riskFactors: string[];
}

/**
 * Calculate compatibility for Kenyan trees based on county and agro-ecological zone
 */
export const calculateKenyanCompatibility = (
  tree: KenyanTreeSpecies,
  profile: KenyanUserProfile
): number => {
  let score = 0;
  let maxScore = 0;

  // County compatibility (40 points) - most important for Kenya
  maxScore += 40;
  if (profile.county && tree.suitableCounties.includes(profile.county)) {
    score += 40;
  } else if (profile.county) {
    // More lenient: give partial credit for nearby regions
    score += 20;
  }

  // Agro-ecological zone compatibility (35 points)
  maxScore += 35;
  if (profile.agro_zone && tree.agroZones.includes(profile.agro_zone)) {
    score += 35;
  } else if (profile.agro_zone) {
    // Partial credit for similar zones
    const userZoneType = profile.agro_zone.slice(0, 2);
    const hasMatchingType = tree.agroZones.some(zone => zone.startsWith(userZoneType));
    if (hasMatchingType) {
      score += 20;
    } else {
      score += 10;
    }
  }

  // Conservation goals alignment (25 points)
  maxScore += 25;
  if (profile.conservation_goals && profile.conservation_goals.length > 0) {
    const matchingGoals = tree.uses.filter((use) =>
      profile.conservation_goals!.includes(use)
    );
    const goalScore = (matchingGoals.length / Math.min(profile.conservation_goals.length, tree.uses.length)) * 25;
    score += Math.floor(goalScore);
  }

  const percentage = Math.round((score / maxScore) * 100);
  console.log(`🌳 ${tree.englishName}: ${percentage}% (county: ${profile.county}, zone: ${profile.agro_zone})`);
  return Math.max(0, Math.min(100, percentage));
};

/**
 * Enhanced compatibility with weather data
 */
export const calculateKenyanCompatibilityWithWeather = (
  tree: KenyanTreeSpecies,
  profile: KenyanUserProfile,
  weatherData?: WeatherData
): number => {
  let score = calculateKenyanCompatibility(tree, profile);

  if (weatherData && profile.latitude && profile.longitude) {
    const tempScore = calculateTemperatureMatchKenya(tree, weatherData.current.temperature);
    const rainfallScore = calculateRainfallMatchKenya(tree, weatherData.estimated_annual_rainfall);
    
    const locationBonus = Math.round((tempScore + rainfallScore) / 2);
    score = Math.min(100, score + locationBonus);
  }

  return score;
};

const calculateTemperatureMatchKenya = (tree: KenyanTreeSpecies, temperature: number): number => {
  // Kenya temperature ranges based on agro-zones
  const tempRanges: Record<string, { min: number; max: number }> = {
    'UH': { min: 8, max: 18 },   // Upper Highland
    'LH': { min: 12, max: 22 },  // Lower Highland
    'UM': { min: 15, max: 25 },  // Upper Midland
    'LM': { min: 18, max: 28 },  // Lower Midland
    'IL': { min: 20, max: 32 },  // Inland Lowland
    'CL': { min: 24, max: 32 },  // Coastal Lowland
  };

  for (const zone of tree.agroZones) {
    const zoneType = zone.slice(0, 2);
    const range = tempRanges[zoneType];
    if (range && temperature >= range.min && temperature <= range.max) {
      return 5;
    }
  }

  return 2;
};

const calculateRainfallMatchKenya = (tree: KenyanTreeSpecies, annualRainfall: number): number => {
  // Kenya rainfall patterns by agro-zone
  const rainfallRanges: Record<string, { min: number; max: number }> = {
    'UH': { min: 1200, max: 2400 },
    'LH': { min: 1000, max: 1800 },
    'UM': { min: 900, max: 1400 },
    'LM': { min: 600, max: 1200 },
    'IL': { min: 300, max: 800 },
    'CL': { min: 800, max: 1500 },
  };

  for (const zone of tree.agroZones) {
    const zoneType = zone.slice(0, 2);
    const range = rainfallRanges[zoneType];
    if (range && annualRainfall >= range.min && annualRainfall <= range.max) {
      return 5;
    }
  }

  return 1;
};

/**
 * Get seasonal planting recommendation for Kenya
 */
export const getKenyanSeasonalRecommendation = (
  tree: KenyanTreeSpecies,
  profile: KenyanUserProfile,
  weatherData?: WeatherData
): SeasonalRecommendation => {
  const currentMonth = new Date().getMonth();
  
  // Kenya has two main planting seasons:
  // Long rains: March-May (months 2-4)
  // Short rains: October-November (months 9-10)
  const longRainsMonths = [2, 3, 4]; // March, April, May
  const shortRainsMonths = [9, 10];  // October, November
  
  const optimalMonths = [...longRainsMonths, ...shortRainsMonths];
  const canPlantNow = optimalMonths.includes(currentMonth);
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  
  const optimalMonthNames = optimalMonths.map(m => monthNames[m]);
  
  let currentSeasonRating: 'optimal' | 'acceptable' | 'poor' = 'poor';
  let seasonalAdvice = '';
  
  if (canPlantNow) {
    currentSeasonRating = 'optimal';
    const season = longRainsMonths.includes(currentMonth) ? 'long rains' : 'short rains';
    seasonalAdvice = `Perfect time! ${tree.swahiliName} (${tree.englishName}) thrives when planted during ${season}.`;
  } else {
    const nextOptimalMonth = optimalMonths.find(m => m > currentMonth) || optimalMonths[0];
    const monthsUntilOptimal = nextOptimalMonth > currentMonth 
      ? nextOptimalMonth - currentMonth 
      : (12 - currentMonth) + nextOptimalMonth;
    
    if (monthsUntilOptimal <= 2) {
      currentSeasonRating = 'acceptable';
      seasonalAdvice = `Wait ${monthsUntilOptimal} month${monthsUntilOptimal > 1 ? 's' : ''} for optimal planting. Prepare your site now.`;
    } else {
      currentSeasonRating = 'poor';
      const nextSeason = nextOptimalMonth <= 4 ? 'long rains' : 'short rains';
      seasonalAdvice = `Wait for ${monthNames[nextOptimalMonth]} (${nextSeason}). Use this time for site preparation and soil testing.`;
    }
  }
  
  const nextOptimal = optimalMonths.find(m => m > currentMonth) || optimalMonths[0];
  const nextOptimalDate = `${monthNames[nextOptimal]} 1, ${new Date().getFullYear() + (nextOptimal <= currentMonth ? 1 : 0)}`;
  
  return {
    canPlantNow,
    optimalMonths: optimalMonthNames,
    currentSeasonRating,
    nextOptimalDate,
    seasonalAdvice,
  };
};

/**
 * Calculate success probability for Kenyan context
 */
export const calculateKenyanSuccessProbability = (
  tree: KenyanTreeSpecies,
  profile: KenyanUserProfile,
  weatherData?: WeatherData
): SuccessProbability => {
  const factors = {
    location: 0,
    agroZone: 0,
    season: 0,
    weather: 0,
  };
  
  const riskFactors: string[] = [];
  
  // County/location factor (0-100)
  if (profile.county && tree.suitableCounties.includes(profile.county)) {
    factors.location = 100;
  } else if (profile.county) {
    factors.location = 40;
    riskFactors.push(`${tree.englishName} is best suited for: ${tree.suitableCounties.slice(0, 3).join(', ')}`);
  }
  
  // Agro-zone factor (0-100)
  if (profile.agro_zone && tree.agroZones.includes(profile.agro_zone)) {
    factors.agroZone = 100;
  } else if (profile.agro_zone) {
    factors.agroZone = 50;
    riskFactors.push(`Optimal agro-zones: ${tree.agroZones.join(', ')}`);
  }
  
  // Season factor (0-100)
  const seasonal = getKenyanSeasonalRecommendation(tree, profile, weatherData);
  if (seasonal.currentSeasonRating === 'optimal') {
    factors.season = 100;
  } else if (seasonal.currentSeasonRating === 'acceptable') {
    factors.season = 70;
  } else {
    factors.season = 30;
    riskFactors.push(`Best planting: ${seasonal.optimalMonths.join(', ')}`);
  }
  
  // Weather factor (0-100)
  if (weatherData && profile.latitude) {
    const tempScore = calculateTemperatureMatchKenya(tree, weatherData.current.temperature) * 20;
    const rainfallScore = calculateRainfallMatchKenya(tree, weatherData.estimated_annual_rainfall) * 20;
    factors.weather = tempScore + rainfallScore;
    
    if (factors.weather < 60) {
      riskFactors.push(`Current weather conditions are less than ideal for this species`);
    }
  } else {
    factors.weather = 70;
  }
  
  // Calculate overall probability with Kenya-specific weighting
  const probability = Math.round(
    (factors.location * 0.35 + factors.agroZone * 0.30 + factors.season * 0.20 + factors.weather * 0.15)
  );
  
  let rating: SuccessProbability['rating'];
  if (probability >= 85) rating = 'very-high';
  else if (probability >= 70) rating = 'high';
  else if (probability >= 50) rating = 'moderate';
  else rating = 'low';
  
  return {
    probability,
    rating,
    factors,
    riskFactors,
  };
};

/**
 * Get color class for compatibility score
 */
export const getCompatibilityColor = (score: number): string => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-orange-600";
};

/**
 * Get compatibility label
 */
export const getCompatibilityLabel = (score: number): string => {
  if (score >= 90) return "Perfect Match";
  if (score >= 80) return "Excellent Match";
  if (score >= 70) return "Great Match";
  if (score >= 60) return "Good Match";
  if (score >= 50) return "Fair Match";
  return "Poor Match";
};
