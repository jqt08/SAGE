import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { SearchPanel } from './predict/SearchPanel';
import { AnalysisPanel } from './predict/AnalysisPanel';
import { getGameCountFromDb, forceRefreshGameData } from '@/services/supabaseGames';
import { SearchResult } from '@/types/steam';

export function PredictPage() {
  const [selectedGames, setSelectedGames] = useState<SearchResult[]>([]);
  const [gameCount, setGameCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(true);

  // Load game count from Supabase on mount
  useEffect(() => {
    const loadCount = async () => {
      try {
        setLoadingCount(true);
        // Force refresh to ensure we get latest data
        forceRefreshGameData();
        const count = await getGameCountFromDb();
        console.log(`[PredictPage] ✅ Loaded game count: ${count}`);
        setGameCount(count);
      } catch (e) {
        console.error('[PredictPage] ❌ Error loading game count:', e);
        setGameCount(0);
      } finally {
        setLoadingCount(false);
      }
    };
    
    loadCount();
  }, []);

  const handleAddGame = (game: SearchResult) => {
    // Check if already added
    if (selectedGames.some((g) => g.appid === game.appid)) {
      return;
    }

    // For now, only support one game at a time
    // TODO: Support multiple games for comparison
    setSelectedGames([game]);
  };

  const handleRemoveGame = (appid: number) => {
    setSelectedGames((prev) => prev.filter((g) => g.appid !== appid));
  };

  return (
    <>
      <div className="max-w-full">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Predict Game Success</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Search for Steam games and analyze their success potential using real market data
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {loadingCount ? '⏳ Loading...' : `✅ ${gameCount.toLocaleString()} games with data in the database`}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6 min-h-[calc(100vh-280px)] lg:h-[calc(100vh-240px)]">
          {/* Search Panel - Full width on mobile, 2 columns on desktop */}
          <div className="lg:col-span-2">
            <SearchPanel onAddGame={handleAddGame} />
          </div>

          {/* Analysis Panel - Full width on mobile, 3 columns on desktop */}
          <div className="lg:col-span-3">
            <AnalysisPanel
              selectedGames={selectedGames}
              onRemoveGame={handleRemoveGame}
            />
          </div>
        </div>
      </div>

      {/* Toast notifications */}
      <Toaster position="bottom-right" />
    </>
  );
}