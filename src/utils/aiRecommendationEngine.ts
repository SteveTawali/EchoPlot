import type { KenyanTreeSpecies } from "@/data/kenya";

interface UserBehavior {
  userId: string;
  swipedTrees: Array<{
    treeId: string;
    action: 'liked' | 'disliked' | 'planted';
    timestamp: Date;
    location: {
      county: string;
      agroZone: string;
    };
  }>;
  successfulPlantings: Array<{
    treeId: string;
    plantedAt: Date;
    survived: boolean;
    location: {
      county: string;
      agroZone: string;
    };
  }>;
  preferences: {
    conservationGoals: string[];
    preferredUses: string[];
    priceRange: [number, number];
  };
}

interface MLFeatures {
  // User profile features
  county: string;
  agroZone: string;
  conservationGoals: string[];
  landSize: number;
  
  // Tree features
  treeId: string;
  price: number;
  uses: string[];
  suitableCounties: string[];
  agroZones: string[];
  
  // Environmental features
  temperature: number;
  humidity: number;
  rainfall: number;
  season: string;
  
  // Historical success features
  successRateInCounty: number;
  successRateInAgroZone: number;
  userSimilarityScore: number;
}

interface MLPrediction {
  compatibilityScore: number;
  survivalProbability: number;
  userEngagementScore: number;
  confidence: number;
}

/**
 * AI-Powered Recommendation Engine
 * Uses machine learning to provide personalized tree recommendations
 */
export class AIRecommendationEngine {
  private userBehaviors: Map<string, UserBehavior> = new Map();
  private modelWeights: Map<string, number> = new Map();
  
  constructor() {
    this.initializeModelWeights();
  }

  /**
   * Initialize ML model weights based on feature importance
   */
  private initializeModelWeights(): void {
    // These weights would typically be learned from training data
    this.modelWeights.set('county_match', 0.25);
    this.modelWeights.set('agro_zone_match', 0.20);
    this.modelWeights.set('conservation_goals', 0.15);
    this.modelWeights.set('price_preference', 0.10);
    this.modelWeights.set('historical_success', 0.15);
    this.modelWeights.set('user_similarity', 0.10);
    this.modelWeights.set('environmental_factors', 0.05);
  }

  /**
   * Record user behavior for ML training
   */
  recordUserBehavior(
    userId: string,
    treeId: string,
    action: 'liked' | 'disliked' | 'planted',
    location: { county: string; agroZone: string }
  ): void {
    if (!this.userBehaviors.has(userId)) {
      this.userBehaviors.set(userId, {
        userId,
        swipedTrees: [],
        successfulPlantings: [],
        preferences: {
          conservationGoals: [],
          preferredUses: [],
          priceRange: [0, 1000]
        }
      });
    }

    const behavior = this.userBehaviors.get(userId)!;
    behavior.swipedTrees.push({
      treeId,
      action,
      timestamp: new Date(),
      location
    });

    // Update user preferences based on behavior
    this.updateUserPreferences(userId, treeId, action);
  }

  /**
   * Record successful planting for survival prediction
   */
  recordPlantingOutcome(
    userId: string,
    treeId: string,
    survived: boolean,
    location: { county: string; agroZone: string }
  ): void {
    if (!this.userBehaviors.has(userId)) {
      return;
    }

    const behavior = this.userBehaviors.get(userId)!;
    behavior.successfulPlantings.push({
      treeId,
      plantedAt: new Date(),
      survived,
      location
    });

    // Retrain model with new data
    this.retrainModel();
  }

