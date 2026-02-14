/**
 * Mock Steam Data Service
 * 
 * This provides extensive sample data for development/demo purposes.
 * 
 * IMPORTANT: SteamSpy is FREE and requires NO API KEY!
 * The only issue is CORS (browser security blocking direct requests).
 * 
 * To switch to real data, see /docs/API_INTEGRATION_GUIDE.md
 */

import type { SteamSpyAppDetails, SteamSpyListResponse } from '@/types/steam';

/**
 * MOCK GAMES DATABASE
 * Organized by genre with realistic data
 */

// === INDIE GAMES ===
const INDIE_GAMES: Record<number, SteamSpyAppDetails> = {
  413150: {
    appid: 413150,
    name: "Stardew Valley",
    developer: "ConcernedApe",
    publisher: "ConcernedApe",
    score_rank: 98,
    positive: 580000,
    negative: 8500,
    userscore: 0,
    owners: "10,000,000 .. 20,000,000",
    average_forever: 52000,
    average_2weeks: 8500,
    median_forever: 2800,
    median_2weeks: 650,
    price: "1499",
    initialprice: "1499",
    discount: "0",
    languages: "English, French, German, Spanish, Japanese, Korean, Portuguese, Russian, Chinese",
    genre: "Indie, RPG, Simulation",
    ccu: 45000,
    tags: { "Farming Sim": 18500, "Indie": 16200, "Simulation": 15800, "Relaxing": 14500, "Singleplayer": 13200 }
  },
  367520: {
    appid: 367520,
    name: "Hollow Knight",
    developer: "Team Cherry",
    publisher: "Team Cherry",
    score_rank: 97,
    positive: 245000,
    negative: 4200,
    userscore: 0,
    owners: "5,000,000 .. 10,000,000",
    average_forever: 28000,
    average_2weeks: 4500,
    median_forever: 1650,
    median_2weeks: 380,
    price: "1499",
    initialprice: "1499",
    discount: "0",
    languages: "English, French, Italian, German, Spanish, Portuguese, Russian, Chinese, Japanese, Korean",
    genre: "Action, Adventure, Indie",
    ccu: 12000,
    tags: { "Metroidvania": 22500, "Indie": 18900, "Great Soundtrack": 16800, "Difficult": 15200, "Singleplayer": 14800 }
  },
  646570: {
    appid: 646570,
    name: "Slay the Spire",
    developer: "MegaCrit",
    publisher: "Humble Games",
    score_rank: 96,
    positive: 125000,
    negative: 3200,
    userscore: 0,
    owners: "2,000,000 .. 5,000,000",
    average_forever: 45000,
    average_2weeks: 6800,
    median_forever: 2200,
    median_2weeks: 480,
    price: "2499",
    initialprice: "2499",
    discount: "0",
    languages: "English, French, German, Japanese, Korean, Polish, Portuguese, Russian, Chinese, Spanish",
    genre: "Card Game, Indie, Roguelike, Strategy",
    ccu: 18000,
    tags: { "Roguelike": 28500, "Deck Building": 25200, "Indie": 22800, "Card Game": 21500, "Strategy": 19800 }
  },
  588650: {
    appid: 588650,
    name: "Dead Cells",
    developer: "Motion Twin",
    publisher: "Motion Twin",
    score_rank: 94,
    positive: 98000,
    negative: 4500,
    userscore: 0,
    owners: "2,000,000 .. 5,000,000",
    average_forever: 32000,
    average_2weeks: 5200,
    median_forever: 1800,
    median_2weeks: 420,
    price: "2499",
    initialprice: "2499",
    discount: "0",
    languages: "English, French, German, Spanish, Japanese, Korean, Portuguese, Russian, Chinese",
    genre: "Action, Indie, Platformer",
    ccu: 9500,
    tags: { "Roguelike": 24500, "Metroidvania": 22800, "Action": 21200, "Indie": 19500, "Difficult": 18200 }
  },
  280740: {
    appid: 280740,
    name: "Undertale",
    developer: "tobyfox",
    publisher: "tobyfox",
    score_rank: 95,
    positive: 215000,
    negative: 6800,
    userscore: 0,
    owners: "5,000,000 .. 10,000,000",
    average_forever: 18000,
    average_2weeks: 2200,
    median_forever: 980,
    median_2weeks: 180,
    price: "999",
    initialprice: "999",
    discount: "0",
    languages: "English, Japanese, French, Spanish, German",
    genre: "Indie, RPG",
    ccu: 5200,
    tags: { "Indie": 32500, "RPG": 28800, "Great Soundtrack": 25200, "Story Rich": 22500, "Funny": 19800 }
  }
};

