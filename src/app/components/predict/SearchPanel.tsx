import { useState, useEffect } from 'react';
import { Search, TrendingUp, Tag as TagIcon, Gamepad2 } from 'lucide-react';
import { mockGetAppDetails, mockGetByGenre, mockGetTop, mockGetByTag } from '@/services/mockSteamData';
import { getAllGamesFromDb, forceRefreshGameData } from '@/services/supabaseGames';
import { SearchResult } from '@/types/steam';
import { toast } from 'sonner';

interface SearchPanelProps {
  onAddGame: (result: SearchResult) => void;
}

type BrowseMode = 'top' | 'genre' | 'tag';
type TopKind = 'in2weeks' | 'forever' | 'owned';

// These are fallback/defaults; actual genres are extracted from Supabase data
const DEFAULT_GENRES = [
  'Action', 'Adventure', 'Strategy', 'RPG', 'Indie',
  'Simulation', 'Sports', 'Racing', 'Casual', 'Early Access'
];

const DEFAULT_TAGS = [
  'Singleplayer', 'Multiplayer', 'Co-op', 'PvP', 'Open World',
  'Story Rich', 'FPS', 'Survival', 'Horror', 'Roguelike',
  'Pixel Graphics', 'Turn-Based', 'Free to Play', 'VR'
];

