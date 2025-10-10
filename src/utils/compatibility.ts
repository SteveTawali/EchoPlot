import type { Tree } from "@/data/trees";

interface UserProfile {
  soil_type: string | null;
  climate_zone: string | null;
  land_size_hectares: number | null;
  conservation_goals: string[] | null;
}

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
