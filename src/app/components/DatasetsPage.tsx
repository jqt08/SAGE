import { useState, useEffect } from 'react';
import { Search, ArrowUpDown, TrendingUp, Users } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { mockGetGenres } from '@/services/mockSteamData';
import { searchByName as steamspySearchByName } from '@/services/steamspy';
import { getAllGamesFromDb, getGameCountFromDb, searchGamesInDb, isSupabaseConfigured, forceRefreshGameData } from '@/services/supabaseGames';

const USE_REAL_API = import.meta.env.VITE_USE_REAL_API === 'true';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

type GameRow = {
  id: number;
  title: string;
  genre: string;
  price: number;
  players: number;
  reviews: number;
  sentiment: number;
  developer: string;
};

const playerTrendData = [
  { month: 'Jan', players: 125000 },
  { month: 'Feb', players: 145000 },
  { month: 'Mar', players: 138000 },
  { month: 'Apr', players: 162000 },
  { month: 'May', players: 178000 },
  { month: 'Jun', players: 195000 },
];

const reviewGrowthData = [
  { month: 'Jan', reviews: 15000 },
  { month: 'Feb', reviews: 18500 },
  { month: 'Mar', reviews: 22000 },
  { month: 'Apr', reviews: 26500 },
  { month: 'May', reviews: 31000 },
  { month: 'Jun', reviews: 35500 },
];

function normalizeGameDetails(g: any): GameRow {
  const priceCents = typeof g.price === 'string' ? parseInt(g.price || '0', 10) : (g.price as unknown as number) || 0;
  const price = priceCents === 0 ? 0 : priceCents / 100;
  const reviews = (g.positive || 0) + (g.negative || 0);
  const sentiment = reviews > 0 ? ((g.positive || 0) / reviews) * 10 : 5.0;
  const genre = g.genre ? g.genre.split(',')[0].trim() : 'Unknown';

  return {
    id: g.appid,
    title: g.name,
    genre,
    price,
    players: g.average_forever || g.ccu || 0,
    reviews,
    sentiment,
    developer: g.developer || 'Unknown',
  };
}

