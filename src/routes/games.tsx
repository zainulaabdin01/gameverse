import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Library } from "lucide-react";
import { GameCard } from "@/components/GameCard";
import { games, type Genre, type Platform } from "@/data/games";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";

const GENRES: Genre[] = [
  "Action", "RPG", "Shooter", "Strategy", "Adventure", "Sports",
  "Racing", "Indie", "MMO", "Fighting", "Simulation", "Horror",
];
const PLATFORMS: Platform[] = ["PC", "PS5", "Xbox", "Switch"];

type Sort = "popularity" | "rating" | "release" | "az";

export const Route = createFileRoute("/games")({
  head: () => ({
    meta: [
      { title: "Game Directory — Gameverse" },
      {
        name: "description",
        content:
          "Searchable library of thousands of games. Filter by genre, platform, or rating to find your next obsession.",
      },
      { property: "og:title", content: "Game Directory — Gameverse" },
      {
        property: "og:description",
        content: "Find your next favorite game across PC, PS5, Xbox and Switch.",
      },
    ],
  }),
  component: GameDirectory,
});

function GameDirectory() {
  const mounted = useMounted();
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState<Genre | "all">("all");
  const [platform, setPlatform] = useState<Platform | "all">("all");
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<Sort>("popularity");

  const results = useMemo(() => {
    const filtered = games
      .filter((g) =>
        query.trim() === "" ? true : g.title.toLowerCase().includes(query.toLowerCase()),
      )
      .filter((g) => (genre === "all" ? true : g.genres.includes(genre)))
      .filter((g) => (platform === "all" ? true : g.platforms.includes(platform)))
      .filter((g) => g.rating >= minRating);

    switch (sort) {
      case "rating":
        return filtered.sort((a, b) => b.rating - a.rating);
      case "release":
        return filtered.sort((a, b) => b.releaseYear - a.releaseYear);
      case "az":
        return filtered.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return filtered.sort(
          (a, b) =>
            Number(!!b.trending) - Number(!!a.trending) || b.userScore - a.userScore,
        );
    }
  }, [query, genre, platform, minRating, sort]);

  return (
    <div className="relative">
      {/* Nameplate — same editorial header as News / Esports */}
      <header className="relative overflow-hidden border-b border-border/60 bg-surface/20">
        <div className="bg-aurora absolute inset-0 opacity-40" />
        <div className="bg-grid absolute inset-0 opacity-[0.12]" />
        <div className="absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-primary/15 blur-[110px]" />
        <div className="absolute -bottom-32 -right-32 h-[420px] w-[420px] rounded-full bg-accent/15 blur-[110px]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-background" />
        <div className="relative mx-auto max-w-[1400px] px-4 md:px-8">
          <div className="flex items-center justify-between border-b border-border/40 py-2 font-mono-accent text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
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
            <span className="hidden sm:inline">Catalogue · {games.length} titles</span>
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Updated daily
            </span>
          </div>

          <div className="flex flex-col items-center py-6 text-center md:py-8">
            <div className="font-mono-accent text-[10px] uppercase tracking-[0.4em] text-primary">
              The Gameverse Library
            </div>
            <h1
              className="mt-2 font-display font-bold leading-none tracking-tight"
              style={{ fontSize: "clamp(2rem, 5.5vw, 4rem)" }}
            >
              Game<span className="italic font-medium text-muted-foreground"> &amp; </span>
              <span className="gradient-text">Directory</span>
            </h1>
            <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="h-px w-8 bg-border" />
              Filter by genre, platform or rating — find your next obsession
              <span className="h-px w-8 bg-border" />
            </div>
          </div>
        </div>
      </header>

      {/* Sticky filter bar — matches News */}
      <div className="sticky top-16 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1400px] px-4 py-3 md:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search the catalogue…"
                className="w-full rounded-lg border border-border bg-surface/70 px-9 py-2 text-sm placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform | "all")}
                className="rounded-lg border border-border bg-surface/70 px-3 py-2 text-sm focus:border-primary/60 focus:outline-none"
              >
                <option value="all">All platforms</option>
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="rounded-lg border border-border bg-surface/70 px-3 py-2 text-sm focus:border-primary/60 focus:outline-none"
              >
                <option value={0}>Any rating</option>
                <option value={70}>70+</option>
                <option value={80}>80+</option>
                <option value={90}>90+</option>
              </select>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="rounded-lg border border-border bg-surface/70 px-3 py-2 text-sm focus:border-primary/60 focus:outline-none"
              >
                <option value="popularity">Sort: Popularity</option>
                <option value="rating">Sort: Rating</option>
                <option value="release">Sort: Newest</option>
                <option value="az">Sort: A–Z</option>
              </select>
            </div>
          </div>
          <div className="mt-3 -mx-4 flex gap-2 overflow-x-auto px-4 scrollbar-none md:mx-0 md:px-0">
            <Chip active={genre === "all"} onClick={() => setGenre("all")}>
              All genres
            </Chip>
            {GENRES.map((g) => (
              <Chip key={g} active={genre === g} onClick={() => setGenre(g)}>
                {g}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-[1400px] px-4 py-12 md:px-8 md:py-16">
        <div className="flex items-end justify-between gap-4">
          <SectionEyebrow icon={<Library className="h-3.5 w-3.5" />} label="The Catalogue" />
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setGenre("all");
              setPlatform("all");
              setMinRating(0);
              setSort("popularity");
            }}
            className="text-xs font-medium text-muted-foreground hover:text-primary"
          >
            Reset filters
          </button>
        </div>

        <div className="mt-4 mb-6 text-sm text-muted-foreground">
          <span className="text-foreground font-semibold">{results.length}</span>{" "}
          game{results.length === 1 ? "" : "s"} found
        </div>

        {results.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border bg-surface/40 text-sm text-muted-foreground">
            Nothing matches that filter. Try widening it.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {results.map((g) => (
              <GameCard key={g.slug} game={g} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SectionEyebrow({ icon, label }: { icon?: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px w-10 bg-gradient-to-r from-primary to-transparent" />
      <div className="flex items-center gap-1.5 font-mono-accent text-[11px] uppercase tracking-[0.32em] text-primary">
        {icon}
        {label}
      </div>
    </div>
  );
}

function Chip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all",
        active
          ? "border-primary/60 bg-primary/15 text-primary shadow-glow"
          : "border-border bg-surface/60 text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