// === STRATEGY GAMES ===
const STRATEGY_GAMES: Record<number, SteamSpyAppDetails> = {
  427520: {
    appid: 427520,
    name: "Factorio",
    developer: "Wube Software LTD.",
    publisher: "Wube Software LTD.",
    score_rank: 99,
    positive: 185000,
    negative: 1800,
    userscore: 0,
    owners: "2,000,000 .. 5,000,000",
    average_forever: 95000,
    average_2weeks: 12500,
    median_forever: 5200,
    median_2weeks: 850,
    price: "3000",
    initialprice: "3000",
    discount: "0",
    languages: "English, French, German, Spanish, Polish, Russian, Czech, Chinese, Italian, Japanese, Korean, Portuguese, Hungarian, Ukrainian, Swedish",
    genre: "Indie, Simulation, Strategy",
    ccu: 28000,
    tags: { "Automation": 25800, "Base Building": 22500, "Strategy": 19800, "Singleplayer": 18200, "Multiplayer": 16500 }
  },
  975370: {
    appid: 975370,
    name: "Dwarf Fortress",
    developer: "Bay 12 Games",
    publisher: "Kitfox Games",
    score_rank: 93,
    positive: 48000,
    negative: 1200,
    userscore: 0,
    owners: "500,000 .. 1,000,000",
    average_forever: 68000,
    average_2weeks: 8900,
    median_forever: 3200,
    median_2weeks: 520,
    price: "2999",
    initialprice: "2999",
    discount: "0",
    languages: "English, French, German, Spanish, Japanese, Korean, Russian, Chinese",
    genre: "Indie, Simulation, Strategy",
    ccu: 6500,
    tags: { "Strategy": 18500, "Simulation": 16200, "Management": 14800, "Sandbox": 13500, "Building": 12200 }
  },
  230410: {
    appid: 230410,
    name: "Warframe",
    developer: "Digital Extremes",
    publisher: "Digital Extremes",
    score_rank: 91,
    positive: 420000,
    negative: 35000,
    userscore: 0,
    owners: "50,000,000 .. 100,000,000",
    average_forever: 42000,
    average_2weeks: 5800,
    median_forever: 1850,
    median_2weeks: 380,
    price: "0",
    initialprice: "0",
    discount: "0",
    languages: "English, French, German, Spanish, Italian, Japanese, Korean, Polish, Portuguese, Russian, Chinese, Turkish",
    genre: "Action, Free to Play, Strategy",
    ccu: 52000,
    tags: { "Free to Play": 45800, "Action": 42500, "Looter Shooter": 38200, "Co-op": 35800, "Sci-fi": 32500 }
  },
  1091500: {
    appid: 1091500,
    name: "Cyberpunk 2077",
    developer: "CD PROJEKT RED",
    publisher: "CD PROJEKT RED",
    score_rank: 82,
    positive: 425000,
    negative: 125000,
    userscore: 0,
    owners: "10,000,000 .. 20,000,000",
    average_forever: 58000,
    average_2weeks: 7200,
    median_forever: 2400,
    median_2weeks: 480,
    price: "5999",
    initialprice: "5999",
    discount: "0",
    languages: "English, French, German, Spanish, Polish, Portuguese, Russian, Chinese, Japanese, Korean, Italian",
    genre: "Action, RPG, Strategy",
    ccu: 38000,
    tags: { "RPG": 52800, "Open World": 48500, "Cyberpunk": 45200, "Action": 42800, "Story Rich": 39500 }
  },
  294100: {
    appid: 294100,
    name: "RimWorld",
    developer: "Ludeon Studios",
    publisher: "Ludeon Studios",
    score_rank: 97,
    positive: 145000,
    negative: 3500,
    userscore: 0,
    owners: "2,000,000 .. 5,000,000",
    average_forever: 125000,
    average_2weeks: 15000,
    median_forever: 6800,
    median_2weeks: 1200,
    price: "3499",
    initialprice: "3499",
    discount: "0",
    languages: "English, French, German, Spanish, Polish, Portuguese, Russian, Chinese, Japanese, Korean",
    genre: "Indie, Simulation, Strategy",
    ccu: 22000,
    tags: { "Colony Sim": 28500, "Strategy": 25200, "Survival": 22800, "Base Building": 21500, "Sandbox": 19800 }
  }
};

// === SURVIVAL/SANDBOX GAMES ===
const SURVIVAL_GAMES: Record<number, SteamSpyAppDetails> = {
  105600: {
    appid: 105600,
    name: "Terraria",
    developer: "Re-Logic",
    publisher: "Re-Logic",
    score_rank: 96,
    positive: 920000,
    negative: 28000,
    userscore: 0,
    owners: "35,000,000 .. 50,000,000",
    average_forever: 85000,
    average_2weeks: 9800,
    median_forever: 3200,
    median_2weeks: 520,
    price: "999",
    initialprice: "999",
    discount: "0",
    languages: "English, French, Italian, German, Spanish, Polish, Portuguese, Russian, Chinese",
    genre: "Action, Adventure, Indie, RPG",
    ccu: 65000,
    tags: { "Sandbox": 45800, "2D": 42500, "Multiplayer": 39800, "Adventure": 36200, "Building": 33500 }
  },
  892970: {
    appid: 892970,
    name: "Valheim",
    developer: "Iron Gate AB",
    publisher: "Coffee Stain Publishing",
    score_rank: 94,
    positive: 425000,
    negative: 18000,
    userscore: 0,
    owners: "10,000,000 .. 20,000,000",
    average_forever: 65000,
    average_2weeks: 8500,
    median_forever: 3800,
    median_2weeks: 650,
    price: "1999",
    initialprice: "1999",
    discount: "0",
    languages: "English, French, German, Spanish, Japanese, Korean, Polish, Portuguese, Russian, Chinese",
    genre: "Action, Adventure, Indie, RPG",
    ccu: 28000,
    tags: { "Survival": 52800, "Open World": 48500, "Building": 45200, "Co-op": 42800, "Vikings": 39500 }
  },
  578080: {
    appid: 578080,
    name: "PUBG: BATTLEGROUNDS",
    developer: "KRAFTON, Inc.",
    publisher: "KRAFTON, Inc.",
    score_rank: 76,
    positive: 825000,
    negative: 285000,
    userscore: 0,
    owners: "50,000,000 .. 100,000,000",
    average_forever: 48000,
    average_2weeks: 4200,
    median_forever: 1650,
    median_2weeks: 280,
    price: "0",
    initialprice: "2999",
    discount: "100",
    languages: "English, French, German, Spanish, Japanese, Korean, Polish, Portuguese, Russian, Chinese, Turkish, Arabic",
    genre: "Action, Adventure, Massively Multiplayer",
    ccu: 185000,
    tags: { "Battle Royale": 85800, "Shooter": 78500, "Multiplayer": 72200, "Survival": 68500, "Realistic": 62800 }
  },
  252490: {
    appid: 252490,
    name: "Rust",
    developer: "Facepunch Studios",
    publisher: "Facepunch Studios",
    score_rank: 84,
    positive: 520000,
    negative: 98000,
    userscore: 0,
    owners: "10,000,000 .. 20,000,000",
    average_forever: 125000,
    average_2weeks: 18500,
    median_forever: 5600,
    median_2weeks: 1200,
    price: "3999",
    initialprice: "3999",
    discount: "0",
    languages: "English, French, German, Spanish, Japanese, Korean, Polish, Portuguese, Russian, Chinese, Turkish",
    genre: "Action, Adventure, Indie, Massively Multiplayer, RPG",
    ccu: 98000,
    tags: { "Survival": 78500, "Multiplayer": 72800, "Open World": 68200, "Crafting": 65800, "PvP": 62500 }
  },
  242760: {
    appid: 242760,
    name: "The Forest",
    developer: "Endnight Games Ltd",
    publisher: "Endnight Games Ltd",
    score_rank: 93,
    positive: 285000,
    negative: 12000,
    userscore: 0,
    owners: "5,000,000 .. 10,000,000",
    average_forever: 42000,
    average_2weeks: 5800,
    median_forever: 2100,
    median_2weeks: 420,
    price: "1999",
    initialprice: "1999",
    discount: "0",
    languages: "English, French, German, Spanish, Japanese, Korean, Polish, Portuguese, Russian, Chinese, Italian, Turkish",
    genre: "Action, Adventure, Indie, Simulation",
    ccu: 18000,
    tags: { "Survival": 45800, "Horror": 42500, "Co-op": 39200, "Open World": 36800, "Building": 33500 }
  }
};

