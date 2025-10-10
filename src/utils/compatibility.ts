import type { Tree } from "@/data/trees";

interface UserProfile {
  soil_type: string | null;
  climate_zone: string | null;
  land_size_hectares: number | null;
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

/**
 * Enhanced compatibility calculation with location-based factors
 */
export const calculateCompatibilityWithWeather = (
  tree: Tree,
  profile: UserProfile,
  weatherData?: WeatherData
): number => {
  let score = calculateCompatibility(tree, profile);

  // Bonus points for location-based optimization (up to 15 points)
  if (weatherData && profile.latitude && profile.longitude) {
    const tempScore = calculateTemperatureMatch(tree, weatherData.current.temperature);
    const humidityScore = calculateHumidityMatch(tree, weatherData.current.humidity);
    const rainfallScore = calculateRainfallMatch(tree, weatherData.estimated_annual_rainfall);
    
    const locationBonus = Math.round((tempScore + humidityScore + rainfallScore) / 3);
    score = Math.min(100, score + locationBonus);
  }

  return score;
};

/**
 * Calculate temperature compatibility
 */
const calculateTemperatureMatch = (tree: Tree, temperature: number): number => {
  // Optimal temperature ranges for different growth rates
  const tempRanges: Record<string, { min: number; max: number }> = {
    fast: { min: 15, max: 30 },
    moderate: { min: 10, max: 25 },
    slow: { min: 5, max: 20 },
  };

  const range = tempRanges[tree.growthRate.toLowerCase()] || tempRanges.moderate;
  
  if (temperature >= range.min && temperature <= range.max) {
    return 5; // Perfect temperature
  } else if (temperature >= range.min - 5 && temperature <= range.max + 5) {
    return 3; // Acceptable temperature
  }
  
  return 0;
};

/**
 * Calculate humidity compatibility
 */
const calculateHumidityMatch = (tree: Tree, humidity: number): number => {
  // Different trees prefer different humidity levels
  const soilHumidityPreference: Record<string, number> = {
    peaty: 80, // High humidity
    clay: 70,
    loamy: 60,
    silty: 60,
    sandy: 40, // Low humidity
    chalky: 45,
  };

  const preferredHumidity = tree.requirements.preferredSoils
    .map(soil => soilHumidityPreference[soil])
    .reduce((a, b) => (a + b) / 2, 60);

  const diff = Math.abs(humidity - preferredHumidity);
  
  if (diff < 10) return 5;
  if (diff < 20) return 3;
  if (diff < 30) return 1;
  
  return 0;
};

/**
 * Calculate rainfall compatibility
 */
const calculateRainfallMatch = (tree: Tree, annualRainfall: number): number => {
  // Rainfall requirements based on climate zones
  const rainfallRanges: Record<string, { min: number; max: number }> = {
    tropical: { min: 1500, max: 4000 },
    subtropical: { min: 1000, max: 2000 },
    temperate: { min: 600, max: 1500 },
    mediterranean: { min: 400, max: 900 },
    cold: { min: 300, max: 800 },
    arid: { min: 100, max: 400 },
  };

  const climateZones = tree.requirements.suitableClimates;
  
  for (const zone of climateZones) {
    const range = rainfallRanges[zone];
    if (range && annualRainfall >= range.min && annualRainfall <= range.max) {
      return 5; // Perfect rainfall for this climate
    }
  }

  // Partial credit if close to any suitable range
  for (const zone of climateZones) {
    const range = rainfallRanges[zone];
    if (range && annualRainfall >= range.min * 0.7 && annualRainfall <= range.max * 1.3) {
      return 2;
    }
  }
  
  return 0;
};

/**
 * Calculate compatibility score between user profile and tree species
 * Score ranges from 0-100
 */
export const calculateCompatibility = (
  tree: Tree,
  profile: UserProfile
): number => {
  let score = 0;
  let maxScore = 0;

  // Soil type compatibility (25 points)
  maxScore += 25;
  if (profile.soil_type && tree.requirements.preferredSoils.includes(profile.soil_type as any)) {
    score += 25;
  } else if (profile.soil_type) {
    score += 10; // Partial credit for having soil type
  }

  // Climate compatibility (30 points)
  maxScore += 30;
  if (profile.climate_zone && tree.requirements.suitableClimates.includes(profile.climate_zone as any)) {
    score += 30;
  } else if (profile.climate_zone) {
    score += 10; // Partial credit
  }

  // Land size compatibility (20 points)
  maxScore += 20;
  if (profile.land_size_hectares !== null) {
    if (profile.land_size_hectares >= tree.requirements.minLandSize) {
      score += 20;
    } else {
      // Partial credit based on how close
      const ratio = profile.land_size_hectares / tree.requirements.minLandSize;
      score += Math.floor(ratio * 20);
    }
  }

  // Conservation goals alignment (25 points)
  maxScore += 25;
  if (profile.conservation_goals && profile.conservation_goals.length > 0) {
    const matchingGoals = tree.requirements.conservationBenefits.filter((benefit) =>
      profile.conservation_goals!.includes(benefit)
    );
    const goalScore = (matchingGoals.length / profile.conservation_goals.length) * 25;
    score += Math.floor(goalScore);
  }

  // Calculate percentage
  const percentage = Math.round((score / maxScore) * 100);
  return Math.max(0, Math.min(100, percentage)); // Clamp between 0-100
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