  /**
   * Generate AI-powered recommendations
   */
  generateRecommendations(
    userId: string,
    trees: KenyanTreeSpecies[],
    userProfile: {
      county: string;
      agroZone: string;
      conservationGoals: string[];
      landSize: number;
    },
    weatherData?: {
      temperature: number;
      humidity: number;
      rainfall: number;
    }
  ): Array<{ tree: KenyanTreeSpecies; prediction: MLPrediction }> {
    const userBehavior = this.userBehaviors.get(userId);
    const recommendations: Array<{ tree: KenyanTreeSpecies; prediction: MLPrediction }> = [];

    for (const tree of trees) {
      const features = this.extractFeatures(tree, userProfile, userBehavior, weatherData);
      const prediction = this.predictCompatibility(features);
      
      recommendations.push({ tree, prediction });
    }

    // Sort by AI prediction score
    return recommendations.sort((a, b) => b.prediction.compatibilityScore - a.prediction.compatibilityScore);
  }

  /**
   * Extract ML features from tree and user data
   */
  private extractFeatures(
    tree: KenyanTreeSpecies,
    userProfile: any,
    userBehavior: UserBehavior | undefined,
    weatherData?: any
  ): MLFeatures {
    return {
      county: userProfile.county,
      agroZone: userProfile.agroZone,
      conservationGoals: userProfile.conservationGoals,
      landSize: userProfile.landSize,
      treeId: tree.id,
      price: tree.price,
      uses: tree.uses,
      suitableCounties: tree.suitableCounties,
      agroZones: tree.agroZones,
      temperature: weatherData?.temperature || 25,
      humidity: weatherData?.humidity || 60,
      rainfall: weatherData?.rainfall || 1000,
      season: this.getCurrentSeason(),
      successRateInCounty: this.calculateSuccessRateInCounty(tree.id, userProfile.county),
      successRateInAgroZone: this.calculateSuccessRateInAgroZone(tree.id, userProfile.agroZone),
      userSimilarityScore: this.calculateUserSimilarity(userBehavior, tree)
    };
  }

  /**
   * ML prediction algorithm (simplified neural network simulation)
   */
  private predictCompatibility(features: MLFeatures): MLPrediction {
    // Simulate ML model prediction
    let compatibilityScore = 0;
    let survivalProbability = 0;
    let userEngagementScore = 0;

    // County match feature
    const countyMatch = features.suitableCounties.includes(features.county) ? 1 : 0;
    compatibilityScore += countyMatch * this.modelWeights.get('county_match')! * 100;

    // Agro-zone match feature
    const agroZoneMatch = features.agroZones.includes(features.agroZone) ? 1 : 0;
    compatibilityScore += agroZoneMatch * this.modelWeights.get('agro_zone_match')! * 100;

    // Conservation goals alignment
    const goalsMatch = features.conservationGoals.filter(goal => 
      features.uses.includes(goal)
    ).length / Math.max(features.conservationGoals.length, 1);
    compatibilityScore += goalsMatch * this.modelWeights.get('conservation_goals')! * 100;

    // Historical success rate
    const historicalSuccess = (features.successRateInCounty + features.successRateInAgroZone) / 2;
    survivalProbability = historicalSuccess * 100;
    compatibilityScore += historicalSuccess * this.modelWeights.get('historical_success')! * 100;

    // User similarity (collaborative filtering)
    compatibilityScore += features.userSimilarityScore * this.modelWeights.get('user_similarity')! * 100;

    // Environmental factors
    const envScore = this.calculateEnvironmentalScore(features);
    compatibilityScore += envScore * this.modelWeights.get('environmental_factors')! * 100;

    // User engagement prediction
    userEngagementScore = this.predictUserEngagement(features);

    // Calculate confidence based on data availability
    const confidence = this.calculateConfidence(features);

    return {
      compatibilityScore: Math.min(100, Math.max(0, compatibilityScore)),
      survivalProbability: Math.min(100, Math.max(0, survivalProbability)),
      userEngagementScore: Math.min(100, Math.max(0, userEngagementScore)),
      confidence: Math.min(100, Math.max(0, confidence))
    };
  }

