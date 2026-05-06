import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Gamepad2, Layers, Sparkles, Star, Users } from "lucide-react";
import { GameCard } from "@/components/GameCard";
import { SectionHeader } from "@/components/SectionHeader";
import type { Game, Genre, Platform } from "@/data/games";
import { useMounted } from "@/hooks/use-mounted";

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
    cover:
      "https://images.unsplash.com/photo-1559717865-a99cac1c95d8?auto=format&fit=crop&w=800&h=1000&q=80",
    shortDescription: "High-pressure melee RPG with branching realm states.",
  },
  {
    ...sampleGame,
    slug: "reference-similar-2",
    title: "Siege of Volenta",
    rating: 89,
    userScore: 8.7,
    genres: ["Strategy", "Action"],
    cover:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&h=1000&q=80",
    shortDescription: "Massive faction warfare and destructible fortress systems.",
  },
  {
    ...sampleGame,
    slug: "reference-similar-3",
    title: "Starforge Odyssey",
    rating: 88,
    userScore: 8.5,
    genres: ["Adventure", "Simulation"],
    cover:
      "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&h=1000&q=80",
    shortDescription: "Fleet-building and narrative exploration at interstellar scale.",
  },
];

function GamesReferencePage() {
  const mounted = useMounted();

  return (
    <div className="relative">
      <header className="relative overflow-hidden border-b border-border/60 bg-surface/20">
        <div className="bg-aurora absolute inset-0 opacity-40" />
        <div className="bg-grid absolute inset-0 opacity-[0.12]" />
        <div className="absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-primary/15 blur-[110px]" />
        <div className="absolute -bottom-32 -right-32 h-[420px] w-[420px] rounded-full bg-accent/15 blur-[110px]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-background" />
        <div className="relative mx-auto max-w-[1400px] px-4 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 py-2 font-mono-accent text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            <span>
              {mounted
                ? new Date().toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : ""}
            </span>
            <span className="flex items-center gap-2">
              <BookOpen className="h-3 w-3 text-primary" />
              Reference · Game detail
            </span>
          </div>

          <div className="flex flex-col items-center py-6 text-center md:py-8">
            <div className="font-mono-accent text-[10px] uppercase tracking-[0.4em] text-primary">
              Implementation guide
            </div>
            <h1
              className="mt-2 font-display font-bold leading-none tracking-tight"
              style={{ fontSize: "clamp(2rem, 5.5vw, 3.25rem)" }}
            >
              Games<span className="italic font-medium text-muted-foreground"> detail </span>
              <span className="gradient-text">showcase</span>
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
              A full game-detail page composition with hero, score systems, key facts, gallery, and
              related content rails.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs">
              <Link
                to="/games"
                className="rounded-full border border-border/60 bg-surface/60 px-4 py-2 font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              >
                ← Back to Game directory
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] space-y-16 px-4 py-12 md:px-8 md:py-16">
        <section className="overflow-hidden rounded-3xl border border-border/60 bg-surface/30">
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
        </section>

        <section>
          <SectionHeader
            index="01"
            eyebrow="Core detail modules"
            title="Scores, key facts, and media gallery"
            description="A polished detail page combines review context, ownership metadata, and rich media in one fold."
          />
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/60 bg-background/50 p-5">
                  <div className="flex items-center gap-2 font-mono-accent text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                    <Star className="h-3.5 w-3.5 text-primary" />
                    Critic score
                  </div>
                  <p className="mt-3 font-display text-4xl font-bold">{sampleGame.rating}</p>
                  <p className="text-sm text-muted-foreground">Universal critic consensus</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/50 p-5">
                  <div className="flex items-center gap-2 font-mono-accent text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    User score
                  </div>
                  <p className="mt-3 font-display text-4xl font-bold">{sampleGame.userScore.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">Community weighted rating</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {sampleGame.screenshots.map((shot) => (
                  <div key={shot} className="overflow-hidden rounded-xl border border-border/60">
                    <img src={shot} alt={`${sampleGame.title} screenshot`} className="aspect-video w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
            <aside className="space-y-6 rounded-2xl border border-border/60 bg-surface/40 p-6 lg:col-span-5">
              <SectionEyebrow
                icon={<Layers className="h-3.5 w-3.5" />}
                label="Key facts"
              />
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">Developer</span> — {sampleGame.developer}
                </li>
                <li>
                  <span className="font-medium text-foreground">Publisher</span> — {sampleGame.publisher}
                </li>
                <li>
                  <span className="font-medium text-foreground">Release year</span> — {sampleGame.releaseYear}
                </li>
                <li>
                  <span className="font-medium text-foreground">Primary genre</span> — {sampleGame.genres[0]}
                </li>
                <li>
                  <span className="font-medium text-foreground">Platforms</span> — {sampleGame.platforms.join(", ")}
                </li>
                <li>
                  <span className="font-medium text-foreground">Status tags</span> — trending,
                  featured, and editorial spotlight.
                </li>
              </ul>
            </aside>
          </div>
        </section>

        <section>
          <SectionHeader
            index="02"
            eyebrow="Related modules"
            title="Related news and similar games"
            description="Detail pages should create horizontal discovery loops without leaving the theme."
          />
          <div className="grid gap-10 xl:grid-cols-12">
            <div className="space-y-4 xl:col-span-5">
              <SectionEyebrow icon={<Sparkles className="h-3.5 w-3.5" />} label="Related news" />
              <div className="space-y-3 rounded-2xl border border-border/60 bg-background/40 p-4">
                <p className="text-sm text-muted-foreground">
                  Narrative updates, patch analysis, and meta shifts tied to this game's ecosystem.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="rounded-lg border border-border/60 bg-surface/40 p-3">Afterlight roadmap deep-dive and creator tool launch timeline</li>
                  <li className="rounded-lg border border-border/60 bg-surface/40 p-3">Interview: quest designers on reactive kingdom arcs and pacing</li>
                  <li className="rounded-lg border border-border/60 bg-surface/40 p-3">Patch notes breakdown: economy tuning and endgame faction balance</li>
                </ul>
              </div>
            </div>
            <div className="space-y-4 xl:col-span-7">
              <SectionEyebrow icon={<Gamepad2 className="h-3.5 w-3.5" />} label="Similar games" />
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {similarGames.map((game) => (
                  <GameCard key={game.slug} game={game} asStatic />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border/60 pt-16">
          <SectionHeader
            index="03"
            eyebrow="Backend contract"
            title="Catalogue + detail field contract"
            description="Keep these mappings stable so hubs, filters, and detail modules render consistently."
          />
          <ul className="space-y-3 rounded-2xl border border-border/60 bg-background/40 p-6 text-sm text-muted-foreground">
            <li className="font-mono-accent text-[10px] uppercase tracking-wider text-primary">
              Suggested mapping
            </li>
            <li>
              <span className="text-foreground">game.slug</span> → public{" "}
              <span className="text-foreground">slug</span> for{" "}
              <code className="font-mono text-xs">/games/$slug</code>.
            </li>
            <li>
              <span className="text-foreground">game.name</span> →{" "}
              <span className="text-foreground">title</span>.
            </li>
            <li>
              <span className="text-foreground">involved_companies</span> →{" "}
              <span className="text-foreground">developer</span> /{" "}
              <span className="text-foreground">publisher</span> (pick primary credits).
            </li>
            <li>
              <span className="text-foreground">first_release_date.year</span> →{" "}
              <span className="text-foreground">releaseYear</span>.
            </li>
            <li>
              <span className="text-foreground">aggregated_rating</span> → normalize to{" "}
              <span className="text-foreground">rating</span> (0–100) and{" "}
              <span className="text-foreground">userScore</span> (0–10) for dual display contexts.
            </li>
            <li>
              <span className="text-foreground">genres · platforms</span> → parallel{" "}
              <span className="text-foreground">Genre[]</span> /{" "}
              <span className="text-foreground">Platform[]</span> unions for chip filters.
            </li>
            <li>
              <span className="text-foreground">cover.url · artworks</span> →{" "}
              <span className="text-foreground">cover</span>,{" "}
              <span className="text-foreground">hero</span>,{" "}
              <span className="text-foreground">screenshots</span>.
            </li>
            <li>
              <span className="text-foreground">summary · storyline</span> →{" "}
              <span className="text-foreground">shortDescription</span>,{" "}
              <span className="text-foreground">description</span>.
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}

function SectionEyebrow({ icon, label }: { icon?: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 font-mono-accent text-[11px] uppercase tracking-[0.32em] text-primary">
        <span className="h-px w-8 bg-primary" />
        {icon}
        Section
      </div>
      <h2 className="font-display text-xl md:text-2xl font-bold leading-none tracking-tight">
        {label}
      </h2>
      <span className="h-[2px] w-16 bg-gradient-to-r from-primary via-accent to-transparent" />
    </div>
  );
}
