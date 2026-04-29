export type NewsSource =
  | "IGN"
  | "Kotaku"
  | "Dot Esports"
  | "PC Gamer"
  | "Eurogamer"
  | "Polygon"
  | "GameSpot";

export type NewsCategory =
  | "Esports"
  | "Reviews"
  | "Industry"
  | "Updates"
  | "Drama"
  | "Hardware";

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  source: NewsSource;
  category: NewsCategory;
  author: string;
  publishedAt: string; // ISO
  cover: string;
  relatedGameSlug?: string;
  featured?: boolean;
  reads?: number;
}

const img = (id: string, w = 1200, h = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 3600_000).toISOString();

export const articles: Article[] = [
  {
    slug: "afterlight-game-of-the-year-frontrunner",
    title: "Afterlight is the Game of the Year frontrunner — and it's only April",
    excerpt:
      "Lantern North's anthology adventure has redefined what a 'narrative game' can be, and the awards conversation has already started.",
    body: [
      "It's rare for a game to land in spring and dominate the Game of the Year conversation before E3 even happens. Afterlight has done exactly that.",
      "Built around five photographers documenting the same impossible day, the game uses perspective as its core mechanic. Each chapter changes what you saw in the last one — sometimes by a degree, sometimes catastrophically.",
      "Critics are already calling it the most confident debut from a major publisher in a decade. We sat down with creative director Mira Velez to talk about what comes next.",
    ],
    source: "IGN",
    category: "Reviews",
    author: "Jordan Kell",
    publishedAt: hoursAgo(2),
    cover: img("photo-1493711662062-fa541adb3fc8"),
    relatedGameSlug: "afterlight",
    featured: true,
    reads: 184_000,
  },
  {
    slug: "valor-arena-champions-bracket-set",
    title: "Valor Arena Champions: full bracket revealed, Sentinel drawn into 'group of death'",
    excerpt:
      "The 16-team Champions bracket is locked. North America's top seed faces the toughest path to the trophy.",
    body: [
      "Riot Forge's Valor Arena Champions kicks off Friday with sixteen teams from five regions, a record-breaking $4M prize pool, and a bracket that has already broken several Discord servers.",
      "Top seed Sentinel was drawn alongside reigning EU champions Iron Maple and Korean dark horse Black Lotus — a path the analyst desk is already calling unsurvivable.",
      "Action begins Friday at 14:00 CET, broadcast in twelve languages.",
    ],
    source: "Dot Esports",
    category: "Esports",
    author: "Sami Ortega",
    publishedAt: hoursAgo(4),
    cover: img("photo-1542751110-97427bbecf20"),
    relatedGameSlug: "valor-arena",
    featured: true,
    reads: 96_400,
  },
  {
    slug: "neon-protocol-mod-tools",
    title: "Vector Foundry confirms full mod tools for Neon Protocol this fall",
    excerpt:
      "After months of community pressure, the studio is shipping the same internal toolchain it used to build the campaign.",
    body: [
      "Vector Foundry confirmed Tuesday that Neon Protocol will receive a full mod SDK in October — including the campaign editor, AI behavior graphs, and weapon scripting tools used internally.",
      "Studio head Kenta Iwasaki said the team had 'been building toward this since pre-production.'",
    ],
    source: "PC Gamer",
    category: "Updates",
    author: "Reese Park",
    publishedAt: hoursAgo(8),
    cover: img("photo-1518709268805-4e9042af2176"),
    relatedGameSlug: "neon-protocol",
    reads: 41_200,
  },
  {
    slug: "kazoku-fighters-rollback-patch",
    title: "Kazoku Fighters' new rollback patch is the smoothest fighter netcode of the year",
    excerpt:
      "Tournament organizers say the latest patch is finally tournament-ready for online qualifiers.",
    body: [
      "After three months of community testing, Iron Glove's rollback overhaul has hit live servers — and the FGC is unanimously calling it a triumph.",
      "Several upcoming majors have already announced they'll allow online qualifiers using the new netcode, a first for the game.",
    ],
    source: "Polygon",
    category: "Updates",
    author: "Devon Maine",
    publishedAt: hoursAgo(11),
    cover: img("photo-1511512578047-dfb367046420"),
    relatedGameSlug: "kazoku-fighters",
    reads: 28_900,
  },
  {
    slug: "indie-publisher-layoffs",
    title: "Mid-tier indie publisher Pulse Games confirms second round of layoffs",
    excerpt:
      "30 staff affected as the publisher restructures around its live-service portfolio.",
    body: [
      "Pulse Games confirmed a second round of layoffs Wednesday, citing 'difficult market conditions' and a strategic refocus on its live-service catalogue.",
      "Around 30 staff are affected, with most cuts hitting the company's narrative and external-relations teams.",
    ],
    source: "Eurogamer",
    category: "Industry",
    author: "Holly Brennan",
    publishedAt: hoursAgo(14),
    cover: img("photo-1551103782-8ab07afd45c1"),
    reads: 52_800,
  },
  {
    slug: "eldoria-rising-review",
    title: "Eldoria Rising review: a fantasy RPG that finally trusts its players",
    excerpt:
      "Northwind Studios delivers the most ambitious open-world RPG since the genre's last golden age.",
    body: [
      "Eldoria Rising is huge in a way modern open worlds rarely allow themselves to be.",
      "Where most games of this scale corral you with quest markers and clean little arcs, Northwind has built something that lets you wander, get lost, fail upward, and stumble into stories no quest log will ever record.",
    ],
    source: "GameSpot",
    category: "Reviews",
    author: "Mira Tanaka",
    publishedAt: daysAgo(1),
    cover: img("photo-1542751371-adc38448a05e"),
    relatedGameSlug: "eldoria-rising",
    featured: true,
    reads: 212_300,
  },
  {
    slug: "starforge-second-expansion",
    title: "Starforge Odyssey's second expansion arrives in June with full ship-to-ship boarding",
    excerpt: "Helios Labs goes deeper on the spacefaring sim with a feature fans have begged for.",
    body: [
      "Helios Labs unveiled the next major expansion for Starforge Odyssey at its summer showcase: 'Hollow Stars.'",
      "The headline feature is full ship-to-ship boarding, plus a new faction whose entire economy is built around piracy.",
    ],
    source: "IGN",
    category: "Updates",
    author: "Casey Wren",
    publishedAt: daysAgo(1),
    cover: img("photo-1419242902214-272b3f66ee7a"),
    relatedGameSlug: "starforge-odyssey",
    reads: 73_200,
  },
  {
    slug: "esports-league-relegation",
    title: "League of Legends EU League relegates two storied orgs after disastrous split",
    excerpt: "Two of the league's founding teams face a year out of the top tier.",
    body: [
      "After a brutal final week, the LEC has confirmed relegation for two of its founding orgs.",
      "Both teams will play in the Challenger circuit next year, ending an unbroken decade in Europe's top flight.",
    ],
    source: "Dot Esports",
    category: "Esports",
    author: "Linnea Holm",
    publishedAt: daysAgo(2),
    cover: img("photo-1552820728-8b83bb6b773f"),
    reads: 64_700,
  },
  {
    slug: "cs2-major-paris",
    title: "CS2 Paris Major sells out in 11 minutes",
    excerpt: "All four days of the playoffs sold out faster than any major in the game's history.",
    body: [
      "Tickets for the CS2 Paris Major sold out in 11 minutes flat this morning, the fastest the event has ever cleared.",
      "Resale already shows finals tickets trading at over 8x face value.",
    ],
    source: "Dot Esports",
    category: "Esports",
    author: "Jules Marin",
    publishedAt: daysAgo(2),
    cover: img("photo-1542751110-97427bbecf20"),
    reads: 88_500,
  },
  {
    slug: "controversy-microtransactions",
    title: "Backlash mounts as AAA shooter quietly reintroduces $25 cosmetic bundles",
    excerpt: "Players spotted the change in a 4GB patch this morning. The community is not pleased.",
    body: [
      "A weekend patch quietly reintroduced premium cosmetic bundles to one of last year's biggest shooters.",
      "Reaction across community channels has been overwhelmingly negative, with the official subreddit going private in protest.",
    ],
    source: "Kotaku",
    category: "Drama",
    author: "Sloane Park",
    publishedAt: daysAgo(3),
    cover: img("photo-1551103782-8ab07afd45c1"),
    reads: 134_200,
  },
  {
    slug: "hollow-tides-soundtrack",
    title: "Hollow Tides composer talks scoring grief without overscoring it",
    excerpt: "An interview with the BAFTA-winning composer behind the year's most discussed indie.",
    body: [
      "Composer Saoirse Lin spent two years building the soundtrack to Hollow Tides — and she threw most of it away.",
      "We talked to her about negative space, leaving the player room to feel, and the cello section that nearly didn't make it in.",
    ],
    source: "Polygon",
    category: "Reviews",
    author: "Devon Maine",
    publishedAt: daysAgo(3),
    cover: img("photo-1517816743773-6e0fd518b4a6"),
    relatedGameSlug: "hollow-tides",
    reads: 47_800,
  },
  {
    slug: "next-gen-handheld-leak",
    title: "Leaked benchmarks suggest a new handheld is targeting PS5-tier performance",
    excerpt: "Synthetic numbers point to a portable that punches well above its weight.",
    body: [
      "A trio of synthetic benchmark leaks this week has reignited speculation about an unannounced handheld targeting near-console performance in a portable form factor.",
      "Industry analysts are split on whether the device is real, a dev kit, or a very elaborate fake.",
    ],
    source: "PC Gamer",
    category: "Hardware",
    author: "Reese Park",
    publishedAt: daysAgo(4),
    cover: img("photo-1531297484001-80022131f5a1"),
    reads: 91_600,
  },
  {
    slug: "dota-international-host-city",
    title: "The International returns to Seattle for its 15th anniversary",
    excerpt: "Valve confirms the marquee Dota 2 tournament will come home this October.",
    body: [
      "Valve confirmed today that The International 15 will be hosted in Seattle this October — a homecoming for the tournament's anniversary.",
      "The main event will be held at Climate Pledge Arena across four days.",
    ],
    source: "Dot Esports",
    category: "Esports",
    author: "Jules Marin",
    publishedAt: daysAgo(5),
    cover: img("photo-1493711662062-fa541adb3fc8"),
    reads: 73_900,
  },
  {
    slug: "midnight-patrol-co-op-update",
    title: "Midnight Patrol's free 'Long Way Home' update doubles its map",
    excerpt: "Beacon House's surprise expansion adds a new region and a four-player mode.",
    body: [
      "Beacon House surprise-dropped a free update for Midnight Patrol overnight, doubling the playable area and adding optional four-player support.",
    ],
    source: "Eurogamer",
    category: "Updates",
    author: "Holly Brennan",
    publishedAt: daysAgo(5),
    cover: img("photo-1509198397868-475647b2a1e5"),
    relatedGameSlug: "midnight-patrol",
    reads: 33_400,
  },
  {
    slug: "studio-acquisition-aurora",
    title: "Aurora Interactive acquires beloved indie studio in nine-figure deal",
    excerpt: "The publisher continues its aggressive acquisition spree.",
    body: [
      "Aurora Interactive has acquired indie darling Lantern North in a nine-figure deal that closed late Friday.",
      "Lantern North's leadership will remain in place, and the studio will operate independently within Aurora's portfolio.",
    ],
    source: "IGN",
    category: "Industry",
    author: "Casey Wren",
    publishedAt: daysAgo(6),
    cover: img("photo-1559717865-a99cac1c95d8"),
    reads: 105_700,
  },
  {
    slug: "valorant-agent-reveal",
    title: "Valorant's next agent leaked: a recon specialist with a deployable drone",
    excerpt: "Datamine reveals an unannounced agent's full kit weeks before reveal.",
    body: [
      "Datamine reports surfaced over the weekend revealing what appears to be Valorant's next agent — a recon specialist with a deployable drone.",
      "Riot has not commented officially.",
    ],
    source: "Dot Esports",
    category: "Esports",
    author: "Sami Ortega",
    publishedAt: daysAgo(6),
    cover: img("photo-1542751110-97427bbecf20"),
    reads: 88_300,
  },
  {
    slug: "cobalt-circuit-tour-mode",
    title: "Cobalt Circuit's Tour mode is the racing career mode of the decade",
    excerpt: "Apex Drift's living calendar makes every season feel personal.",
    body: [
      "Apex Drift's Tour mode in Cobalt Circuit treats a racing career like an actual sport — with sponsor politics, mid-season negotiations, and rivalries that ripple across years.",
    ],
    source: "GameSpot",
    category: "Reviews",
    author: "Mira Tanaka",
    publishedAt: daysAgo(7),
    cover: img("photo-1503376780353-7e6692767b70"),
    relatedGameSlug: "cobalt-circuit",
    reads: 41_500,
  },
  {
    slug: "ironhold-mod-of-the-month",
    title: "Ironhold's modding scene is one of the strangest things on PC",
    excerpt: "From sentient dwarves to a working in-game stock market, the mods are wild.",
    body: [
      "Ironhold has one of the most committed modding communities on PC.",
      "This month's standout mod adds a working in-game stock market that fluctuates based on dwarf morale.",
    ],
    source: "PC Gamer",
    category: "Updates",
    author: "Reese Park",
    publishedAt: daysAgo(8),
    cover: img("photo-1591491653056-4e0f9c2a0c87"),
    relatedGameSlug: "ironhold",
    reads: 22_300,
  },
];

export const getArticle = (slug: string) => articles.find((a) => a.slug === slug);
export const articlesByGame = (gameSlug: string) =>
  articles.filter((a) => a.relatedGameSlug === gameSlug);
export const featuredArticles = () => articles.filter((a) => a.featured);
export const sources: NewsSource[] = [
  "IGN",
  "Kotaku",
  "Dot Esports",
  "PC Gamer",
  "Eurogamer",
  "Polygon",
  "GameSpot",
];
export const categories: NewsCategory[] = [
  "Esports",
  "Reviews",
  "Industry",
  "Updates",
  "Drama",
  "Hardware",
];