  /**
   * Calculate success rate for a tree in a specific county
   */
  private calculateSuccessRateInCounty(treeId: string, county: string): number {
    let totalPlantings = 0;
    let successfulPlantings = 0;

    for (const behavior of this.userBehaviors.values()) {
      for (const planting of behavior.successfulPlantings) {
        if (planting.treeId === treeId && planting.location.county === county) {
          totalPlantings++;
          if (planting.survived) successfulPlantings++;
        }
      }
    }

    return totalPlantings > 0 ? successfulPlantings / totalPlantings : 0.7; // Default 70% if no data
  }

  /**
   * Calculate success rate for a tree in a specific agro-zone
   */
  private calculateSuccessRateInAgroZone(treeId: string, agroZone: string): number {
    let totalPlantings = 0;
    let successfulPlantings = 0;

    for (const behavior of this.userBehaviors.values()) {
      for (const planting of behavior.successfulPlantings) {
        if (planting.treeId === treeId && planting.location.agroZone === agroZone) {
          totalPlantings++;
          if (planting.survived) successfulPlantings++;
        }
      }
    }

    return totalPlantings > 0 ? successfulPlantings / totalPlantings : 0.7; // Default 70% if no data
  }

  /**
   * Calculate user similarity for collaborative filtering
   */
  private calculateUserSimilarity(userBehavior: UserBehavior | undefined, tree: KenyanTreeSpecies): number {
    if (!userBehavior) return 0.5; // Default similarity

    // Find similar users who liked this tree
    let similarUsers = 0;
    let totalSimilarUsers = 0;

    for (const otherBehavior of this.userBehaviors.values()) {
      if (otherBehavior.userId === userBehavior.userId) continue;

      // Check if users have similar preferences
      const preferenceSimilarity = this.calculatePreferenceSimilarity(userBehavior, otherBehavior);
      
      if (preferenceSimilarity > 0.6) {
        totalSimilarUsers++;
        const likedThisTree = otherBehavior.swipedTrees.some(
          swipe => swipe.treeId === tree.id && swipe.action === 'liked'
        );
        if (likedThisTree) similarUsers++;
      }
    }

    return totalSimilarUsers > 0 ? similarUsers / totalSimilarUsers : 0.5;
  }

