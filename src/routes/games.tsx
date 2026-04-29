import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { GameCard } from "@/components/GameCard";
import { games, type Genre, type Platform } from "@/data/games";
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
    <div>
      <header className="border-b border-border/60 bg-surface/40">
        <div className="mx-auto max-w-[1400px] px-4 py-12 md:px-8">
          <div className="font-mono-accent text-[11px] uppercase tracking-[0.3em] text-primary">
            ▍ Game Directory
          </div>
          <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">
            Find your next <span className="gradient-text">obsession.</span>
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            A searchable library of thousands of games. Filter by genre, platform, or rating
            and dive in.
          </p>
        </div>
      </header>

      <div className="sticky top-16 z-30 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto max-w-[1400px] px-4 py-3 md:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search games…"
                className="w-full rounded-md border border-border bg-surface px-9 py-2 text-sm placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform | "all")}
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary/60 focus:outline-none"
              >
                <option value="all">All platforms</option>
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value as Genre | "all")}
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary/60 focus:outline-none"
              >
                <option value="all">All genres</option>
                {GENRES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary/60 focus:outline-none"
              >
                <option value={0}>Any rating</option>
                <option value={70}>70+</option>
                <option value={80}>80+</option>
                <option value={90}>90+</option>
              </select>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary/60 focus:outline-none"
              >
                <option value="popularity">Sort: Popularity</option>
                <option value="rating">Sort: Rating</option>
                <option value="release">Sort: Newest</option>
                <option value="az">Sort: A–Z</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-[1400px] px-4 py-10 md:px-8">
        <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            <span className="text-foreground font-semibold">{results.length}</span>{" "}
            game{results.length === 1 ? "" : "s"} found
          </span>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setGenre("all");
              setPlatform("all");
              setMinRating(0);
              setSort("popularity");
            }}
            className={cn(
              "text-xs font-medium",
              "text-muted-foreground hover:text-primary",
            )}
          >
            Reset filters
          </button>
        </div>

        {results.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border bg-surface text-sm text-muted-foreground">
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