// === ACTION/MULTIPLAYER GAMES ===
const ACTION_GAMES: Record<number, SteamSpyAppDetails> = {
  945360: {
    appid: 945360,
    name: "Among Us",
    developer: "Innersloth",
    publisher: "Innersloth",
    score_rank: 85,
    positive: 485000,
    negative: 52000,
    userscore: 0,
    owners: "20,000,000 .. 50,000,000",
    average_forever: 12500,
    average_2weeks: 1200,
    median_forever: 450,
    median_2weeks: 85,
    price: "399",
    initialprice: "499",
    discount: "20",
    languages: "English, Spanish, Portuguese, French, German, Italian, Dutch, Russian, Japanese, Korean, Chinese, Irish, Filipino, Indonesian, Ukrainian, Romanian, Polish, Danish, Finnish, Norwegian, Swedish, Turkish, Greek, Czech, Bulgarian, Thai, Vietnamese, Hungarian, Arabic",
    genre: "Action, Casual, Indie",
    ccu: 18000,
    tags: { "Multiplayer": 78500, "Online Co-Op": 65200, "Social Deduction": 58900, "Indie": 52800, "Funny": 48500 }
  },
  570: {
    appid: 570,
    name: "Dota 2",
    developer: "Valve",
    publisher: "Valve",
    score_rank: 88,
    positive: 1200000,
    negative: 285000,
    userscore: 0,
    owners: "100,000,000 .. 200,000,000",
    average_forever: 142000,
    average_2weeks: 18500,
    median_forever: 6800,
    median_2weeks: 1200,
    price: "0",
    initialprice: "0",
    discount: "0",
    languages: "English, French, German, Spanish, Japanese, Korean, Polish, Portuguese, Russian, Chinese, Turkish, Italian, Thai, Romanian, Bulgarian, Czech, Danish, Dutch, Finnish, Greek, Hungarian, Norwegian, Swedish, Ukrainian, Vietnamese",
    genre: "Action, Free to Play, Strategy",
    ccu: 425000,
    tags: { "MOBA": 125800, "Free to Play": 118500, "Multiplayer": 112200, "Strategy": 108500, "Competitive": 102800 }
  },
  730: {
    appid: 730,
    name: "Counter-Strike 2",
    developer: "Valve",
    publisher: "Valve",
    score_rank: 89,
    positive: 1850000,
    negative: 285000,
    userscore: 0,
    owners: "50,000,000 .. 100,000,000",
    average_forever: 125000,
    average_2weeks: 22500,
    median_forever: 5800,
    median_2weeks: 1500,
    price: "0",
    initialprice: "0",
    discount: "0",
    languages: "English, French, German, Spanish, Japanese, Korean, Polish, Portuguese, Russian, Chinese, Turkish, Italian, Thai, Romanian, Bulgarian, Czech, Danish, Dutch, Finnish, Greek, Hungarian, Norwegian, Swedish, Ukrainian, Vietnamese",
    genre: "Action, Free to Play",
    ccu: 1250000,
    tags: { "FPS": 185800, "Shooter": 178500, "Multiplayer": 172200, "Competitive": 168500, "Tactical": 162800 }
  },
  1172470: {
    appid: 1172470,
    name: "Apex Legends",
    developer: "Respawn Entertainment",
    publisher: "Electronic Arts",
    score_rank: 87,
    positive: 485000,
    negative: 68000,
    userscore: 0,
    owners: "50,000,000 .. 100,000,000",
    average_forever: 38000,
    average_2weeks: 6200,
    median_forever: 1850,
    median_2weeks: 420,
    price: "0",
    initialprice: "0",
    discount: "0",
    languages: "English, French, German, Spanish, Japanese, Korean, Polish, Portuguese, Russian, Chinese, Italian, Thai",
    genre: "Action, Adventure, Free to Play",
    ccu: 285000,
    tags: { "Battle Royale": 95800, "Free to Play": 88500, "FPS": 82200, "Shooter": 78500, "Hero Shooter": 72800 }
  },
  1151340: {
    appid: 1151340,
    name: "Forza Horizon 5",
    developer: "Playground Games",
    publisher: "Xbox Game Studios",
    score_rank: 90,
    positive: 285000,
    negative: 18000,
    userscore: 0,
    owners: "10,000,000 .. 20,000,000",
    average_forever: 52000,
    average_2weeks: 7800,
    median_forever: 2400,
    median_2weeks: 580,
    price: "5999",
    initialprice: "5999",
    discount: "0",
    languages: "English, French, German, Spanish, Japanese, Korean, Polish, Portuguese, Russian, Chinese, Italian",
    genre: "Racing, Simulation, Sports",
    ccu: 42000,
    tags: { "Racing": 65800, "Open World": 58500, "Driving": 52200, "Multiplayer": 48500, "Simulation": 42800 }
  }
};

