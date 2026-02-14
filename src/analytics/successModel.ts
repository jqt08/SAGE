/**
 * Game Success Prediction Model
 * 
 * This is a PLACEHOLDER using a weighted z-score index.
 * Replace with your trained ensemble model later.
 * 
 * The model should output:
 * - Success score (0-100)
 * - Feature importance/weights
 * - Confidence intervals
 * - Category classification
 */

import { GameFeatures, PredictionResult } from '@/types/steam';
import { zScore, normalize } from './featureEngineering';

/**
 * Benchmark statistics (from historical Steam data analysis)
 * These are rough estimates - replace with actual distributions from your dataset
 */
const BENCHMARKS = {
  owners: { mean: 500000, stdDev: 2000000 },
  ccu: { mean: 100, stdDev: 1000 },
  average2weeks: { mean: 120, stdDev: 300 },
  reviewScore: { mean: 0.75, stdDev: 0.15 },
  price: { mean: 15, stdDev: 10 },
  playtimePerOwner: { mean: 0.0001, stdDev: 0.0005 },
  momentumRatio: { mean: 0.3, stdDev: 0.2 },
};

/**
 * Feature weights for success prediction
 * Adjust these based on your ML model's learned weights
 */
const WEIGHTS = {
  owners: 0.25,
  ccu: 0.15,
  average2weeks: 0.12,
  reviewScore: 0.18,
  momentumRatio: 0.10,
  playtimePerOwner: 0.08,
  daysSinceRelease: 0.07,
  price: 0.05,
};

/**
 * Calculate success score using weighted z-scores
 * This is a simple placeholder - replace with your actual model
 */
function calculateScore(features: GameFeatures): number {
  const scores: Record<string, number> = {};

  // Owners (higher is better)
  scores.owners =
    zScore(features.ownersMidpoint, BENCHMARKS.owners.mean, BENCHMARKS.owners.stdDev) *
    WEIGHTS.owners;

  // CCU (higher is better)
  scores.ccu =
    zScore(features.ccu, BENCHMARKS.ccu.mean, BENCHMARKS.ccu.stdDev) * WEIGHTS.ccu;

  // Average playtime 2 weeks (higher is better)
  scores.average2weeks =
    zScore(
      features.average2weeks,
      BENCHMARKS.average2weeks.mean,
      BENCHMARKS.average2weeks.stdDev
    ) * WEIGHTS.average2weeks;

  // Review score (higher is better)
  scores.reviewScore =
    zScore(
      features.reviewScore,
      BENCHMARKS.reviewScore.mean,
      BENCHMARKS.reviewScore.stdDev
    ) * WEIGHTS.reviewScore;

  // Momentum ratio (higher is better)
  scores.momentumRatio =
    zScore(
      features.momentumRatio,
      BENCHMARKS.momentumRatio.mean,
      BENCHMARKS.momentumRatio.stdDev
    ) * WEIGHTS.momentumRatio;

  // Playtime per owner (higher is better)
  scores.playtimePerOwner =
    zScore(
      features.playtimePerOwner,
      BENCHMARKS.playtimePerOwner.mean,
      BENCHMARKS.playtimePerOwner.stdDev
    ) * WEIGHTS.playtimePerOwner;

  // Days since release (bonus for established games, penalty for too old)
  if (features.daysSinceRelease !== undefined) {
    // Optimal is 30-365 days
    const dayScore = normalize(features.daysSinceRelease, 0, 365) - 0.5;
    scores.daysSinceRelease = dayScore * WEIGHTS.daysSinceRelease;
  }

  // Price (lower is sometimes better, but not always)
  const priceScore = normalize(50 - features.price, 0, 50);
  scores.price = (priceScore - 0.5) * WEIGHTS.price;

  // Sum all scores
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

  // Convert to 0-100 scale (z-scores typically range -3 to +3)
  // Normalize using sigmoid-like transformation
  const normalized = 50 + totalScore * 10;
  return Math.max(0, Math.min(100, normalized));
}

/**
 * Calculate confidence intervals (placeholder)
 * Replace with actual confidence from your model
 */
function calculateConfidence(score: number): { lower: number; upper: number } {
  // Simple heuristic: confidence decreases at extremes
  const variance = Math.abs(score - 50) / 50;
  const confidenceWidth = 5 + variance * 10;

  return {
    lower: Math.max(0, score - confidenceWidth),
    upper: Math.min(100, score + confidenceWidth),
  };
}

/**
 * Calculate feature importance
 */
