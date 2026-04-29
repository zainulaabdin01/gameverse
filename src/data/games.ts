export type Platform = "PC" | "PS5" | "Xbox" | "Switch";
export type Genre =
  | "Action"
  | "RPG"
  | "Shooter"
  | "Strategy"
  | "Adventure"
  | "Sports"
  | "Racing"
  | "Indie"
  | "MMO"
  | "Fighting"
  | "Simulation"
  | "Horror";

export interface Game {
  slug: string;
  title: string;
  developer: string;
  publisher: string;
  releaseYear: number;
  rating: number; // 0-100
  userScore: number; // 0-10
  genres: Genre[];
  platforms: Platform[];
  cover: string;
  hero: string;
  screenshots: string[];
  shortDescription: string;
  description: string;
  trending?: boolean;
  featured?: boolean;
}

const img = (id: string, w = 1200, h = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export const games: Game[] = [
  {
    slug: "eldoria-rising",
    title: "Eldoria Rising",
    developer: "Northwind Studios",
    publisher: "Aurora Interactive",
    releaseYear: 2025,
    rating: 94,
    userScore: 9.1,
    genres: ["RPG", "Adventure"],
    platforms: ["PC", "PS5", "Xbox"],
    cover: img("photo-1542751371-adc38448a05e"),
    hero: img("photo-1538481199705-c710c4e965fc", 1920, 900),
    screenshots: [
      img("photo-1511512578047-dfb367046420"),
      img("photo-1538481199705-c710c4e965fc"),
      img("photo-1493711662062-fa541adb3fc8"),
    ],
    shortDescription: "An open-world fantasy epic with dynamic kingdoms.",
    description:
      "Eldoria Rising weaves a sprawling, hand-crafted continent with reactive kingdoms, deep companion arcs, and a magic system built around elemental harmonies. Forge alliances, topple empires, or live as a bard chasing the perfect song.",
    trending: true,
    featured: true,
  },
  {
    slug: "neon-protocol",
    title: "Neon Protocol",
    developer: "Vector Foundry",
    publisher: "Pulse Games",
    releaseYear: 2025,
    rating: 91,
    userScore: 8.8,
    genres: ["Shooter", "Action"],
    platforms: ["PC", "PS5", "Xbox"],
    cover: img("photo-1542751110-97427bbecf20"),
    hero: img("photo-1518709268805-4e9042af2176", 1920, 900),
    screenshots: [
      img("photo-1542751110-97427bbecf20"),
      img("photo-1518709268805-4e9042af2176"),
      img("photo-1551103782-8ab07afd45c1"),
    ],
    shortDescription: "Cyberpunk tactical shooter with mod-deep gunplay.",
    description:
      "Neon Protocol drops you into a fractured megacity where every weapon, augment, and squadmate can be tuned mid-mission. The campaign branches based on which factions you burn — and which you build.",
    featured: true,
  },
  {
    slug: "starforge-odyssey",
    title: "Starforge Odyssey",
    developer: "Helios Labs",
    publisher: "Helios Labs",
    releaseYear: 2024,
    rating: 88,
    userScore: 8.4,
    genres: ["RPG", "Adventure", "Simulation"],
    platforms: ["PC", "PS5"],
    cover: img("photo-1462331940025-496dfbfc7564"),
    hero: img("photo-1419242902214-272b3f66ee7a", 1920, 900),
    screenshots: [
      img("photo-1462331940025-496dfbfc7564"),
      img("photo-1419242902214-272b3f66ee7a"),
      img("photo-1517976487492-5750f3195933"),
    ],
    shortDescription: "Build a fleet, chart the unknown, rewrite history.",
    description:
      "Starforge Odyssey blends procedurally generated star systems with hand-authored story arcs. Manage a crew, customize ships down to the bulkheads, and uncover what really happened to the lost colonies.",
    trending: true,
    featured: true,
  },
  {
    slug: "ironhold",
    title: "Ironhold",
    developer: "Boulder Bay",
    publisher: "Anvil Press",
    releaseYear: 2024,
    rating: 85,
    userScore: 8.6,
    genres: ["Strategy", "Simulation"],
    platforms: ["PC"],
    cover: img("photo-1591491653056-4e0f9c2a0c87"),
    hero: img("photo-1542751371-adc38448a05e", 1920, 900),
    screenshots: [img("photo-1591491653056-4e0f9c2a0c87"), img("photo-1542751371-adc38448a05e")],
    shortDescription: "Colony-builder where every dwarf has a grudge.",
    description:
      "Ironhold simulates an entire mountain civilization. Memories, feuds, masterworks and tragedies emerge from systems that never stop ticking, even when you're not watching.",
  },
  {
    slug: "valor-arena",
    title: "Valor Arena",
    developer: "Crimson Forge",
    publisher: "Crimson Forge",
    releaseYear: 2024,
    rating: 87,
    userScore: 8.0,
    genres: ["Shooter", "Action"],
    platforms: ["PC", "PS5", "Xbox"],
    cover: img("photo-1552820728-8b83bb6b773f"),
    hero: img("photo-1542751110-97427bbecf20", 1920, 900),
    screenshots: [img("photo-1552820728-8b83bb6b773f"), img("photo-1542751110-97427bbecf20")],
    shortDescription: "Tactical 5v5 with a roster of agents and strict economy.",
    description:
      "Valor Arena is the competitive backbone of the new tactical shooter scene — sharp gunplay, deep agent kits, and a tournament circuit watched by millions every weekend.",
    trending: true,
  },
  {
    slug: "cobalt-circuit",
    title: "Cobalt Circuit",
    developer: "Apex Drift",
    publisher: "Octane Games",
    releaseYear: 2025,
    rating: 89,
    userScore: 8.9,
    genres: ["Racing", "Sports"],
    platforms: ["PC", "PS5", "Xbox"],
    cover: img("photo-1503376780353-7e6692767b70"),
    hero: img("photo-1492144534655-ae79c964c9d7", 1920, 900),
    screenshots: [img("photo-1503376780353-7e6692767b70"), img("photo-1492144534655-ae79c964c9d7")],
    shortDescription: "Open-world racing with a living motorsport calendar.",
    description:
      "Cobalt Circuit treats motorsport like an MMO — qualifying weeks, rivalries, sponsor reputation, and a dynamic weather model that can ruin a finals lap in three seconds.",
    featured: true,
  },
  {
    slug: "hollow-tides",
    title: "Hollow Tides",
    developer: "Driftwood Collective",
    publisher: "Indie Press Forge",
    releaseYear: 2024,
    rating: 92,
    userScore: 9.3,
    genres: ["Indie", "Adventure"],
    platforms: ["PC", "Switch", "PS5"],
    cover: img("photo-1517816743773-6e0fd518b4a6"),
    hero: img("photo-1502082553048-f009c37129b9", 1920, 900),
    screenshots: [img("photo-1517816743773-6e0fd518b4a6"), img("photo-1502082553048-f009c37129b9")],
    shortDescription: "A painterly meditation on grief and the sea.",
    description:
      "Hollow Tides is a short, deeply personal voyage. You inherit a lighthouse and the ghost of a town. Every chapter peels back another layer of what was lost — and what can still be saved.",
    trending: true,
  },
  {
    slug: "rune-of-ash",
    title: "Rune of Ash",
    developer: "Ember Tale",
    publisher: "Aurora Interactive",
    releaseYear: 2023,
    rating: 90,
    userScore: 9.0,
    genres: ["RPG", "Action"],
    platforms: ["PC", "PS5", "Xbox", "Switch"],
    cover: img("photo-1559717865-a99cac1c95d8"),
    hero: img("photo-1542751371-adc38448a05e", 1920, 900),
    screenshots: [img("photo-1559717865-a99cac1c95d8"), img("photo-1542751371-adc38448a05e")],
    shortDescription: "Soulslike with a twist: every death rewrites the world.",
    description:
      "Rune of Ash reshuffles its own geography each time you fall. Master the loop, learn the bosses, and unlock endings hidden behind perma-deaths only the most ruthless players will ever see.",
  },
  {
    slug: "midnight-patrol",
    title: "Midnight Patrol",
    developer: "Beacon House",
    publisher: "Beacon House",
    releaseYear: 2025,
    rating: 83,
    userScore: 8.2,
    genres: ["Horror", "Adventure"],
    platforms: ["PC", "PS5"],
    cover: img("photo-1509198397868-475647b2a1e5"),
    hero: img("photo-1518709268805-4e9042af2176", 1920, 900),
    screenshots: [img("photo-1509198397868-475647b2a1e5"), img("photo-1518709268805-4e9042af2176")],
    shortDescription: "Co-op horror set across decaying suburban America.",
    description:
      "Midnight Patrol is built around two-player tension. One drives, one investigates. The radio knows things you don't, and the route home is never the one you took out.",
  },
  {
    slug: "skybound-tactics",
    title: "Skybound Tactics",
    developer: "Brigade Eleven",
    publisher: "Pulse Games",
    releaseYear: 2024,
    rating: 86,
    userScore: 8.5,
    genres: ["Strategy", "RPG"],
    platforms: ["PC", "Switch"],
    cover: img("photo-1531297484001-80022131f5a1"),
    hero: img("photo-1493711662062-fa541adb3fc8", 1920, 900),
    screenshots: [img("photo-1531297484001-80022131f5a1"), img("photo-1493711662062-fa541adb3fc8")],
    shortDescription: "Airship-era turn-based tactics with permadeath squads.",
    description:
      "Skybound Tactics demands precision. Squads of six, hand-built officers with branching skill trees, and a campaign that punishes momentum more than mistakes.",
  },
  {
    slug: "afterlight",
    title: "Afterlight",
    developer: "Lantern North",
    publisher: "Aurora Interactive",
    releaseYear: 2025,
    rating: 95,
    userScore: 9.4,
    genres: ["Adventure", "RPG"],
    platforms: ["PC", "PS5", "Xbox"],
    cover: img("photo-1502082553048-f009c37129b9"),
    hero: img("photo-1493711662062-fa541adb3fc8", 1920, 900),
    screenshots: [img("photo-1502082553048-f009c37129b9"), img("photo-1493711662062-fa541adb3fc8")],
    shortDescription: "The most acclaimed narrative game of the year.",
    description:
      "Afterlight reimagines the linear adventure. Every chapter is a different photographer documenting the same impossible day. The truth depends on who's holding the camera.",
    trending: true,
    featured: true,
  },
  {
    slug: "atlas-online",
    title: "Atlas Online",
    developer: "Polaris Worlds",
    publisher: "Polaris Worlds",
    releaseYear: 2023,
    rating: 84,
    userScore: 8.0,
    genres: ["MMO", "RPG"],
    platforms: ["PC"],
    cover: img("photo-1511512578047-dfb367046420"),
    hero: img("photo-1542751371-adc38448a05e", 1920, 900),
    screenshots: [img("photo-1511512578047-dfb367046420"), img("photo-1542751371-adc38448a05e")],
    shortDescription: "MMO with player-run economies and seasonal continents.",
    description:
      "Atlas Online resets a continent every season. Guilds compete to shape laws, currency, and lore that carries forward — even as the map itself disappears.",
  },
  {
    slug: "pixel-pioneers",
    title: "Pixel Pioneers",
    developer: "Tiny Forge",
    publisher: "Tiny Forge",
    releaseYear: 2024,
    rating: 82,
    userScore: 8.7,
    genres: ["Indie", "Simulation"],
    platforms: ["PC", "Switch"],
    cover: img("photo-1493711662062-fa541adb3fc8"),
    hero: img("photo-1517816743773-6e0fd518b4a6", 1920, 900),
    screenshots: [img("photo-1493711662062-fa541adb3fc8"), img("photo-1517816743773-6e0fd518b4a6")],
    shortDescription: "Cozy pixel-art town builder with a haunted twist.",
    description:
      "Pixel Pioneers looks cozy on the box. Beneath the wholesome aesthetic is a sharp resource sim where every neighbor is keeping a secret you'll eventually have to choose to bury or expose.",
  },
  {
    slug: "ironclad-cup",
    title: "Ironclad Cup",
    developer: "Studio Goalpost",
    publisher: "Studio Goalpost",
    releaseYear: 2024,
    rating: 81,
    userScore: 7.8,
    genres: ["Sports"],
    platforms: ["PC", "PS5", "Xbox"],
    cover: img("photo-1551698618-1dfe5d97d256"),
    hero: img("photo-1431324155629-1a6deb1dec8d", 1920, 900),
    screenshots: [img("photo-1551698618-1dfe5d97d256"), img("photo-1431324155629-1a6deb1dec8d")],
    shortDescription: "Gritty football sim that finally fixes career mode.",
    description:
      "Ironclad Cup throws out the cosmetic career mode and replaces it with negotiations, board pressure, fan sentiment, and a youth academy that actually matters.",
  },
  {
    slug: "ghost-stack",
    title: "Ghost Stack",
    developer: "Outer Margin",
    publisher: "Pulse Games",
    releaseYear: 2025,
    rating: 88,
    userScore: 8.6,
    genres: ["Action", "Indie"],
    platforms: ["PC", "Switch", "PS5"],
    cover: img("photo-1542751371-adc38448a05e"),
    hero: img("photo-1559717865-a99cac1c95d8", 1920, 900),
    screenshots: [img("photo-1542751371-adc38448a05e"), img("photo-1559717865-a99cac1c95d8")],
    shortDescription: "Fast-as-thought parkour shooter with rewind mechanics.",
    description:
      "Ghost Stack is built around rewind. Die, watch the replay, then jump back into the same firefight with everything you just learned. Speedrunners have already reshaped its meta.",
  },
  {
    slug: "siege-of-volenta",
    title: "Siege of Volenta",
    developer: "Black Banner Games",
    publisher: "Black Banner Games",
    releaseYear: 2025,
    rating: 89,
    userScore: 8.7,
    genres: ["Strategy", "Action"],
    platforms: ["PC", "PS5", "Xbox"],
    cover: img("photo-1542751371-adc38448a05e"),
    hero: img("photo-1493711662062-fa541adb3fc8", 1920, 900),
    screenshots: [img("photo-1542751371-adc38448a05e")],
    shortDescription: "Massive medieval sieges with full destructible castles.",
    description:
      "Siege of Volenta lets two hundred players assault a single stronghold at once. Walls crumble, throne rooms burn, and history gets written one breach at a time.",
  },
  {
    slug: "kazoku-fighters",
    title: "Kazoku Fighters",
    developer: "Iron Glove",
    publisher: "Iron Glove",
    releaseYear: 2024,
    rating: 90,
    userScore: 8.9,
    genres: ["Fighting"],
    platforms: ["PC", "PS5", "Xbox"],
    cover: img("photo-1511512578047-dfb367046420"),
    hero: img("photo-1542751110-97427bbecf20", 1920, 900),
    screenshots: [img("photo-1511512578047-dfb367046420")],
    shortDescription: "Tag-team fighter built for tournament play.",
    description:
      "Kazoku Fighters resurrected the tag-team subgenre. Rollback netcode, a 28-character launch roster, and a tournament scene that's already produced two unforgettable grand finals.",
  },
  {
    slug: "harvest-orbit",
    title: "Harvest Orbit",
    developer: "Greenfield Lab",
    publisher: "Greenfield Lab",
    releaseYear: 2024,
    rating: 85,
    userScore: 9.0,
    genres: ["Simulation", "Indie"],
    platforms: ["PC", "Switch", "PS5"],
    cover: img("photo-1419242902214-272b3f66ee7a"),
    hero: img("photo-1462331940025-496dfbfc7564", 1920, 900),
    screenshots: [img("photo-1419242902214-272b3f66ee7a")],
    shortDescription: "Cozy farming on a tiny moon.",
    description:
      "Harvest Orbit takes the farm sim into low gravity. Engineer hydroponics, befriend a research crew, and slowly turn a research outpost into a thriving little town that ships its produce home.",
  },
];

export const getGame = (slug: string) => games.find((g) => g.slug === slug);
export const featuredGames = () => games.filter((g) => g.featured);
export const trendingGames = () => games.filter((g) => g.trending);