// === RPG GAMES ===
const RPG_GAMES: Record<number, SteamSpyAppDetails> = {
  1245620: {
    appid: 1245620,
    name: "ELDEN RING",
    developer: "FromSoftware Inc.",
    publisher: "FromSoftware Inc., Bandai Namco Entertainment",
    score_rank: 91,
    positive: 485000,
    negative: 65000,
    userscore: 0,
    owners: "20,000,000 .. 50,000,000",
    average_forever: 78000,
    average_2weeks: 9800,
    median_forever: 3500,
    median_2weeks: 680,
    price: "5999",
    initialprice: "5999",
    discount: "0",
    languages: "English, French, German, Spanish, Japanese, Korean, Polish, Portuguese, Russian, Chinese, Italian, Arabic",
    genre: "Action, RPG",
    ccu: 68000,
    tags: { "Souls-like": 85800, "RPG": 78500, "Open World": 72200, "Dark Fantasy": 68500, "Difficult": 62800 }
  },
  292030: {
    appid: 292030,
    name: "The Witcher 3: Wild Hunt",
    developer: "CD PROJEKT RED",
    publisher: "CD PROJEKT RED",
    score_rank: 95,
    positive: 685000,
    negative: 28000,
    userscore: 0,
    owners: "50,000,000 .. 100,000,000",
    average_forever: 92000,
    average_2weeks: 8500,
    median_forever: 4200,
    median_2weeks: 620,
    price: "3999",
    initialprice: "3999",
    discount: "0",
    languages: "English, French, German, Spanish, Japanese, Korean, Polish, Portuguese, Russian, Chinese, Italian, Czech, Hungarian, Brazilian Portuguese, Turkish, Arabic",
    genre: "Action, RPG",
    ccu: 45000,
    tags: { "RPG": 125800, "Open World": 118500, "Story Rich": 112200, "Fantasy": 108500, "Atmospheric": 102800 }
  },
  990080: {
    appid: 990080,
    name: "Hogwarts Legacy",
    developer: "Avalanche Software",
    publisher: "Warner Bros. Games",
    score_rank: 88,
    positive: 285000,
    negative: 28000,
    userscore: 0,
    owners: "10,000,000 .. 20,000,000",
    average_forever: 42000,
    average_2weeks: 5200,
    median_forever: 1850,
    median_2weeks: 380,
    price: "5999",
    initialprice: "5999",
    discount: "0",
    languages: "English, French, German, Spanish, Japanese, Korean, Polish, Portuguese, Russian, Chinese, Italian",
    genre: "Action, Adventure, RPG",
    ccu: 32000,
    tags: { "RPG": 65800, "Magic": 58500, "Open World": 52200, "Adventure": 48500, "Fantasy": 42800 }
  },
  1174180: {
    appid: 1174180,
    name: "Red Dead Redemption 2",
    developer: "Rockstar Games",
    publisher: "Rockstar Games",
    score_rank: 90,
    positive: 425000,
    negative: 52000,
    userscore: 0,
    owners: "20,000,000 .. 50,000,000",
    average_forever: 68000,
    average_2weeks: 7200,
    median_forever: 2800,
    median_2weeks: 520,
    price: "5999",
    initialprice: "5999",
    discount: "0",
    languages: "English, French, German, Spanish, Japanese, Korean, Polish, Portuguese, Russian, Chinese, Italian",
    genre: "Action, Adventure",
    ccu: 52000,
    tags: { "Open World": 95800, "Story Rich": 88500, "Western": 82200, "Adventure": 78500, "Realistic": 72800 }
  },
  1203220: {
    appid: 1203220,
    name: "NARAKA: BLADEPOINT",
    developer: "24 Entertainment",
    publisher: "NetEase Games Global",
    score_rank: 83,
    positive: 125000,
    negative: 28000,
    userscore: 0,
    owners: "10,000,000 .. 20,000,000",
    average_forever: 32000,
    average_2weeks: 4200,
    median_forever: 1450,
    median_2weeks: 320,
    price: "1999",
    initialprice: "1999",
    discount: "0",
    languages: "English, French, German, Spanish, Japanese, Korean, Portuguese, Russian, Chinese, Thai, Turkish",
    genre: "Action, Adventure, Free to Play",
    ccu: 28000,
    tags: { "Battle Royale": 45800, "Martial Arts": 42500, "Melee": 39200, "Action": 36800, "Multiplayer": 33500 }
  }
};

// === EARLY ACCESS GAMES ===
const EARLY_ACCESS_GAMES: Record<number, SteamSpyAppDetails> = {
  1086940: {
    appid: 1086940,
    name: "Baldur's Gate 3",
    developer: "Larian Studios",
    publisher: "Larian Studios",
    score_rank: 95,
    positive: 125000,
    negative: 3500,
    userscore: 0,
    owners: "5,000,000 .. 10,000,000",
    average_forever: 85000,
    average_2weeks: 15000,
    median_forever: 4200,
    median_2weeks: 980,
    price: "5999",
    initialprice: "5999",
    discount: "0",
    languages: "English, French, German, Spanish, Polish, Portuguese, Russian, Chinese, Japanese, Korean",
    genre: "RPG, Strategy, Early Access",
    ccu: 42000,
    tags: { "RPG": 52800, "Turn-Based": 48500, "D&D": 45200, "Story Rich": 42800, "Party-Based": 39500 }
  },
  1966720: {
    appid: 1966720,
    name: "Starfield",
    developer: "Bethesda Game Studios",
    publisher: "Bethesda Softworks",
    score_rank: 86,
    positive: 185000,
    negative: 42000,
    userscore: 0,
    owners: "5,000,000 .. 10,000,000",
    average_forever: 52000,
    average_2weeks: 8200,
    median_forever: 2400,
    median_2weeks: 520,
    price: "6999",
    initialprice: "6999",
    discount: "0",
    languages: "English, French, German, Spanish, Japanese, Korean, Polish, Portuguese, Russian, Chinese, Italian",
    genre: "RPG, Early Access",
    ccu: 35000,
    tags: { "Space": 45800, "RPG": 42500, "Open World": 39200, "Sci-fi": 36800, "Exploration": 33500 }
  },
  1690370: {
    appid: 1690370,
    name: "Palworld",
    developer: "Pocketpair",
    publisher: "Pocketpair",
    score_rank: 88,
    positive: 285000,
    negative: 38000,
    userscore: 0,
    owners: "10,000,000 .. 20,000,000",
    average_forever: 42000,
    average_2weeks: 6800,
    median_forever: 1950,
    median_2weeks: 480,
    price: "2999",
    initialprice: "2999",
    discount: "0",
    languages: "English, French, German, Spanish, Japanese, Korean, Portuguese, Russian, Chinese",
    genre: "Action, Adventure, Indie, RPG, Early Access",
    ccu: 52000,
    tags: { "Survival": 65800, "Open World": 58500, "Multiplayer": 52200, "Creature Collector": 48500, "Crafting": 42800 }
  },
  1432080: {
    appid: 1432080,
    name: "Manor Lords",
    developer: "Slavic Magic",
    publisher: "Hooded Horse",
    score_rank: 90,
    positive: 95000,
    negative: 5200,
    userscore: 0,
    owners: "2,000,000 .. 5,000,000",
    average_forever: 28000,
    average_2weeks: 4800,
    median_forever: 1350,
    median_2weeks: 320,
    price: "2999",
    initialprice: "2999",
    discount: "0",
    languages: "English, French, German, Spanish, Polish, Portuguese, Russian, Chinese, Japanese, Korean",
    genre: "Simulation, Strategy, Early Access",
    ccu: 18000,
    tags: { "City Builder": 38500, "Medieval": 35200, "Strategy": 32800, "Management": 29500, "Realistic": 26800 }
  },
  1240440: {
    appid: 1240440,
    name: "Hades II",
    developer: "Supergiant Games",
    publisher: "Supergiant Games",
    score_rank: 93,
    positive: 125000,
    negative: 4200,
    userscore: 0,
    owners: "2,000,000 .. 5,000,000",
    average_forever: 38000,
    average_2weeks: 6200,
    median_forever: 1850,
    median_2weeks: 420,
    price: "2999",
    initialprice: "2999",
    discount: "0",
    languages: "English, French, German, Spanish, Japanese, Korean, Portuguese, Russian, Chinese",
    genre: "Action, Indie, RPG, Early Access",
    ccu: 22000,
    tags: { "Roguelike": 48500, "Action": 45200, "Indie": 42800, "Great Soundtrack": 39500, "Hack and Slash": 36800 }
  }
};