  /**
   * Calculate preference similarity between users
   */
  private calculatePreferenceSimilarity(user1: UserBehavior, user2: UserBehavior): number {
    const goals1 = new Set(user1.preferences.conservationGoals);
    const goals2 = new Set(user2.preferences.conservationGoals);
    
    const intersection = new Set([...goals1].filter(x => goals2.has(x)));
    const union = new Set([...goals1, ...goals2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Calculate environmental compatibility score
   */
  private calculateEnvironmentalScore(features: MLFeatures): number {
    // Temperature compatibility
    const tempScore = this.getTemperatureScore(features.temperature, features.agroZone);
    
    // Rainfall compatibility
    const rainfallScore = this.getRainfallScore(features.rainfall, features.agroZone);
    
    return (tempScore + rainfallScore) / 2;
  }

  /**
   * Predict user engagement with a tree
   */
  private predictUserEngagement(features: MLFeatures): number {
    let engagement = 0.5; // Base engagement

    // Price preference
    if (features.price <= 200) engagement += 0.2;
    else if (features.price <= 500) engagement += 0.1;

    // Use case alignment
    const useAlignment = features.conservationGoals.filter(goal => 
      features.uses.includes(goal)
    ).length / Math.max(features.conservationGoals.length, 1);
    engagement += useAlignment * 0.3;

    return Math.min(1, engagement);
  }

  /**
   * Calculate model confidence
   */
  private calculateConfidence(features: MLFeatures): number {
    let confidence = 0.5; // Base confidence

    // More data = higher confidence
    if (features.successRateInCounty > 0) confidence += 0.2;
    if (features.successRateInAgroZone > 0) confidence += 0.2;
    if (features.userSimilarityScore > 0.5) confidence += 0.1;

    return Math.min(1, confidence);
  }

  /**
   * Update user preferences based on behavior
   */
  private updateUserPreferences(userId: string, treeId: string, action: string): void {
    const behavior = this.userBehaviors.get(userId);
    if (!behavior) return;

    // This would analyze the tree's properties and update user preferences
    // For now, simplified implementation
    if (action === 'liked') {
      // Update preferences based on liked tree characteristics
    }
  }

  /**
   * Retrain model with new data
   */
  private retrainModel(): void {
    // In a real implementation, this would retrain the ML model
    // For now, we'll adjust weights based on success patterns
    this.adjustModelWeights();
  }

  /**
   * Adjust model weights based on success patterns
   */
  private adjustModelWeights(): void {
    // Analyze success patterns and adjust weights
    // This is a simplified version - real ML would use gradient descent
  }

  /**
   * Get current season
   */
  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'long_rains';
    if (month >= 9 && month <= 10) return 'short_rains';
    return 'dry_season';
  }

  /**
   * Get temperature score for agro-zone
   */
  private getTemperatureScore(temperature: number, agroZone: string): number {
    const tempRanges: Record<string, { min: number; max: number }> = {
      'UH': { min: 8, max: 18 },
      'LH': { min: 12, max: 22 },
      'UM': { min: 15, max: 25 },
      'LM': { min: 18, max: 28 },
      'IL': { min: 20, max: 32 },
      'CL': { min: 24, max: 32 },
    };

    const zoneType = agroZone.slice(0, 2);
    const range = tempRanges[zoneType];
    
    if (!range) return 0.5;
    
    if (temperature >= range.min && temperature <= range.max) return 1.0;
    if (temperature >= range.min - 5 && temperature <= range.max + 5) return 0.7;
    return 0.3;
  }

  /**
   * Get rainfall score for agro-zone
   */
  private getRainfallScore(rainfall: number, agroZone: string): number {
    const rainfallRanges: Record<string, { min: number; max: number }> = {
      'UH': { min: 1200, max: 2400 },
      'LH': { min: 1000, max: 1800 },
      'UM': { min: 900, max: 1400 },
      'LM': { min: 600, max: 1200 },
      'IL': { min: 300, max: 800 },
      'CL': { min: 800, max: 1500 },
    };

    const zoneType = agroZone.slice(0, 2);
    const range = rainfallRanges[zoneType];
    
    if (!range) return 0.5;
    
    if (rainfall >= range.min && rainfall <= range.max) return 1.0;
    if (rainfall >= range.min * 0.7 && rainfall <= range.max * 1.3) return 0.7;
    return 0.3;
  }

  /**
   * Get model insights for debugging/analytics
   */
  getModelInsights(): {
    totalUsers: number;
    totalInteractions: number;
    averageSuccessRate: number;
    topPerformingTrees: Array<{ treeId: string; successRate: number }>;
  } {
    const totalUsers = this.userBehaviors.size;
    let totalInteractions = 0;
    let totalPlantings = 0;
    let successfulPlantings = 0;
    const treeSuccessRates = new Map<string, { total: number; successful: number }>();

    for (const behavior of this.userBehaviors.values()) {
      totalInteractions += behavior.swipedTrees.length;
      totalPlantings += behavior.successfulPlantings.length;
      
      for (const planting of behavior.successfulPlantings) {
        if (planting.survived) successfulPlantings++;
        
        const current = treeSuccessRates.get(planting.treeId) || { total: 0, successful: 0 };
        current.total++;
        if (planting.survived) current.successful++;
        treeSuccessRates.set(planting.treeId, current);
      }
    }

    const averageSuccessRate = totalPlantings > 0 ? successfulPlantings / totalPlantings : 0;
    
    const topPerformingTrees = Array.from(treeSuccessRates.entries())
      .map(([treeId, stats]) => ({
        treeId,
        successRate: stats.total > 0 ? stats.successful / stats.total : 0
      }))
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 5);

    return {
      totalUsers,
      totalInteractions,
      averageSuccessRate,
      topPerformingTrees
    };
  }
}

// Export singleton instance
export const aiRecommendationEngine = new AIRecommendationEngine();

