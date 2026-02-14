-- Create table to store SteamSpy app details for UI and analysis
CREATE TABLE IF NOT EXISTS public.steam_games (
  appid bigint PRIMARY KEY,
  name text NOT NULL,
  developer text,
  publisher text,
  owners text,
  owners_midpoint integer,
  average_forever integer,
  average_2weeks integer,
  median_forever integer,
  median_2weeks integer,
  ccu integer,
  price integer,
  initialprice integer,
  discount integer,
  languages text,
  genre text,
  tags jsonb,
  positive integer,
  negative integer,
  score_rank integer,
  userscore integer,
  updated_at timestamptz DEFAULT now()
);

-- Indexes to speed up search
CREATE INDEX IF NOT EXISTS idx_steam_games_name ON public.steam_games USING gin (to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_steam_games_genre ON public.steam_games (genre);
CREATE INDEX IF NOT EXISTS idx_steam_games_developer ON public.steam_games (developer);