// === COMING SOON GAMES ===
const COMING_SOON_GAMES: Record<number, SteamSpyAppDetails> = {
  2369390: {
    appid: 2369390,
    name: "Hollow Knight: Silksong",
    developer: "Team Cherry",
    publisher: "Team Cherry",
    score_rank: 0,
    positive: 0,
    negative: 0,
    userscore: 0,
    owners: "0 .. 0",
    average_forever: 0,
    average_2weeks: 0,
    median_forever: 0,
    median_2weeks: 0,
    price: "1999",
    initialprice: "1999",
    discount: "0",
    languages: "TBA",
    genre: "Action, Adventure, Indie",
    ccu: 0,
    tags: { "Metroidvania": 85000, "Indie": 78000, "Action": 72000, "2D": 68000, "Atmospheric": 62000 }
  },
  2239550: {
    appid: 2239550,
    name: "GTA 6",
    developer: "Rockstar Games",
    publisher: "Rockstar Games",
    score_rank: 0,
    positive: 0,
    negative: 0,
    userscore: 0,
    owners: "0 .. 0",
    average_forever: 0,
    average_2weeks: 0,
    median_forever: 0,
    median_2weeks: 0,
    price: "6999",
    initialprice: "6999",
    discount: "0",
    languages: "TBA",
    genre: "Action, Adventure",
    ccu: 0,
    tags: { "Open World": 250000, "Crime": 185000, "Action": 165000, "Multiplayer": 145000, "Story Rich": 120000 }
  },
  2358720: {
    appid: 2358720,
    name: "Black Myth: Wukong",
    developer: "Game Science",
    publisher: "Game Science",
    score_rank: 0,
    positive: 0,
    negative: 0,
    userscore: 0,
    owners: "0 .. 0",
    average_forever: 0,
    average_2weeks: 0,
    median_forever: 0,
    median_2weeks: 0,
    price: "5999",
    initialprice: "5999",
    discount: "0",
    languages: "English, Chinese, Japanese, Korean",
    genre: "Action, Adventure, RPG",
    ccu: 0,
    tags: { "Souls-like": 95000, "Action RPG": 88000, "Chinese Mythology": 82000, "Dark Fantasy": 75000, "Difficult": 68000 }
  },
  2346660: {
    appid: 2346660,
    name: "S.T.A.L.K.E.R. 2: Heart of Chornobyl",
    developer: "GSC Game World",
    publisher: "GSC Game World",
    score_rank: 0,
    positive: 0,
    negative: 0,
    userscore: 0,
    owners: "0 .. 0",
    average_forever: 0,
    average_2weeks: 0,
    median_forever: 0,
    median_2weeks: 0,
    price: "5999",
    initialprice: "5999",
    discount: "0",
    languages: "English, Russian, Ukrainian, Polish, German, French",
    genre: "Action, Adventure, RPG",
    ccu: 0,
    tags: { "FPS": 72000, "Survival Horror": 68000, "Open World": 65000, "Post-apocalyptic": 58000, "Atmospheric": 52000 }
  },
  2282450: {
    appid: 2282450,
    name: "Fable",
    developer: "Playground Games",
    publisher: "Xbox Game Studios",
    score_rank: 0,
    positive: 0,
    negative: 0,
    userscore: 0,
    owners: "0 .. 0",
    average_forever: 0,
    average_2weeks: 0,
    median_forever: 0,
    median_2weeks: 0,
    price: "6999",
    initialprice: "6999",
    discount: "0",
    languages: "TBA",
    genre: "Action, Adventure, RPG",
    ccu: 0,
    tags: { "RPG": 58000, "Fantasy": 52000, "Open World": 48000, "Action": 42000, "Story Rich": 38000 }
  },
  2379780: {
    appid: 2379780,
    name: "Marvel's Wolverine",
    developer: "Insomniac Games",
    publisher: "Sony Interactive Entertainment",
    score_rank: 0,
    positive: 0,
    negative: 0,
    userscore: 0,
    owners: "0 .. 0",
    average_forever: 0,
    average_2weeks: 0,
    median_forever: 0,
    median_2weeks: 0,
    price: "6999",
    initialprice: "6999",
    discount: "0",
    languages: "TBA",
    genre: "Action, Adventure",
    ccu: 0,
    tags: { "Action": 78000, "Superhero": 72000, "Story Rich": 65000, "Third Person": 58000, "Singleplayer": 52000 }
  },
  2412080: {
    appid: 2412080,
    name: "Ghost of Yotei",
    developer: "Sucker Punch Productions",
    publisher: "Sony Interactive Entertainment",
    score_rank: 0,
    positive: 0,
    negative: 0,
    userscore: 0,
    owners: "0 .. 0",
    average_forever: 0,
    average_2weeks: 0,
    median_forever: 0,
    median_2weeks: 0,
    price: "6999",
    initialprice: "6999",
    discount: "0",
    languages: "English, Japanese",
    genre: "Action, Adventure",
    ccu: 0,
    tags: { "Samurai": 65000, "Open World": 58000, "Action": 52000, "Japanese": 48000, "Story Rich": 42000 }
  },
  2198760: {
    appid: 2198760,
    name: "Indie Survival Prototype",
    developer: "Unknown Studio",
    publisher: "Self-Published",
    score_rank: 0,
    positive: 0,
    negative: 0,
    userscore: 0,
    owners: "0 .. 0",
    average_forever: 0,
    average_2weeks: 0,
    median_forever: 0,
    median_2weeks: 0,
    price: "999",
    initialprice: "999",
    discount: "0",
    languages: "English",
    genre: "Indie, Survival",
    ccu: 0,
    tags: { "Survival": 1200, "Indie": 950, "Early Access": 780, "Crafting": 650, "Base Building": 520 }
  },
  2156890: {
    appid: 2156890,
    name: "Pixel Platformer Deluxe",
    developer: "Solo Dev",
    publisher: "Self-Published",
    score_rank: 0,
    positive: 0,
    negative: 0,
    userscore: 0,
    owners: "0 .. 0",
    average_forever: 0,
    average_2weeks: 0,
    median_forever: 0,
    median_2weeks: 0,
    price: "499",
    initialprice: "499",
    discount: "0",
    languages: "English",
    genre: "Action, Indie",
    ccu: 0,
    tags: { "Platformer": 850, "2D": 720, "Pixel Graphics": 680, "Indie": 620, "Difficult": 420 }
  },
  2289540: {
    appid: 2289540,
    name: "Cyberpunk Hacker Sim",
    developer: "New Wave Games",
    publisher: "Digital Dreams Publishing",
    score_rank: 0,
    positive: 0,
    negative: 0,
    userscore: 0,
    owners: "0 .. 0",
    average_forever: 0,
    average_2weeks: 0,
    median_forever: 0,
    median_2weeks: 0,
    price: "1999",
    initialprice: "1999",
    discount: "0",
    languages: "English, French, German",
    genre: "Simulation, Strategy, Indie",
    ccu: 0,
    tags: { "Hacking": 5200, "Cyberpunk": 4800, "Strategy": 4200, "Puzzle": 3800, "Singleplayer": 3200 }
  }
};

