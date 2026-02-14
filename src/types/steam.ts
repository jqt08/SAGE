import { z } from 'zod';

/**
 * SteamSpy API Response Schemas with Zod validation
 */

// SteamSpy App Details Response
export const SteamSpyAppDetailsSchema = z.object({
  appid: z.number(),
  name: z.string(),
  developer: z.string().optional(),
  publisher: z.string().optional(),
  score_rank: z.string().optional(),
  owners: z.string(), // Format: "20,000 .. 50,000"
  average_forever: z.number().optional(), // Average playtime forever
  average_2weeks: z.number().optional(), // Average playtime last 2 weeks
  median_forever: z.number().optional(),
  median_2weeks: z.number().optional(),
  ccu: z.number().optional(), // Current concurrent users (peak yesterday)
  price: z.string().optional(), // Price in cents as string
  initialprice: z.string().optional(),
  discount: z.string().optional(), // Discount percentage
  languages: z.string().optional(),
  genre: z.string().optional(),
  tags: z.record(z.number()).optional(), // Tag name -> count
  positive: z.number().optional(),
  negative: z.number().optional(),
  userscore: z.number().optional(),
  metacritic_score: z.number().optional().nullable(),
});

export type SteamSpyAppDetails = z.infer<typeof SteamSpyAppDetailsSchema>;

// SteamSpy Tag/Genre List Response
export const SteamSpyListItemSchema = z.object({
  appid: z.number(),
  name: z.string(),
  owners: z.string().optional(),
  ccu: z.number().optional(),
  score_rank: z.string().optional(),
});

export const SteamSpyListResponseSchema = z.record(SteamSpyListItemSchema);

export type SteamSpyListItem = z.infer<typeof SteamSpyListItemSchema>;
export type SteamSpyListResponse = z.infer<typeof SteamSpyListResponseSchema>;

// Steam Store App Details (minimal - only for Coming Soon detection)
export const SteamStoreAppDetailsSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      type: z.string().optional(),
      name: z.string().optional(),
      steam_appid: z.number().optional(),
      is_free: z.boolean().optional(),
      release_date: z.object({
        coming_soon: z.boolean(),
        date: z.string(),
      }),
      price_overview: z
        .object({
          currency: z.string(),
          initial: z.number(),
          final: z.number(),
          discount_percent: z.number(),
        })
        .optional(),
    })
    .optional(),
});

export type SteamStoreAppDetails = z.infer<typeof SteamStoreAppDetailsSchema>;

/**
 * Game Features for ML Model
 */
export interface GameFeatures {
  // Core metrics
  appid: number;
  name: string;
  ownersMidpoint: number; // Calculated midpoint from owners range
  ccu: number;
  average2weeks: number;
  median2weeks: number;
  averageForever: number;
  medianForever: number;
  price: number; // In dollars
  initialPrice: number;
  discount: number; // Percentage

  // Temporal features
  daysSinceRelease?: number; // Positive for released
  daysUntilRelease?: number; // Negative for coming soon
  isEarlyAccess: boolean;
  isComingSoon: boolean;

  // Engagement features
  playtimePerOwner: number; // average_forever / owners
  momentumRatio: number; // average_2weeks / average_forever
  discountIntensity: number; // discount * (1 - price/initialprice)

  // Categorical features
  topTags: string[]; // Top 5 tags
  primaryGenre: string;
  scoreRank: string;

  // Sentiment
  positiveReviews: number;
  negativeReviews: number;
  reviewScore: number; // positive / (positive + negative)
}

/**
 * Prediction Result
 */
export interface PredictionResult {
  score: number; // 0-100 success score
  confidence: {
    lower: number;
    upper: number;
  };
  factors: Array<{
    name: string;
    weight: number;
    impact: 'positive' | 'negative' | 'neutral';
  }>;
  category: 'Low' | 'Medium' | 'High' | 'Very High';
  insights: string[];
}

/**
 * Search result item for UI
 */
export interface SearchResult {
  appid: number;
  name: string;
  releaseStatus: 'released' | 'early_access' | 'coming_soon';
  releaseDate?: string;
  price?: number;
  owners?: string;
  ccu?: number;
  average2weeks?: number;
  scoreRank?: string;
  tags?: string[];
  genre?: string;
}

/**
 * Search filters
 */
export type SearchMode = 'released' | 'early_access' | 'coming_soon';

export interface SearchFilters {
  mode: SearchMode;
  query?: string;
  genre?: string;
  minOwners?: number;
  maxPrice?: number;
}