export function DatasetsPage() {
  const [allGames, setAllGames] = useState<GameRow[]>([]);
  const [totalDbGames, setTotalDbGames] = useState(0);
  const [loadingDev, setLoadingDev] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterGenre, setFilterGenre] = useState('all');
  const [selectedGame, setSelectedGame] = useState<number | null>(null);
  const [apiResults, setApiResults] = useState<GameRow[]>([]);
  const [loadingApi, setLoadingApi] = useState(false);

  // Handle column header click to toggle sort
  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Toggle direction if clicking same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and reset to ascending
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  // Load all games from Supabase on mount
  useEffect(() => {
    const loadGames = async () => {
      try {
        setLoadingDev(true);
        // Force refresh to ensure fresh data from Supabase
        forceRefreshGameData();
        const games = await getAllGamesFromDb();
        const count = await getGameCountFromDb();
        
        const normalized = games.map(normalizeGameDetails);
        setAllGames(normalized);
        setTotalDbGames(count);
        console.log(`[DatasetsPage] ✅ Loaded ${normalized.length} games (total in DB: ${count})`);
      } catch (e) {
        console.error('[DatasetsPage] ❌ Error loading games:', e);
      } finally {
        setLoadingDev(false);
      }
    };
    
    loadGames();
  }, []);

  // Use Supabase if configured, otherwise use local games, and search wins if active
  const sourceGames = USE_REAL_API && searchTerm.length > 2 && apiResults.length > 0 
    ? apiResults 
    : allGames;

  const filteredGames = sourceGames
    .filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           game.developer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = filterGenre === 'all' || game.genre === filterGenre;
      return matchesSearch && matchesGenre;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'title') comparison = a.title.localeCompare(b.title);
      else if (sortBy === 'genre') comparison = a.genre.localeCompare(b.genre);
      else if (sortBy === 'price') comparison = a.price - b.price;
      else if (sortBy === 'players') comparison = a.players - b.players;
      else if (sortBy === 'reviews') comparison = a.reviews - b.reviews;
      else if (sortBy === 'sentiment') comparison = a.sentiment - b.sentiment;
      else if (sortBy === 'developer') comparison = a.developer.localeCompare(b.developer);
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const genres = ['all', ...mockGetGenres()];

  // Helper to render sort indicator
  const SortIndicator = ({ column }: { column: string }) => {
    if (sortBy !== column) return <span className="text-gray-300">⇅</span>;
    return sortDirection === 'asc' ? <span className="text-blue-600">↑</span> : <span className="text-blue-600">↓</span>;
  };

  // Debounced search effect for real API or Supabase search
  useEffect(() => {
    if (searchTerm.length <= 2) {
      setApiResults([]);
      return;
    }

    let cancelled = false;
    setLoadingApi(true);

    const timer = setTimeout(async () => {
      try {
        let rows: GameRow[] = [];

        // First try Supabase if configured
        if (isSupabaseConfigured()) {
          const dbResults = await searchGamesInDb(searchTerm);
          rows = dbResults.map(normalizeGameDetails);
          console.log(`[DatasetsPage] Supabase search: ${rows.length} results for "${searchTerm}"`);
        }

        // Then try real API if USE_REAL_API enabled
        if (USE_REAL_API && rows.length === 0 && isSupabaseConfigured()) {
          const apiData = await steamspySearchByName(searchTerm);
          rows = Object.values(apiData).map((g: any) => normalizeGameDetails(g));
          console.log(`[DatasetsPage] SteamSpy search: ${rows.length} results for "${searchTerm}"`);
        }

        if (cancelled) return;
        setApiResults(rows);
      } catch (e) {
        console.error('[DatasetsPage] Search error:', e);
        setApiResults([]);
      } finally {
        if (!cancelled) setLoadingApi(false);
      }
    }, 450); // debounce

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchTerm]);

  return (
    <div className="max-w-7xl">
      <h1 className="mb-2">Dataset Explorer</h1>
      <p className="text-sm text-gray-600 mb-6">{totalDbGames} games in the database — {filteredGames.length} shown</p>
      
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="border border-gray-300 bg-white p-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.5} />
              <Input
                placeholder="Search games or developers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-gray-300 pl-10"
              />
            </div>

            <Select value={filterGenre} onValueChange={setFilterGenre}>
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Filter by genre" />
              </SelectTrigger>
              <SelectContent>
                {genres.map(genre => (
                  <SelectItem key={genre} value={genre}>
                    {genre === 'all' ? 'All Genres' : genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center justify-end text-sm text-gray-500">
              <span>💡 Click column headers to sort</span>
            </div>
          </div>
        </div>

        {/* SteamDB Data Table */}
        <div className="border border-gray-300 bg-white">
          <div className="p-6 border-b border-gray-300">
            <h2>SteamDB Game Data</h2>
            <p className="text-sm text-gray-600 mt-1">{filteredGames.length} games found</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-300">
                  <th 
                    onClick={() => handleSort('title')}
                    className="px-4 py-3 border-r border-gray-300 text-left text-sm text-gray-600 font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Title <SortIndicator column="title" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('genre')}
                    className="px-4 py-3 border-r border-gray-300 text-left text-sm text-gray-600 font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Genre <SortIndicator column="genre" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('price')}
                    className="px-4 py-3 border-r border-gray-300 text-left text-sm text-gray-600 font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Price <SortIndicator column="price" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('players')}
                    className="px-4 py-3 border-r border-gray-300 text-left text-sm text-gray-600 font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Players <SortIndicator column="players" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('reviews')}
                    className="px-4 py-3 border-r border-gray-300 text-left text-sm text-gray-600 font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Reviews <SortIndicator column="reviews" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('sentiment')}
                    className="px-4 py-3 border-r border-gray-300 text-left text-sm text-gray-600 font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Sentiment <SortIndicator column="sentiment" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('developer')}
                    className="px-4 py-3 text-left text-sm text-gray-600 font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Developer <SortIndicator column="developer" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredGames.map((game, index) => (
                  <tr 
                    key={game.id}
                    className={`border-b border-gray-300 text-sm cursor-pointer ${
                      selectedGame === game.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedGame(game.id)}
                  >
                    <td className="px-4 py-3 border-r border-gray-300 text-gray-700 font-medium">
                      {game.title}
                    </td>
                    <td className="px-4 py-3 border-r border-gray-300 text-gray-600">
                      {game.genre}
                    </td>
                    <td className="px-4 py-3 border-r border-gray-300 text-gray-600">
                      {game.price === 0 ? 'Free' : `$${game.price.toFixed(2)}`}
                    </td>
                    <td className="px-4 py-3 border-r border-gray-300 text-gray-600">
                      {game.players.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 border-r border-gray-300 text-gray-600">
                      {game.reviews.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 border-r border-gray-300">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                        game.sentiment >= 9 ? 'bg-green-100 text-green-700' :
                        game.sentiment >= 8 ? 'bg-blue-100 text-blue-700' :
                        game.sentiment >= 7 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {game.sentiment.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {game.developer}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trend Graphs */}
        <div className="grid grid-cols-2 gap-6">
          <div className="border border-gray-300 bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3>Player Count Trend</h3>
              <Users className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={playerTrendData}>
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
                  stroke="#6b7280" 
                  strokeWidth={2}
                  dot={{ fill: '#6b7280', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="border border-gray-300 bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3>Review Growth</h3>
              <TrendingUp className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={reviewGrowthData}>
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
                  dataKey="reviews" 
                  stroke="#9ca3af" 
                  strokeWidth={2}
                  dot={{ fill: '#9ca3af', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
