import { useState, useEffect } from 'react';
import { Users, Gamepad2, ThumbsUp, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { getAllGamesFromDb, getGameCountFromDb, forceRefreshGameData } from '@/services/supabaseGames';

const playerCountData = [
  { month: 'Jan', players: 125000 },
  { month: 'Feb', players: 145000 },
  { month: 'Mar', players: 138000 },
  { month: 'Apr', players: 162000 },
  { month: 'May', players: 178000 },
  { month: 'Jun', players: 195000 },
];

const genreData = [
  { name: 'Action', value: 32, color: '#3b82f6' },  // Blue
  { name: 'RPG', value: 24, color: '#8b5cf6' },     // Purple
  { name: 'Strategy', value: 18, color: '#ec4899' }, // Pink
  { name: 'Sports', value: 14, color: '#10b981' },   // Green
  { name: 'Puzzle', value: 12, color: '#f59e0b' },   // Orange
];

const sentimentData = [
  { category: 'Very Positive', count: 450, color: '#10b981' },  // Green
  { category: 'Positive', count: 320, color: '#3b82f6' },       // Blue
  { category: 'Mixed', count: 180, color: '#f59e0b' },          // Orange
  { category: 'Negative', count: 80, color: '#ef4444' },        // Red
];

const topPredictors = [
  { feature: 'Review Sentiment Score', impact: 'Very High', value: '0.89' },
  { feature: 'Player Count (First Week)', impact: 'High', value: '0.76' },
  { feature: 'Price Point', impact: 'Medium', value: '0.54' },
  { feature: 'Developer Reputation', impact: 'Medium', value: '0.48' },
];

interface DashboardStats {
  totalGames: number;
  avgSentiment: number;
  totalPlayers: number;
  positiveSentimentCount: number;
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalGames: 0,
    avgSentiment: 0,
    totalPlayers: 0,
    positiveSentimentCount: 0,
  });
  const [loading, setLoading] = useState(true);

  // Load real data from Supabase on mount
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // Force refresh to ensure fresh data from Supabase
        forceRefreshGameData();
        const games = await getAllGamesFromDb();
        const count = await getGameCountFromDb();

        // Calculate stats from actual game data
        let totalSentiment = 0;
        let totalPlayers = 0;
        let positiveCount = 0;
        let gameCount = 0;

        games.forEach(game => {
          gameCount++;
          const reviews = (game.positive || 0) + (game.negative || 0);
          if (reviews > 0) {
            const sentiment = ((game.positive || 0) / reviews) * 10;
            totalSentiment += sentiment;
            if (sentiment >= 7) positiveCount++;
          }
          totalPlayers += (game.average_forever || game.ccu || 0);
        });

        const avgSentiment = gameCount > 0 ? totalSentiment / gameCount : 0;

        setStats({
          totalGames: count,
          avgSentiment: Math.round(avgSentiment * 10) / 10,
          totalPlayers: totalPlayers, // Remove division by 1000 to display the correct value
          positiveSentimentCount: positiveCount,
        });

        console.log('[DashboardPage] ✅ Loaded stats:', {
          totalGames: count,
          avgSentiment: avgSentiment.toFixed(1),
          totalPlayers,
          positiveCount,
        });
      } catch (e) {
        console.error('[DashboardPage] Error loading data:', e);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="max-w-7xl">
      <h1 className="mb-6 md:mb-8 text-2xl sm:text-3xl">
        SAGE (Steam Analysis & Game Ensemble) Dashboard Overview
      </h1>
      
      <div className="space-y-4 md:space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="border border-gray-300 bg-white p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Total Players (K)</span>
              <Users className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            </div>
            <div className="text-3xl mb-1">{loading ? '...' : (stats.totalPlayers / 1000).toFixed(1)}M</div>
            <div className="text-sm text-green-600">From {stats.totalGames.toLocaleString()} games</div>
          </div>

          <div className="border border-gray-300 bg-white p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Games Tracked</span>
              <Gamepad2 className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            </div>
            <div className="text-3xl mb-1">{loading ? '...' : stats.totalGames.toLocaleString()}</div>
            <div className="text-sm text-green-600">With complete data</div>
          </div>

          <div className="border border-gray-300 bg-white p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Avg. Sentiment</span>
              <ThumbsUp className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            </div>
            <div className="text-3xl mb-1">{loading ? '...' : stats.avgSentiment.toFixed(1)}/10</div>
            <div className="text-sm text-green-600">Across all games</div>
          </div>

          <div className="border border-gray-300 bg-white p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Positive Games</span>
              <TrendingUp className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            </div>
            <div className="text-3xl mb-1">{loading ? '...' : stats.positiveSentimentCount}</div>
            <div className="text-sm text-gray-600">Sentiment ≥ 7.0</div>
          </div>
        </div>

        {/* Summary Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Player Counts */}
          <div className="border border-gray-300 bg-white p-4 md:p-6">
            <h3 className="mb-4 text-base md:text-lg">Player Count Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={playerCountData}>
                <defs>
                  <linearGradient id="playerGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="0" stroke="#e5e7eb" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  axisLine={{ stroke: '#9ca3af' }}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <Line 
                  type="monotone" 
                  dataKey="players" 
                  stroke="url(#playerGradient)" 
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Genre Distribution */}
          <div className="border border-gray-300 bg-white p-4 md:p-6">
            <h3 className="mb-4 text-base md:text-lg">Genre Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={genreData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {genreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {genreData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-600">{item.name} ({item.value}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Review Sentiment */}
          <div className="border border-gray-300 bg-white p-4 md:p-6">
            <h3 className="mb-4 text-base md:text-lg">Review Sentiment</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sentimentData}>
                <CartesianGrid strokeDasharray="0" stroke="#e5e7eb" vertical={false} />
                <XAxis 
                  dataKey="category" 
                  axisLine={{ stroke: '#9ca3af' }}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Predictors of Game Success */}
        <div className="border border-gray-300 bg-white p-4 md:p-8">
          <h2 className="mb-4 md:mb-6 text-lg md:text-xl">Top Predictors of Game Success</h2>
          
          {/* Horizontal scroll wrapper for mobile */}
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <div className="inline-block min-w-full align-middle">
              <div className="border border-gray-300">
                <div className="grid grid-cols-3 border-b border-gray-300 bg-gray-50 min-w-[500px] md:min-w-0">
                  <div className="px-3 md:px-4 py-2.5 border-r border-gray-300 text-gray-600 text-sm md:text-base">
                    Feature
                  </div>
                  <div className="px-3 md:px-4 py-2.5 border-r border-gray-300 text-gray-600 text-sm md:text-base">
                    Impact Level
                  </div>
                  <div className="px-3 md:px-4 py-2.5 text-gray-600 text-sm md:text-base">
                    Importance Score
                  </div>
                </div>
                
                {topPredictors.map((predictor, index) => (
                  <div 
                    key={index} 
                    className={`grid grid-cols-3 min-w-[500px] md:min-w-0 ${
                      index !== topPredictors.length - 1 ? 'border-b border-gray-300' : ''
                    }`}
                  >
                    <div className="px-3 md:px-4 py-3 border-r border-gray-300 text-gray-600 text-sm md:text-base">
                      {predictor.feature}
                    </div>
                    <div className="px-3 md:px-4 py-3 border-r border-gray-300">
                      <span className={`inline-block px-2 py-1 text-xs ${
                        predictor.impact === 'Very High' ? 'bg-red-100 text-red-700' :
                        predictor.impact === 'High' ? 'bg-orange-100 text-orange-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {predictor.impact}
                      </span>
                    </div>
                    <div className="px-3 md:px-4 py-3 text-gray-600 text-sm md:text-base">
                      {predictor.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}