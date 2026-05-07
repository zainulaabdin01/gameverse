import { createFileRoute } from "@tanstack/react-router";
import { Gamepad2, Layers, Sparkles, Star, Users } from "lucide-react";
import { GameCard } from "@/components/GameCard";
import {
  CodeBlock,
  FieldRow,
  FieldTable,
  RefSectionHeading,
  ReferenceShell,
} from "@/components/reference/ReferenceShell";
import type { Game, Genre, Platform } from "@/data/games";

export const Route = createFileRoute("/reference/games")({
  head: () => ({
    meta: [
      { title: "Games field reference — Gameverse" },
      {
        name: "description",
        content:
          "Sample Game model fields, GameCard layout, and backend mapping for the catalogue and detail pages.",
      },
    ],
  }),
  component: GamesReferencePage,
});

const sampleGenres: Genre[] = ["RPG", "Adventure", "Action"];
const samplePlatforms: Platform[] = ["PC", "PS5", "Xbox"];

const sampleGame: Game = {
  slug: "reference-detail-atlas-of-echoes",
  title: "Atlas of Echoes",
  developer: "Northwind Samples Lab",
  publisher: "Aurora Interactive",
  releaseYear: 2026,
  rating: 93,
  userScore: 9.2,
  genres: sampleGenres,
  platforms: samplePlatforms,
  cover:
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&h=1000&q=80",
  hero: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1920&h=900&q=80",
  screenshots: [
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&h=800&q=80",
    "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=1200&h=800&q=80",
    "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&h=800&q=80",
  ],
  shortDescription: "Open-world narrative RPG with reactive factions and temporal combat loops.",
  description:
    "Atlas of Echoes is structured as a continent-wide memory war where political alliances and battlefield outcomes reshape district ownership in real time. Build a party around time-synced abilities, claim relic routes, and decide which cities remain independent under pressure from three rival powers.",
  trending: true,
  featured: true,
};

const similarGames: Game[] = [
  {
    ...sampleGame,
    slug: "reference-similar-1",
    title: "Rune of Dawnfall",
    rating: 90,
    userScore: 8.9,
    genres: ["RPG", "Action"],
    cover: "https://images.unsplash.com/photo-1559717865-a99cac1c95d8?auto=format&fit=crop&w=800&h=1000&q=80",
  },
  {
    ...sampleGame,
    slug: "reference-similar-2",
    title: "Siege of Volenta",
    rating: 89,
    userScore: 8.7,
    genres: ["Strategy", "Action"],
    cover: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&h=1000&q=80",
  },
  {
    ...sampleGame,
    slug: "reference-similar-3",
    title: "Starforge Odyssey",
    rating: 88,
    userScore: 8.5,
    genres: ["Adventure", "Simulation"],
    cover: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&h=1000&q=80",
  },
];

const sampleType = `export interface Game {
  slug: string;            // URL key
  title: string;
  developer: string;
  publisher: string;
  releaseYear: number;
  rating: number;          // critic 0-100
  userScore: number;       // user 0-10
  genres: Genre[];
  platforms: Platform[];
  cover: string;           // 4:5 portrait
  hero: string;            // 16:8 landscape
  screenshots: string[];
  shortDescription: string;
  description: string;
  trending?: boolean;
  featured?: boolean;
}`;

const sampleJson = `{
  "slug": "atlas-of-echoes",
  "title": "Atlas of Echoes",
  "developer": "Northwind Studios",
  "publisher": "Aurora Interactive",
  "releaseYear": 2026,
  "rating": 93,
  "userScore": 9.2,
  "genres": ["RPG", "Adventure"],
  "platforms": ["PC", "PS5", "Xbox"],
  "cover": "https://cdn.gameverse.app/games/atlas-cover.jpg",
  "hero":  "https://cdn.gameverse.app/games/atlas-hero.jpg",
  "screenshots": ["...", "..."],
  "shortDescription": "Open-world narrative RPG...",
  "description": "Atlas of Echoes is structured...",
  "trending": true,
  "featured": true
}`;

const sections = [
  { id: "hero", index: "01", label: "Detail hero anatomy" },
  { id: "scores", index: "02", label: "Scores & key facts" },
  { id: "media", index: "03", label: "Media gallery" },
  { id: "related", index: "04", label: "Similar games rail" },
  { id: "schema", index: "05", label: "Schema & sample payload" },
  { id: "mapping", index: "06", label: "Backend mapping (IGDB)" },
];

