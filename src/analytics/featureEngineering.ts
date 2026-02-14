/**
 * Feature Engineering for Game Success Prediction
 * Extracts features from SteamSpy data for ML model
 */

import { GameFeatures, SteamSpyAppDetails } from '@/types/steam';
import { parseOwnersMidpoint, getTopTags } from '@/services/steamspy';

/**
 * Calculate days since or until release
 */
function calculateDaysSinceRelease(releaseDate?: string): number | undefined {
  if (!releaseDate) return undefined;

  try {
    const release = new Date(releaseDate);
    const now = new Date();
    const diffMs = now.getTime() - release.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch {
    return undefined;
  }
}

/**
 * Parse price from cents string to dollars
 */
function parsePrice(priceString?: string): number {
  if (!priceString) return 0;
  try {
    const cents = parseInt(priceString, 10);
    return cents / 100;
  } catch {
    return 0;
  }
}

/**
 * Check if game has Early Access tag
 */
function isEarlyAccess(tags?: Record<string, number>): boolean {
  if (!tags) return false;
  return Object.keys(tags).some((tag) => tag.toLowerCase().includes('early access'));
}

/**
 * Extract primary genre
 */
function getPrimaryGenre(genreString?: string): string {
  if (!genreString) return 'Unknown';
  // Genre string is usually comma-separated
  const genres = genreString.split(',').map((g) => g.trim());
  return genres[0] || 'Unknown';
}

/**
 * Build GameFeatures object from SteamSpy data
 */
export function buildGameFeatures(
  steamSpyData: SteamSpyAppDetails,
  additionalData?: {
    comingSoon?: boolean;
    releaseDate?: string;
  }
): GameFeatures {
  const ownersMidpoint = parseOwnersMidpoint(steamSpyData.owners);
  const price = parsePrice(steamSpyData.price);
  const initialPrice = parsePrice(steamSpyData.initialprice);
  const discount = parseFloat(steamSpyData.discount || '0');

  const averageForever = steamSpyData.average_forever || 0;
  const average2weeks = steamSpyData.average_2weeks || 0;
  const median2weeks = steamSpyData.median_2weeks || 0;
  const medianForever = steamSpyData.median_forever || 0;

  // Engagement metrics
  const playtimePerOwner = ownersMidpoint > 0 ? averageForever / ownersMidpoint : 0;
  const momentumRatio = averageForever > 0 ? average2weeks / averageForever : 0;
  const discountIntensity =
    initialPrice > 0 ? discount * (1 - price / initialPrice) : 0;

  // Temporal features
  const daysSinceRelease = additionalData?.releaseDate
    ? calculateDaysSinceRelease(additionalData.releaseDate)
    : undefined;

  const isComingSoonFlag = additionalData?.comingSoon ?? false;
  const isEarlyAccessFlag = isEarlyAccess(steamSpyData.tags);

  // Reviews
  const positive = steamSpyData.positive || 0;
  const negative = steamSpyData.negative || 0;
  const totalReviews = positive + negative;
  const reviewScore = totalReviews > 0 ? positive / totalReviews : 0;

  const features: GameFeatures = {
    appid: steamSpyData.appid,
    name: steamSpyData.name,
    ownersMidpoint,
    ccu: steamSpyData.ccu || 0,
    average2weeks,
    median2weeks,
    averageForever,
    medianForever,
    price,
    initialPrice,
    discount,

    // Temporal
    daysSinceRelease: !isComingSoonFlag ? daysSinceRelease : undefined,
    daysUntilRelease: isComingSoonFlag ? -(daysSinceRelease || 0) : undefined,
    isEarlyAccess: isEarlyAccessFlag,
    isComingSoon: isComingSoonFlag,

    // Engagement
    playtimePerOwner,
    momentumRatio,
    discountIntensity,

    // Categorical
    topTags: getTopTags(steamSpyData.tags, 5),
    primaryGenre: getPrimaryGenre(steamSpyData.genre),
    scoreRank: steamSpyData.score_rank || 'N/A',

    // Sentiment
    positiveReviews: positive,
    negativeReviews: negative,
    reviewScore,
  };

  return features;
}

/**
 * Normalize feature value to 0-1 range for scoring
 */
export function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0.5;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

/**
 * Calculate z-score for a value
 */
export function zScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}