// === LOW POTENTIAL / UNDERPERFORMING GAMES ===
const LOW_POTENTIAL_GAMES: Record<number, SteamSpyAppDetails> = {
  1203630: {
    appid: 1203630,
    name: "Babylon's Fall",
    developer: "PlatinumGames",
    publisher: "Square Enix",
    score_rank: 12,
    positive: 850,
    negative: 4200,
    userscore: 0,
    owners: "20,000 .. 50,000",
    average_forever: 450,
    average_2weeks: 0,
    median_forever: 120,
    median_2weeks: 0,
    price: "5999",
    initialprice: "5999",
    discount: "0",
    languages: "English, French, German, Spanish, Japanese, Korean, Portuguese, Russian, Chinese",
    genre: "Action, Adventure, Massively Multiplayer, RPG",
    ccu: 0,
    tags: { "Action": 1200, "Multiplayer": 980, "RPG": 850, "Looter": 620, "Live Service": 480 }
  },
  1216800: {
    appid: 1216800,
    name: "The Lord of the Rings: Gollum",
    developer: "Daedalic Entertainment",
    publisher: "Nacon",
    score_rank: 18,
    positive: 1200,
    negative: 8500,
    userscore: 0,
    owners: "50,000 .. 100,000",
    average_forever: 320,
    average_2weeks: 0,
    median_forever: 85,
    median_2weeks: 0,
    price: "4999",
    initialprice: "4999",
    discount: "0",
    languages: "English, French, German, Spanish, Italian, Russian",
    genre: "Action, Adventure",
    ccu: 12,
    tags: { "Adventure": 2200, "Stealth": 1850, "Story Rich": 1620, "Action": 1420, "Singleplayer": 1180 }
  },
  1172380: {
    appid: 1172380,
    name: "Star Wars: Squadrons",
    developer: "Motive Studios",
    publisher: "Electronic Arts",
    score_rank: 72,
    positive: 28000,
    negative: 8500,
    userscore: 0,
    owners: "1,000,000 .. 2,000,000",
    average_forever: 850,
    average_2weeks: 15,
    median_forever: 320,
    median_2weeks: 0,
    price: "3999",
    initialprice: "3999",
    discount: "0",
    languages: "English, French, German, Spanish, Italian, Japanese, Korean, Polish, Portuguese, Russian",
    genre: "Action, Simulation",
    ccu: 52,
    tags: { "Space": 8500, "Flight": 7200, "VR": 6800, "Star Wars": 5200, "Multiplayer": 4800 }
  },
  1144200: {
    appid: 1144200,
    name: "Ready or Not",
    developer: "VOID Interactive",
    publisher: "VOID Interactive",
    score_rank: 78,
    positive: 52000,
    negative: 6200,
    userscore: 0,
    owners: "1,000,000 .. 2,000,000",
    average_forever: 2200,
    average_2weeks: 280,
    median_forever: 850,
    median_2weeks: 120,
    price: "3999",
    initialprice: "3999",
    discount: "0",
    languages: "English, French, German, Spanish, Russian, Chinese",
    genre: "Action, Indie, Strategy",
    ccu: 2800,
    tags: { "Tactical": 12500, "FPS": 10800, "Realistic": 9200, "Co-op": 8500, "Singleplayer": 7800 }
  },
  2348590: {
    appid: 2348590,
    name: "Project Zomboid Clone",
    developer: "Small Indie Team",
    publisher: "Self-Published",
    score_rank: 45,
    positive: 450,
    negative: 280,
    userscore: 0,
    owners: "5,000 .. 10,000",
    average_forever: 180,
    average_2weeks: 25,
    median_forever: 45,
    median_2weeks: 0,
    price: "1499",
    initialprice: "1499",
    discount: "0",
    languages: "English",
    genre: "Indie, Survival, Simulation",
    ccu: 8,
    tags: { "Survival": 820, "Zombies": 650, "Indie": 580, "Sandbox": 420, "Crafting": 350 }
  },
  1928980: {
    appid: 1928980,
    name: "Generic Battle Royale",
    developer: "Mobile Port Studios",
    publisher: "Generic Games Inc",
    score_rank: 32,
    positive: 2800,
    negative: 5200,
    userscore: 0,
    owners: "100,000 .. 200,000",
    average_forever: 420,
    average_2weeks: 35,
    median_forever: 120,
    median_2weeks: 0,
    price: "0",
    initialprice: "0",
    discount: "0",
    languages: "English, Spanish, Portuguese, Russian",
    genre: "Action, Free to Play",
    ccu: 185,
    tags: { "Battle Royale": 4200, "Free to Play": 3800, "Shooter": 3200, "Multiplayer": 2800, "Third Person": 2200 }
  },
  2156780: {
    appid: 2156780,
    name: "Voxel Survival Game #247",
    developer: "Asset Flip Studios",
    publisher: "Self-Published",
    score_rank: 28,
    positive: 120,
    negative: 380,
    userscore: 0,
    owners: "1,000 .. 5,000",
    average_forever: 65,
    average_2weeks: 0,
    median_forever: 12,
    median_2weeks: 0,
    price: "999",
    initialprice: "999",
    discount: "0",
    languages: "English",
    genre: "Action, Indie, Simulation",
    ccu: 2,
    tags: { "Survival": 280, "Voxel": 220, "Open World": 180, "Crafting": 150, "Base Building": 120 }
  },
  2289650: {
    appid: 2289650,
    name: "Retro Platformer Pro",
    developer: "Nostalgia Games",
    publisher: "Self-Published",
    score_rank: 52,
    positive: 850,
    negative: 220,
    userscore: 0,
    owners: "10,000 .. 20,000",
    average_forever: 320,
    average_2weeks: 45,
    median_forever: 95,
    median_2weeks: 0,
    price: "599",
    initialprice: "599",
    discount: "0",
    languages: "English, Spanish, French",
    genre: "Action, Indie",
    ccu: 18,
    tags: { "Platformer": 1850, "2D": 1520, "Retro": 1280, "Pixel Graphics": 980, "Difficult": 720 }
  },
  1845670: {
    appid: 1845670,
    name: "Souls-like Clone: Dark Edition",
    developer: "Wannabe Studios",
    publisher: "Budget Games Publishing",
    score_rank: 38,
    positive: 1850,
    negative: 3200,
    userscore: 0,
    owners: "50,000 .. 100,000",
    average_forever: 520,
    average_2weeks: 45,
    median_forever: 180,
    median_2weeks: 0,
    price: "2999",
    initialprice: "2999",
    discount: "0",
    languages: "English, Russian, Chinese",
    genre: "Action, RPG, Indie",
    ccu: 62,
    tags: { "Souls-like": 3200, "Difficult": 2800, "Action RPG": 2420, "Dark Fantasy": 1980, "Third Person": 1620 }
  },
  2198540: {
    appid: 2198540,
    name: "Farming Simulator: Budget Edition",
    developer: "Copy Cat Games",
    publisher: "Discount Software",
    score_rank: 42,
    positive: 620,
    negative: 850,
    userscore: 0,
    owners: "20,000 .. 50,000",
    average_forever: 380,
    average_2weeks: 28,
    median_forever: 120,
    median_2weeks: 0,
    price: "1299",
    initialprice: "1299",
    discount: "0",
    languages: "English, German, Polish",
    genre: "Simulation, Indie",
    ccu: 25,
    tags: { "Farming Sim": 1520, "Simulation": 1280, "Relaxing": 980, "Singleplayer": 820, "Indie": 650 }
  }
};