function GamesReferencePage() {
  return (
    <ReferenceShell
      domain="Games"
      domainColor="#22d3ee"
      backTo="/games"
      backLabel="← Back to Game directory"
      title={
        <>
          The <span className="gradient-text">Games</span>
          <br />
          catalogue blueprint
        </>
      }
      description="A full game-detail composition — hero, dual scores, media gallery, key facts, related rails — all driven by one Game model. This page documents the contract end-to-end."
      stats={[
        { label: "Fields", value: "16" },
        { label: "Required", value: "13" },
        { label: "Image slots", value: "3" },
        { label: "Routes", value: "/games/$slug" },
      ]}
      sections={sections}
    >
      <section className="space-y-6">
        <RefSectionHeading
          id="hero"
          index="01"
          eyebrow="Hero"
          title="Cinematic detail hero"
          description="A 16:8 hero image anchored with genre chips, headline, description, and platform pills."
        />
        <div className="overflow-hidden rounded-3xl border border-border/60 bg-surface/30">
          <div className="relative aspect-[16/8]">
            <img src={sampleGame.hero} alt={sampleGame.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-2">
                {sampleGame.genres.map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full border border-primary/40 bg-primary/15 px-2.5 py-1 font-mono-accent text-[10px] uppercase tracking-wider text-primary"
                  >
                    {genre}
                  </span>
                ))}
              </div>
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight md:text-5xl">
                {sampleGame.title}
              </h2>
              <p className="mt-3 max-w-3xl text-sm text-muted-foreground md:text-base">
                {sampleGame.description}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {sampleGame.platforms.map((platform) => (
                  <span
                    key={platform}
                    className="rounded-full border border-border/60 bg-surface/80 px-3 py-1 font-mono-accent text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
                  >
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <RefSectionHeading
          id="scores"
          index="02"
          eyebrow="Scores & facts"
          title="Dual-score system + metadata"
          description="Critic and user scores live in parallel; key facts surface developer, publisher, release window."
        />
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <ScoreCard
                icon={<Star className="h-3.5 w-3.5 text-primary" />}
                label="Critic score"
                value={sampleGame.rating.toString()}
                hint="Universal critic consensus"
                accent="from-primary/20 to-transparent"
              />
              <ScoreCard
                icon={<Users className="h-3.5 w-3.5 text-accent" />}
                label="User score"
                value={sampleGame.userScore.toFixed(1)}
                hint="Community weighted"
                accent="from-accent/20 to-transparent"
              />
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/40 p-5">
              <p className="font-mono-accent text-[10px] uppercase tracking-[0.28em] text-primary">
                Status tags
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {sampleGame.trending && (
                  <span className="rounded-full bg-primary/15 px-3 py-1 text-xs text-primary">trending</span>
                )}
                {sampleGame.featured && (
                  <span className="rounded-full bg-accent/15 px-3 py-1 text-xs text-accent">featured</span>
                )}
                <span className="rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground">
                  released
                </span>
              </div>
            </div>
          </div>
          <aside className="rounded-2xl border border-border/60 bg-surface/40 p-6 lg:col-span-5">
            <div className="flex items-center gap-2 font-mono-accent text-[10px] uppercase tracking-[0.28em] text-primary">
              <Layers className="h-3.5 w-3.5" /> Key facts
            </div>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li><span className="font-medium text-foreground">Developer</span> — {sampleGame.developer}</li>
              <li><span className="font-medium text-foreground">Publisher</span> — {sampleGame.publisher}</li>
              <li><span className="font-medium text-foreground">Release year</span> — {sampleGame.releaseYear}</li>
              <li><span className="font-medium text-foreground">Primary genre</span> — {sampleGame.genres[0]}</li>
              <li><span className="font-medium text-foreground">Platforms</span> — {sampleGame.platforms.join(", ")}</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="space-y-6">
        <RefSectionHeading
          id="media"
          index="03"
          eyebrow="Media"
          title="Screenshot gallery"
          description="Use 16:9 screenshots in groups of three. The first image often doubles as social share preview."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {sampleGame.screenshots.map((shot, i) => (
            <div key={shot} className="group relative overflow-hidden rounded-xl border border-border/60">
              <img src={shot} alt={`${sampleGame.title} screenshot ${i + 1}`} className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <span className="absolute left-2 top-2 rounded-md bg-background/80 px-2 py-0.5 font-mono-accent text-[10px] text-primary backdrop-blur">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <RefSectionHeading
          id="related"
          index="04"
          eyebrow="Discovery"
          title="Similar games rail"
          description="Recirculation grid uses the standard GameCard at portrait aspect."
        />
        <div className="flex items-center gap-2 font-mono-accent text-[10px] uppercase tracking-[0.28em] text-primary">
          <Gamepad2 className="h-3.5 w-3.5" /> GameCard · default
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {similarGames.map((game) => (
            <GameCard key={game.slug} game={game} asStatic />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <RefSectionHeading
          id="schema"
          index="05"
          eyebrow="Schema"
          title="Game model & sample payload"
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <CodeBlock language="typescript" filename="src/data/games.ts" code={sampleType} />
          <CodeBlock language="json" filename="GET /api/games/:slug" code={sampleJson} />
        </div>

        <FieldTable title="Game fields">
          <FieldRow name="slug" type="string" required desc="URL key for /games/$slug." />
          <FieldRow name="title" type="string" required desc="Display name." />
          <FieldRow name="developer" type="string" required desc="Primary studio." />
          <FieldRow name="publisher" type="string" required desc="Releasing label." />
          <FieldRow name="releaseYear" type="number" required desc="4-digit year." />
          <FieldRow name="rating" type="number (0–100)" required desc="Critic aggregate, normalized." />
          <FieldRow name="userScore" type="number (0–10)" required desc="Player aggregate." />
          <FieldRow name="genres" type="Genre[]" required desc="Enum array; powers chip filters." />
          <FieldRow name="platforms" type="Platform[]" required desc="PC | PS5 | Xbox | Switch." />
          <FieldRow name="cover" type="string (URL)" required desc="4:5 portrait, used in cards." />
          <FieldRow name="hero" type="string (URL)" required desc="16:8 landscape for detail hero." />
          <FieldRow name="screenshots" type="string[]" required desc="≥3 16:9 images." />
          <FieldRow name="shortDescription" type="string" required desc="Card subtitle, ~120 chars." />
          <FieldRow name="description" type="string" required desc="Full long-form summary." />
          <FieldRow name="trending" type="boolean?" desc="Promotes into the trending rail." />
          <FieldRow name="featured" type="boolean?" desc="Promotes into editorial spotlight." />
        </FieldTable>
      </section>

      <section className="space-y-6">
        <RefSectionHeading
          id="mapping"
          index="06"
          eyebrow="Backend"
          title="IGDB-style upstream mapping"
          description="When wiring an external catalogue API, normalize fields into the Game shape."
        />
        <div className="grid gap-4 md:grid-cols-2">
          <ul className="space-y-3 rounded-2xl border border-border/60 bg-background/40 p-6 text-sm text-muted-foreground">
            <li className="flex items-center gap-2 font-mono-accent text-[10px] uppercase tracking-[0.28em] text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Suggested mapping
            </li>
            <li><code className="text-foreground">game.id</code> → keep internal; expose <code className="text-foreground">slug</code>.</li>
            <li><code className="text-foreground">game.name</code> → <code className="text-foreground">title</code>.</li>
            <li><code className="text-foreground">involved_companies</code> → <code className="text-foreground">developer</code> / <code className="text-foreground">publisher</code>.</li>
            <li><code className="text-foreground">first_release_date.year</code> → <code className="text-foreground">releaseYear</code>.</li>
            <li><code className="text-foreground">aggregated_rating</code> → <code className="text-foreground">rating</code> (0–100).</li>
            <li><code className="text-foreground">rating</code> → <code className="text-foreground">userScore</code> (÷10).</li>
            <li><code className="text-foreground">genres · platforms</code> → enum unions.</li>
            <li><code className="text-foreground">cover.url · artworks</code> → <code className="text-foreground">cover</code>, <code className="text-foreground">hero</code>, <code className="text-foreground">screenshots</code>.</li>
          </ul>
          <div className="rounded-2xl border border-dashed border-border/80 bg-surface/30 p-6 text-sm text-muted-foreground">
            <p className="font-display text-base font-semibold text-foreground">Image strategy</p>
            <p className="mt-2">
              Cover and hero serve different aspect ratios. Don't reuse one for the other — the hero
              gradient depends on a wide composition for legibility.
            </p>
            <p className="mt-3">
              Run all media through a CDN with <code>auto=format&amp;fit=crop</code> query params so
              cards stay sharp at every breakpoint.
            </p>
            <div className="mt-5 rounded-xl border border-primary/30 bg-primary/10 p-4">
              <p className="font-mono-accent text-[10px] uppercase tracking-[0.22em] text-primary">Tip</p>
              <p className="mt-1.5 text-foreground/90">
                Validate <code>genres</code> and <code>platforms</code> against the enum at the edge — the
                directory's filters depend on exact-match strings.
              </p>
            </div>
          </div>
        </div>
      </section>
    </ReferenceShell>
  );
}

function ScoreCard({
  icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  accent: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border/60 bg-background/50 p-5`}>
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent}`} />
      <div className="relative">
        <div className="flex items-center gap-2 font-mono-accent text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
          {icon}
          {label}
        </div>
        <p className="mt-3 font-display text-4xl font-bold tabular-nums">{value}</p>
        <p className="text-sm text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}
