import { useQuery } from '@tanstack/react-query';
import { Loader2, TrendingUp, Users, Clock, DollarSign, Download } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell,
} from 'recharts';
import { SearchResult } from '@/types/steam';
import { getGameDetailsFromDb } from '@/services/supabaseGames';
import { mockGetAppDetails } from '@/services/mockSteamData';
import { buildGameFeatures } from '@/analytics/featureEngineering';
import { predictSuccess, exportFeatures } from '@/analytics/successModel';
import { toast } from 'sonner';

interface AnalysisPanelProps {
  selectedGames: SearchResult[];
  onRemoveGame: (appid: number) => void;
}

export function AnalysisPanel({ selectedGames, onRemoveGame }: AnalysisPanelProps) {
  if (selectedGames.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg">No games selected</p>
          <p className="text-sm mt-2">Search and add games to start analysis</p>
        </div>
      </div>
    );
  }

  // For now, analyze the first selected game
  // TODO: Support comparing multiple games
  const game = selectedGames[0];

  return <GameAnalysis game={game} onRemove={() => onRemoveGame(game.appid)} />;
}

function GameAnalysis({ game, onRemove }: { game: SearchResult; onRemove: () => void }) {
  // Fetch full game details from Supabase first, fallback to mock if needed
  const { data: gameDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['game-details', game.appid],
    queryFn: async () => {
      // Try Supabase first
      const supabaseDetails = await getGameDetailsFromDb(game.appid);
      if (supabaseDetails) {
        console.log(`[AnalysisPanel] ✅ Using Supabase details for ${game.name}`);
        return supabaseDetails;
      }
      
      // Fallback to mock if Supabase doesn't have it
      const mockDetails = mockGetAppDetails(game.appid);
      if (mockDetails) {
        console.log(`[AnalysisPanel] Using mock details for ${game.name}`);
        return mockDetails;
      }
      
      // Not found anywhere
      console.error(`[AnalysisPanel] ❌ No details found for appid ${game.appid}`);
      return null;
    },
  });

  if (isLoadingDetails) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 h-full flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!gameDetails) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg">Unable to analyze this game</p>
          <p className="text-sm mt-2">Game details not found in database</p>
          <button
            onClick={onRemove}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
          >
            Remove game
          </button>
        </div>
      </div>
    );
  }

  // Build features and predict
  try {
    const features = buildGameFeatures(gameDetails, {
      comingSoon: game.releaseStatus === 'coming_soon',
    });

    const prediction = predictSuccess(features);

    // Prepare chart data
    const tagsData = features.topTags.map((tag, idx) => {
      const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];
      return {
        name: tag,
        value: (gameDetails.tags?.[tag] || 0) / 1000, // Scale down for display
        fill: colors[idx % colors.length]
      };
    });

    const factorsData = prediction.factors.map((factor) => ({
      name: factor.name,
      weight: factor.weight * 100,
      impact: factor.impact,
    }));

    const handleExport = () => {
      const data = exportFeatures(features, prediction);
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${game.name.replace(/[^a-z0-9]/gi, '_')}_analysis.json`;
      a.click();
      toast.success('Analysis exported');
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 h-full overflow-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 md:mb-6 gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 truncate">{game.name}</h2>
          <p className="text-xs md:text-sm text-gray-500 mt-1">App ID: {game.appid}</p>
          <span
            className={`inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${
              game.releaseStatus === 'released'
                ? 'bg-green-100 text-green-800'
                : game.releaseStatus === 'early_access'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {game.releaseStatus === 'released'
              ? 'Released'
              : game.releaseStatus === 'early_access'
              ? 'Early Access'
              : 'Coming Soon'}
          </span>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleExport}
            className="px-3 md:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={onRemove}
            className="px-3 md:px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-sm"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Success Score */}
      <div className="mb-6 md:mb-8 p-4 md:p-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">Success Score</p>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {prediction.score.toFixed(0)}
              </span>
              <span className="text-lg md:text-xl text-gray-500">/ 100</span>
            </div>
            <p className="text-xs md:text-sm text-gray-600 mt-2">
              Confidence: {prediction.confidence.lower.toFixed(0)} -{' '}
              {prediction.confidence.upper.toFixed(0)}
            </p>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs md:text-sm font-medium mt-3 ${
                prediction.category === 'Very High'
                  ? 'bg-green-100 text-green-800'
                  : prediction.category === 'High'
                  ? 'bg-blue-100 text-blue-800'
                  : prediction.category === 'Medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {prediction.category} Potential
            </span>
          </div>
          <div className="w-48 h-48 hidden lg:block">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={factorsData.slice(0, 5)}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="name" style={{ fontSize: 10, fill: '#6b7280' }} />
                <PolarRadiusAxis angle={90} domain={[0, 30]} stroke="#9ca3af" />
                <Radar
                  name="Impact"
                  dataKey="weight"
                  stroke="#8b5cf6"
                  fill="#a78bfa"
                  fillOpacity={0.7}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-600">Owners</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {(features.ownersMidpoint / 1000000).toFixed(1)}M
          </p>
          <p className="text-xs text-gray-500 mt-1">{gameDetails.owners}</p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-600">CCU Peak</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {features.ccu.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">Yesterday</p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-600">Avg Playtime</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {(features.average2weeks / 60).toFixed(0)}h
          </p>
          <p className="text-xs text-gray-500 mt-1">Last 2 weeks</p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-600">Price</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">${features.price.toFixed(2)}</p>
          {features.discount > 0 && (
            <p className="text-xs text-red-500 mt-1">-{features.discount}% off</p>
          )}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Top Tags */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold mb-4 text-sm md:text-base">Top Tags</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={tagsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={80}
                tick={{ fill: '#6b7280', fontSize: 10 }}
              />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {tagsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Feature Contributions */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold mb-4 text-sm md:text-base">Top Success Factors</h3>
          <div className="space-y-3">
            {prediction.factors.slice(0, 5).map((factor, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">{factor.name}</span>
                  <span
                    className={`text-xs font-medium ${
                      factor.impact === 'positive'
                        ? 'text-green-600'
                        : factor.impact === 'negative'
                        ? 'text-red-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {factor.impact}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      factor.impact === 'positive'
                        ? 'bg-green-500'
                        : factor.impact === 'negative'
                        ? 'bg-red-500'
                        : 'bg-gray-500'
                    }`}
                    style={{ width: `${factor.weight * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3">Key Insights</h3>
        <ul className="space-y-2">
          {prediction.insights.map((insight, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span className="text-sm text-gray-700">{insight}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
    );
  } catch (e) {
    console.error('[AnalysisPanel] Error analyzing game:', e);
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg">Unable to analyze this game</p>
          <p className="text-sm mt-2">{(e as Error).message || 'An error occurred'}</p>
          <button
            onClick={onRemove}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
          >
            Remove game
          </button>
        </div>
      </div>
    );
  }
}