// Combine all games
export const MOCK_GAMES: Record<number, SteamSpyAppDetails> = {
  ...INDIE_GAMES,
  ...STRATEGY_GAMES,
  ...SURVIVAL_GAMES,
  ...ACTION_GAMES,
  ...RPG_GAMES,
  ...EARLY_ACCESS_GAMES,
  ...COMING_SOON_GAMES,
  ...LOW_POTENTIAL_GAMES
};

// Export category lists
export const MOCK_EARLY_ACCESS: SteamSpyListResponse = Object.fromEntries(
  Object.entries(EARLY_ACCESS_GAMES).map(([id, game]) => [
    id,
    {
      appid: game.appid,
      name: game.name,
      score_rank: game.score_rank,
      positive: game.positive,
      negative: game.negative,
      userscore: game.userscore,
      owners: game.owners,
      average_forever: game.average_forever,
      average_2weeks: game.average_2weeks,
      median_forever: game.median_forever,
      median_2weeks: game.median_2weeks,
      ccu: game.ccu
    }
  ])
);

export const MOCK_COMING_SOON: SteamSpyListResponse = Object.fromEntries(
  Object.entries(COMING_SOON_GAMES).map(([id, game]) => [
    id,
    {
      appid: game.appid,
      name: game.name,
      score_rank: game.score_rank,
      positive: game.positive,
      negative: game.negative,
      userscore: game.userscore,
      owners: game.owners,
      average_forever: game.average_forever,
      average_2weeks: game.average_2weeks,
      median_forever: game.median_forever,
      median_2weeks: game.median_2weeks,
      ccu: game.ccu
    }
  ])
);

/**
 * Search games by name (case-insensitive)
 */
export function mockSearchGames(query: string): SteamSpyAppDetails[] {
  const lowerQuery = query.toLowerCase();
  
  return Object.values(MOCK_GAMES).filter(game =>
    game.name.toLowerCase().includes(lowerQuery) &&
    game.price !== "TBA" // Exclude coming soon games from search
  );
}

/**
 * Get game details by App ID
 */
export function mockGetAppDetails(appid: number): SteamSpyAppDetails | null {
  return MOCK_GAMES[appid] || null;
}

/**
 * Get Early Access games list
 */
export function mockGetEarlyAccess(): SteamSpyListResponse {
  return MOCK_EARLY_ACCESS;
}

/**
 * Get Coming Soon games list
 */
export function mockGetComingSoon(): SteamSpyListResponse {
  return MOCK_COMING_SOON;
}

/**
 * Get games by genre
 */
export function mockGetByGenre(genre: string): SteamSpyListResponse {
  const lowerGenre = genre.toLowerCase();
  const filtered = Object.values(MOCK_GAMES).filter(game =>
    game.genre.toLowerCase().includes(lowerGenre) && game.price !== "TBA"
  );
  
  return Object.fromEntries(
    filtered.map(game => [
      game.appid.toString(),
      {
        appid: game.appid,
        name: game.name,
        score_rank: game.score_rank,
        positive: game.positive,
        negative: game.negative,
        userscore: game.userscore,
        owners: game.owners,
        average_forever: game.average_forever,
        average_2weeks: game.average_2weeks,
        median_forever: game.median_forever,
        median_2weeks: game.median_2weeks,
        ccu: game.ccu
      }
    ])
  );
}

/**
 * Get top 100 games (simulated)
 */
export function mockGetTop(kind: 'in2weeks' | 'forever' | 'owned'): SteamSpyListResponse {
  let sorted = Object.values(MOCK_GAMES).filter(g => g.price !== "TBA");
  
  if (kind === 'in2weeks') {
    sorted = sorted.sort((a, b) => b.average_2weeks - a.average_2weeks);
  } else if (kind === 'owned') {
    sorted = sorted.sort((a, b) => {
      const aOwn = parseInt(a.owners.split('..')[1]?.replace(/,/g, '') || '0');
      const bOwn = parseInt(b.owners.split('..')[1]?.replace(/,/g, '') || '0');
      return bOwn - aOwn;
    });
  } else {
    sorted = sorted.sort((a, b) => b.score_rank - a.score_rank);
  }
  
  return Object.fromEntries(
    sorted.slice(0, 25).map(game => [
      game.appid.toString(),
      {
        appid: game.appid,
        name: game.name,
        score_rank: game.score_rank,
        positive: game.positive,
        negative: game.negative,
        userscore: game.userscore,
        owners: game.owners,
        average_forever: game.average_forever,
        average_2weeks: game.average_2weeks,
        median_forever: game.median_forever,
        median_2weeks: game.median_2weeks,
        ccu: game.ccu
      }
    ])
  );
}

/**
 * Get games by tag (simulated)
 */
export function mockGetByTag(tag: string): SteamSpyListResponse {
  const lowerTag = tag.toLowerCase();
  const filtered = Object.values(MOCK_GAMES).filter(game => {
    const gameTags = Object.keys(game.tags || {}).map(t => t.toLowerCase());
    return gameTags.some(t => t.includes(lowerTag)) && game.price !== "TBA";
  });
  
  return Object.fromEntries(
    filtered.map(game => [
      game.appid.toString(),
      {
        appid: game.appid,
        name: game.name,
        score_rank: game.score_rank,
        positive: game.positive,
        negative: game.negative,
        userscore: game.userscore,
        owners: game.owners,
        average_forever: game.average_forever,
        average_2weeks: game.average_2weeks,
        median_forever: game.median_forever,
        median_2weeks: game.median_2weeks,
        ccu: game.ccu
      }
    ])
  );
}