function calculateFactors(
  features: GameFeatures,
  score: number
): PredictionResult['factors'] {
  const factors: PredictionResult['factors'] = [];

  // Owners impact
  const ownersImpact =
    features.ownersMidpoint > BENCHMARKS.owners.mean ? 'positive' : 'negative';
  factors.push({
    name: 'Player Base',
    weight: WEIGHTS.owners,
    impact: ownersImpact,
  });

  // Review score impact
  const reviewImpact =
    features.reviewScore > BENCHMARKS.reviewScore.mean ? 'positive' : 'negative';
  factors.push({
    name: 'Review Score',
    weight: WEIGHTS.reviewScore,
    impact: reviewImpact,
  });

  // CCU impact
  const ccuImpact = features.ccu > BENCHMARKS.ccu.mean ? 'positive' : 'negative';
  factors.push({
    name: 'Active Players',
    weight: WEIGHTS.ccu,
    impact: ccuImpact,
  });

  // Momentum impact
  const momentumImpact =
    features.momentumRatio > BENCHMARKS.momentumRatio.mean ? 'positive' : 'negative';
  factors.push({
    name: 'Recent Momentum',
    weight: WEIGHTS.momentumRatio,
    impact: momentumImpact,
  });

  // Engagement impact
  const engagementImpact =
    features.average2weeks > BENCHMARKS.average2weeks.mean ? 'positive' : 'negative';
  factors.push({
    name: 'Player Engagement',
    weight: WEIGHTS.average2weeks,
    impact: engagementImpact,
  });

  // Sort by weight
  return factors.sort((a, b) => b.weight - a.weight);
}

/**
 * Categorize score
 */
function categorizeScore(score: number): PredictionResult['category'] {
  if (score >= 75) return 'Very High';
  if (score >= 60) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}

/**
 * Generate insights based on features
 */
function generateInsights(features: GameFeatures, score: number): string[] {
  const insights: string[] = [];

  // Player base insight
  if (features.ownersMidpoint > 1000000) {
    insights.push(`Strong player base with ${(features.ownersMidpoint / 1000000).toFixed(1)}M+ owners`);
  } else if (features.ownersMidpoint < 10000) {
    insights.push('Small player base - needs more visibility');
  }

  // Review insight
  if (features.reviewScore > 0.8) {
    insights.push('Excellent reviews indicate strong player satisfaction');
  } else if (features.reviewScore < 0.6) {
    insights.push('Mixed reviews may impact growth potential');
  }

  // Momentum insight
  if (features.momentumRatio > 0.5) {
    insights.push('Strong recent activity - game is trending upward');
  } else if (features.momentumRatio < 0.1) {
    insights.push('Declining activity - may need updates or marketing');
  }

  // Early Access insight
  if (features.isEarlyAccess) {
    insights.push('Early Access game - metrics may improve after full release');
  }

  // Coming Soon insight
  if (features.isComingSoon) {
    insights.push('Unreleased game - prediction based on wishlist data and similar titles');
  }

  // Price insight
  if (features.discount > 50) {
    insights.push('Heavy discounting may indicate need for sales boost');
  }

  return insights.slice(0, 5); // Return top 5 insights
}

/**
 * Main prediction function
 * 
 * @param features - Engineered game features
 * @returns Prediction result with score, factors, and insights
 * 
 * TODO: Replace this placeholder with your trained ensemble model
 * The ensemble should include:
 * - Random Forest for feature importance
 * - Gradient Boosting for accurate predictions
 * - Neural Network for complex patterns
 * - Ensemble voting/stacking for final score
 */
export function predictSuccess(features: GameFeatures): PredictionResult {
  // Calculate success score
  const score = calculateScore(features);

  // Calculate confidence intervals
  const confidence = calculateConfidence(score);

  // Calculate feature importance
  const factors = calculateFactors(features, score);

  // Categorize
  const category = categorizeScore(score);

  // Generate insights
  const insights = generateInsights(features, score);

  return {
    score,
    confidence,
    factors,
    category,
    insights,
  };
}

/**
 * Export function for CSV/JSON export
 */
export function exportFeatures(
  features: GameFeatures,
  prediction: PredictionResult
): Record<string, unknown> {
  return {
    ...features,
    prediction_score: prediction.score,
    prediction_category: prediction.category,
    confidence_lower: prediction.confidence.lower,
    confidence_upper: prediction.confidence.upper,
    top_factors: prediction.factors.slice(0, 5).map((f) => f.name),
  };
}