export function SearchPanel({ onAddGame }: SearchPanelProps) {
  const [browseMode, setBrowseMode] = useState<BrowseMode>('genre');
  const [topKind, setTopKind] = useState<TopKind>('owned');
  const [selectedGenre, setSelectedGenre] = useState('Action');
  const [selectedTag, setSelectedTag] = useState('Multiplayer');
  const [customSearch, setCustomSearch] = useState('');
  const [allSupabaseGames, setAllSupabaseGames] = useState<any[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [availableGenres, setAvailableGenres] = useState<string[]>(DEFAULT_GENRES);
  const [availableTags, setAvailableTags] = useState<string[]>(DEFAULT_TAGS);
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Handle column click to toggle sort
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  // Load all Supabase games on mount
  useEffect(() => {
    const loadGames = async () => {
      try {
        setLoadingGames(true);
        forceRefreshGameData();
        const games = await getAllGamesFromDb();
        setAllSupabaseGames(games);
        console.log(`[SearchPanel] ✅ Loaded ${games.length} games from Supabase`);

        // Extract unique genres and tags from games
        const genresSet = new Set<string>();
        const tagsSet = new Set<string>();

        games.forEach(game => {
          if (game.genre) {
            const gameGenres = game.genre.split(',').map(g => g.trim());
            gameGenres.forEach(g => {
              if (g && g !== 'TBA') genresSet.add(g);
            });
          }
          if (game.tags && typeof game.tags === 'object') {
            Object.keys(game.tags).forEach(tag => {
              if (tag) tagsSet.add(tag);
            });
          }
        });

        const sortedGenres = Array.from(genresSet).sort();
        const sortedTags = Array.from(tagsSet).sort();

        if (sortedGenres.length > 0) {
          setAvailableGenres(sortedGenres.slice(0, 20)); // Limit to 20 for UI
          setSelectedGenre(sortedGenres[0]); // Set first as default
        }
        if (sortedTags.length > 0) {
          setAvailableTags(sortedTags.slice(0, 20)); // Limit to 20 for UI
          setSelectedTag(sortedTags[0]); // Set first as default
        }
      } catch (e) {
        console.error('[SearchPanel] ❌ Error loading games:', e);
        toast.error('Failed to load games from database');
      } finally {
        setLoadingGames(false);
      }
    };
    loadGames();
  }, []);

  // Get data based on current mode - from Supabase games
  const getData = () => {
    if (allSupabaseGames.length === 0) return {};

    // For 'top' games, sort by player count
    if (browseMode === 'top') {
      const sorted = [...allSupabaseGames].sort((a, b) => {
        if (topKind === 'in2weeks') return (b.average_2weeks || 0) - (a.average_2weeks || 0);
        if (topKind === 'forever') return (b.average_forever || 0) - (a.average_forever || 0);
        return (b.owners ? parseInt(b.owners, 10) : 0) - (a.owners ? parseInt(a.owners, 10) : 0);
      });
      const topGames: any = {};
      sorted.slice(0, 100).forEach(game => {
        topGames[game.appid] = game;
      });
      return topGames;
    }

    // For 'genre' games, filter by selected genre
    if (browseMode === 'genre') {
      const genreGames: any = {};
      allSupabaseGames.forEach(game => {
        const gameGenre = game.genre ? game.genre.split(',')[0].trim() : 'Unknown';
        if (gameGenre === selectedGenre) {
          genreGames[game.appid] = game;
        }
      });
      return genreGames;
    }

    // For 'tag' games, filter by games containing the tag
    if (browseMode === 'tag') {
      const tagGames: any = {};
      allSupabaseGames.forEach(game => {
        const tags = game.tags ? Object.keys(game.tags || {}) : [];
        if (tags.some(tag => tag.includes(selectedTag))) {
          tagGames[game.appid] = game;
        }
      });
      return tagGames;
    }

    return {};
  };

  const currentData = getData();

  const handleAddGame = (appid: number, name: string) => {
    try {
      // Get game details from Supabase data instead of mock
      const details = allSupabaseGames.find(g => g.appid === appid);
      
      if (!details) {
        toast.error('Game not found');
        return;
      }

      const result: SearchResult = {
        appid: details.appid,
        name: details.name,
        releaseStatus: details.genre?.toLowerCase().includes('early access') ? 'early_access' : 'released',
        owners: details.owners,
        ccu: details.ccu,
        average2weeks: details.average_2weeks,
        scoreRank: details.score_rank,
        tags: details.tags ? Object.keys(details.tags).slice(0, 5) : [],
      };

      onAddGame(result);
      toast.success(`Added ${name} to analysis`);
    } catch (error) {
      toast.error(`Failed to add ${name}`);
      console.error('Error adding game:', error);
    }
  };

  // Convert to display format
  const displayResults = currentData
    ? Object.entries(currentData)
        .filter(([, game]) => game.name && game.appid)
        .map(([, game]) => ({
          appid: game.appid,
          name: game.name,
          owners: game.owners,
          ccu: game.ccu,
          scoreRank: game.score_rank,
          positive: game.positive,
          negative: game.negative,
        }))
        .sort((a, b) => {
          let comparison = 0;
          if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
          else if (sortBy === 'owners') {
            const aOwners = a.owners ? parseInt(a.owners.split(',')[0].trim()) : 0;
            const bOwners = b.owners ? parseInt(b.owners.split(',')[0].trim()) : 0;
            comparison = bOwners - aOwners;
          }
          else if (sortBy === 'ccu') comparison = (b.ccu || 0) - (a.ccu || 0);
          else if (sortBy === 'reviews') comparison = ((b.positive || 0) + (b.negative || 0)) - ((a.positive || 0) + (a.negative || 0));
          else if (sortBy === 'sentiment') {
            const aSentiment = ((a.positive || 0) + (a.negative || 0)) > 0 ? (a.positive || 0) / ((a.positive || 0) + (a.negative || 0)) : 0;
            const bSentiment = ((b.positive || 0) + (b.negative || 0)) > 0 ? (b.positive || 0) / ((b.positive || 0) + (b.negative || 0)) : 0;
            comparison = bSentiment - aSentiment;
          }
          return sortDirection === 'asc' ? comparison : -comparison;
        })
    : [];

  // Filter by custom search if provided
  const filteredResults = customSearch.length > 2
    ? displayResults.filter(game =>
        game.name.toLowerCase().includes(customSearch.toLowerCase())
      )
    : displayResults;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-3">
        <h2 className="text-lg md:text-xl font-semibold">Browse Games</h2>
        <div className="flex items-center gap-2 text-sm">
          <span className={`px-2 py-1 rounded font-medium text-xs ${loadingGames ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
            {loadingGames ? '⏳ Loading...' : '✓ Supabase'}
          </span>
          <span className="text-gray-500 text-xs">{filteredResults.length} games</span>
        </div>
      </div>

      {/* Browse Mode Selector */}
      <div className="flex gap-2 mb-4 md:mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setBrowseMode('top')}
          className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm ${
            browseMode === 'top'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span className="hidden sm:inline">Top Games</span>
          <span className="sm:hidden">Top</span>
        </button>
        <button
          onClick={() => setBrowseMode('genre')}
          className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm ${
            browseMode === 'genre'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span className="hidden sm:inline">By Genre</span>
          <span className="sm:hidden">Genre</span>
        </button>
        <button
          onClick={() => setBrowseMode('tag')}
          className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm ${
            browseMode === 'tag'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <TagIcon className="w-4 h-4" />
          <span className="hidden sm:inline">By Tag</span>
          <span className="sm:hidden">Tag</span>
        </button>
      </div>

      {/* Category Selector */}
      <div className="mb-4 md:mb-6">
        {browseMode === 'top' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Top Games By:</label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setTopKind('in2weeks')}
                className={`px-3 md:px-4 py-2 text-xs md:text-sm rounded-lg transition-colors whitespace-nowrap ${
                  topKind === 'in2weeks'
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                Players (2 weeks)
              </button>
              <button
                onClick={() => setTopKind('owned')}
                className={`px-3 md:px-4 py-2 text-xs md:text-sm rounded-lg transition-colors whitespace-nowrap ${
                  topKind === 'owned'
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                Most Owned
              </button>
              <button
                onClick={() => setTopKind('forever')}
                className={`px-3 md:px-4 py-2 text-xs md:text-sm rounded-lg transition-colors whitespace-nowrap ${
                  topKind === 'forever'
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                All Time
              </button>
            </div>
          </div>
        )}

        {browseMode === 'genre' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Select Genre:</label>
            <div className="flex flex-wrap gap-2">
              {availableGenres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-3 py-1.5 text-xs md:text-sm rounded-lg transition-colors ${
                    selectedGenre === genre
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        )}

        {browseMode === 'tag' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Select Tag:</label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1.5 text-xs md:text-sm rounded-lg transition-colors ${
                    selectedTag === tag
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search Filter */}
      <div className="mb-4 md:mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={customSearch}
            onChange={(e) => setCustomSearch(e.target.value)}
            placeholder="Filter results by name..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Sort Controls */}
      <div className="mb-4 flex items-center gap-2 text-sm">
        <span className="text-gray-600 font-medium">Sort by:</span>
        <button
          onClick={() => handleSort('name')}
          className={`px-3 py-1 rounded text-xs transition-colors ${
            sortBy === 'name'
              ? 'bg-blue-100 text-blue-700 font-medium'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Name {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => handleSort('owners')}
          className={`px-3 py-1 rounded text-xs transition-colors ${
            sortBy === 'owners'
              ? 'bg-blue-100 text-blue-700 font-medium'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Owners {sortBy === 'owners' && (sortDirection === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => handleSort('ccu')}
          className={`px-3 py-1 rounded text-xs transition-colors ${
            sortBy === 'ccu'
              ? 'bg-blue-100 text-blue-700 font-medium'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Players {sortBy === 'ccu' && (sortDirection === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => handleSort('reviews')}
          className={`px-3 py-1 rounded text-xs transition-colors ${
            sortBy === 'reviews'
              ? 'bg-blue-100 text-blue-700 font-medium'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Reviews {sortBy === 'reviews' && (sortDirection === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => handleSort('sentiment')}
          className={`px-3 py-1 rounded text-xs transition-colors ${
            sortBy === 'sentiment'
              ? 'bg-blue-100 text-blue-700 font-medium'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Sentiment {sortBy === 'sentiment' && (sortDirection === 'asc' ? '↑' : '↓')}
        </button>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-auto">
        {filteredResults.length > 0 && (
          <div className="space-y-2">
            {filteredResults.map((game, index) => {
              const positiveRate = game.positive && game.negative
                ? Math.round((game.positive / (game.positive + game.negative)) * 100)
                : null;

              return (
                <div
                  key={`${game.appid}-${index}`}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{game.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span>ID: {game.appid}</span>
                        {game.owners && <span>👥 {game.owners}</span>}
                        {positiveRate !== null && (
                          <span className={positiveRate >= 80 ? 'text-green-600' : positiveRate >= 70 ? 'text-yellow-600' : 'text-red-600'}>
                            👍 {positiveRate}%
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddGame(game.appid, game.name)}
                      className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              );
            })}</div>
        )}

        {filteredResults.length === 0 && customSearch && (
          <div className="text-center py-12 text-gray-500">
            <p>No results found for "{customSearch}"</p>
            <button
              onClick={() => setCustomSearch('')}
              className="mt-2 text-blue-600 hover:underline text-sm"
            >
              Clear filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}