/**
 * Get all available genres
 */
export function mockGetGenres(): string[] {
  const genres = new Set<string>();
  
  Object.values(MOCK_GAMES).forEach(game => {
    game.genre.split(',').forEach(g => genres.add(g.trim()));
  });
  
  return Array.from(genres).sort();
}

/**
 * Return all games in the mock database as an array.
 */
export function mockGetAllGames(): SteamSpyAppDetails[] {
  return Object.values(MOCK_GAMES).filter(game => game.price !== 'TBA');
}

/**
 * Get total count of games available in the mock database
 */
export function mockGetTotalGamesCount(): number {
  return Object.values(MOCK_GAMES).filter(game => game.price !== "TBA").length;
}

/**
 * Expand the in-memory mock database to the requested total count.
 * This creates synthetic but realistic entries derived from existing templates.
 * Call this at app startup (dev only) to simulate large datasets.
 */
export function mockEnsureLargeDataset(total: number = 10000) {
  const existing = Object.values(MOCK_GAMES).filter(g => g.price !== 'TBA');
  if (existing.length >= total) return;

  const ids = Object.keys(MOCK_GAMES).map(n => parseInt(n, 10)).filter(n => !Number.isNaN(n));
  let nextId = ids.length ? Math.max(...ids) + 1 : 1000000;

  // Deterministic PRNG (mulberry32)
  const makeRng = (seed: number) => {
    let t = seed >>> 0;
    return () => {
      t += 0x6D2B79F5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  };

  // Helper pools
  const adjectives = ['Ancient','Lost','Galactic','Mystic','Neon','Cyber','Shadow','Epic','Tiny','Grand','Hidden','Forsaken','Infinite','Atomic','Silent','Brave','Lucky','Savage','Crystal','Iron'];
  const nouns = ['Odyssey','Frontier','Tactics','Legends','Quest','Rift','Harbor','Empire','Forge','Chronicle','Valley','Saga','Runner','Arena','Skies','Bound','Wasteland','Colony','Outpost','Reckoning'];

  const genresAll = mockGetGenres();

  // Collect tags pool and developers pool
  const tagSet = new Set<string>();
  const devSet = new Set<string>();
  existing.forEach(g => {
    if (g.tags) Object.keys(g.tags).forEach(t => tagSet.add(t));
    if (g.developer) devSet.add(g.developer);
  });
  const tagsPool = Array.from(tagSet);
  const devPool = Array.from(devSet);

  const ownerRanges = [
    '0 .. 50,000', '50,000 .. 200,000', '200,000 .. 500,000', '500,000 .. 1,000,000',
    '1,000,000 .. 2,000,000', '2,000,000 .. 5,000,000', '5,000,000 .. 10,000,000',
    '10,000,000 .. 20,000,000', '20,000,000 .. 50,000,000', '50,000,000 .. 100,000,000'
  ];

  const priceChoices = ['0','299','399','499','999','1499','1999','2499','2999','3999','5999'];

  const existingNames = new Set(existing.map(e => e.name.toLowerCase()));

  let rng = makeRng(nextId);
  while (Object.values(MOCK_GAMES).filter(g => g.price !== 'TBA').length < total) {
    const template = existing[Math.floor(rng() * existing.length)];
    const newAppId = nextId++;

    // Build a unique name: try adjective + noun + suffix
    let name = `${adjectives[Math.floor(rng() * adjectives.length)]} ${nouns[Math.floor(rng() * nouns.length)]}`;
    // Occasionally append year/number
    if (rng() > 0.7) name += ` ${1900 + Math.floor(rng() * 127)}`;
    if (existingNames.has(name.toLowerCase())) {
      name += ` #${newAppId}`;
    }
    existingNames.add(name.toLowerCase());

    // genre pick
    const genre = genresAll.length ? genresAll[Math.floor(rng() * genresAll.length)] : template.genre;

    // developer / publisher variation
    const developer = devPool.length ? devPool[Math.floor(rng() * devPool.length)] : (template.developer || 'Indie Dev');
    const publisher = developer;

    // tags: pick 3-6 tags from pool or from template
    const tagCount = 3 + Math.floor(rng() * 4);
    const pickedTags: Record<string, number> = {};
    for (let i = 0; i < tagCount; i++) {
      const t = tagsPool.length ? tagsPool[Math.floor(rng() * tagsPool.length)] : Object.keys(template.tags || {})[i % (Object.keys(template.tags || {}).length || 1)];
      if (t) pickedTags[t] = (pickedTags[t] || 0) + Math.floor(1000 + rng() * 45000);
    }

    // numeric stats derived from template but varied
    const basePlayers = template.average_forever || 1000;
    const avgForever = Math.max(1, Math.round(basePlayers * (0.2 + rng() * 3.5)));
    const avg2weeks = Math.max(1, Math.round(avgForever * (0.01 + rng() * 0.2)));
    const positive = Math.max(0, Math.round((template.positive || 1000) * (0.2 + rng() * 3.0)));
    const negative = Math.max(0, Math.round((template.negative || 100) * (0.1 + rng() * 2.0)));
    const ccu = Math.max(1, Math.round((template.ccu || 50) * (0.2 + rng() * 4)));
    const owners = ownerRanges[Math.floor(rng() * ownerRanges.length)];
    const price = priceChoices[Math.floor(rng() * priceChoices.length)];

    MOCK_GAMES[newAppId] = {
      appid: newAppId,
      name,
      developer,
      publisher,
      score_rank: Math.max(1, Math.min(100, Math.round((template.score_rank || 50) + (rng() - 0.5) * 30))),
      positive,
      negative,
      userscore: template.userscore || 0,
      owners,
      average_forever: avgForever,
      average_2weeks: avg2weeks,
      median_forever: Math.max(1, Math.round(avgForever * (0.02 + rng() * 0.2))),
      median_2weeks: Math.max(1, Math.round(avg2weeks * (0.02 + rng() * 0.2))),
      price,
      initialprice: price,
      discount: '0',
      languages: template.languages || 'English',
      genre: genre,
      ccu,
      tags: pickedTags,
    } as any;

    // regenerate rng occasionally to keep distribution varied
    if (nextId % 137 === 0) rng = makeRng(nextId + (rng()*1000)|0);
  }
}

// Auto-generate large dataset in development when explicitly requested
try {
  const genFlag = (typeof process !== 'undefined' && process.env && process.env.VITE_GENERATE_LARGE_DB) || (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GENERATE_LARGE_DB);
  if (genFlag === '1' || genFlag === 'true') {
    // default to 10000
    mockEnsureLargeDataset(10000);
  }
} catch (e) {
  // ignore in browser environments without process
}