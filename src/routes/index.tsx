import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Flame, Play, Radio } from "lucide-react";
import { ArticleCard } from "@/components/ArticleCard";
import { GameCard } from "@/components/GameCard";
import { MatchCard } from "@/components/MatchCard";
import { SectionHeader } from "@/components/SectionHeader";
import { type Game } from "@/data/games";
import { liveMatches, upcomingMatches } from "@/data/esports";
import ctaVideo from "@/assets/cta-bg.mp4.asset.json";
import { getNewsHomepageFn } from "@/queries/news";
import { getGamesHomepageFn } from "@/queries/games";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [news, games] = await Promise.all([getNewsHomepageFn(), getGamesHomepageFn()]);
    return { news, games };
  },
  head: () => ({
    meta: [
      { title: "Gameverse — One place for everything gaming" },
      {
        name: "description",
        content:
          "Top gaming stories, live esports scores, and a searchable directory of thousands of games — all in one beautiful dark-mode hub.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { news, games: gamesData } = Route.useLoaderData();
  const { trending, featured: heroes, topStories } = news;
  const lead = heroes[0];
  const live = liveMatches();
  const upcoming = upcomingMatches().slice(0, 3);
  const games = gamesData.featured;
  const hot = gamesData.trending;

  return (
    <>
      {/* ============================================================
          HERO — fits exactly within viewport (minus 64px sticky nav)
          ============================================================ */}
      <section className="relative overflow-hidden h-[calc(100svh-4rem)] flex flex-col">
        {/* Atmosphere — layered for depth */}
        <div className="bg-aurora absolute inset-0 opacity-50" />
        <div className="bg-grid absolute inset-0 opacity-[0.18]" />
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-accent/20 blur-[120px]" />
        {/* Premium top hairline & bottom fade into next section */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-background" />

        <div className="relative mx-auto flex w-full max-w-[1400px] flex-1 min-h-0 flex-col px-6 pt-5 pb-6 md:px-10 md:pt-7 md:pb-10">
          {/* Eyebrow / masthead bar */}
          <div className="flex items-center justify-between font-mono-accent text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 text-primary">
                <span className="live-dot" /> On the wire
              </span>
              <span className="hidden h-px w-12 bg-border md:inline-block" />
              <span className="hidden md:inline">Issue 042 · Wed, Apr 29</span>
            </div>
            <span className="hidden md:inline text-accent">Vol. I — Gameverse Daily</span>
          </div>

          <div className="grid flex-1 min-h-0 items-center gap-6 py-4 lg:grid-cols-12 lg:gap-10">
            {/* LEFT — Massive statement */}
            <div className="lg:col-span-7 animate-fade-up flex flex-col min-h-0">
              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono-accent text-[10px] uppercase tracking-[0.25em] text-primary">
                <Flame className="h-3 w-3" />
                The hub for players
              </div>
              <h1 className="font-display font-bold leading-[0.85] tracking-tighter text-[clamp(2.75rem,8.5vw,7rem)]">
                Everything
                <br />
                <span className="italic font-light text-muted-foreground/80">gaming.</span>{" "}
                <span className="gradient-text">One place.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg leading-relaxed">
                News, live esports, and a directory of thousands of games —
                under one roof.{" "}
                <span className="text-foreground">No more juggling tabs.</span>
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  to="/games"
                  className="group flex items-center gap-2 rounded-full gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
                >
                  <Play className="h-4 w-4" />
                  Explore the verse
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/esports"
                  className="flex items-center gap-2 rounded-full border border-border/80 bg-surface/40 px-6 py-3 text-sm font-medium backdrop-blur hover:border-accent/50 hover:text-accent transition-colors"
                >
                  <Radio className="h-4 w-4" />
                  Live matches
                </Link>
              </div>
            </div>

            {/* RIGHT — lead story poster, constrained to viewport */}
            {lead && (
              <div className="hidden lg:flex lg:col-span-5 animate-fade-up flex-col min-h-0">
                <div className="mb-3 flex items-center justify-between font-mono-accent text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  <span className="text-accent">▍ Lead story</span>
                  <span>01 / {heroes.length.toString().padStart(2, "0")}</span>
                </div>
                <div className="relative flex-1 min-h-0">
                  <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/20 via-transparent to-accent/20 blur-2xl" />
                  <div className="relative h-full overflow-hidden rounded-2xl">
                    <ArticleCard article={lead} variant="featured" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stat strip — bottom anchored, premium ticker style */}
          <div className="mt-auto grid grid-cols-3 gap-4 border-t border-border/60 pt-4 md:gap-8">
            {[
              { k: "12K+", v: "Games indexed" },
              { k: "240", v: "Live matches / wk" },
              { k: "Daily", v: "Editorial briefing" },
            ].map((s) => (
              <div key={s.v}>
                <div className="font-display text-xl font-bold gradient-text md:text-2xl">
                  {s.k}
                </div>
                <div className="mt-0.5 font-mono-accent text-[9px] uppercase tracking-wider text-muted-foreground md:text-[10px]">
                  {s.v}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          COMMAND DECK — Live esports
          ============================================================ */}
      <section className="relative bg-surface/20">
        <div className="mx-auto max-w-[1280px] px-6 py-20 md:px-10 md:py-28">
          <SectionHeader
            index="01"
            eyebrow="Command deck"
            title="Live & next on the wire"
            description="Score updates as they happen across Valorant, CS2, League and Dota."
            to="/esports"
            cta="All esports"
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...live, ...upcoming].slice(0, 3).map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          THE BRIEFING — top stories + numbered trending
          ============================================================ */}
      <section className="relative border-y border-border/60">
        <div className="mx-auto max-w-[1280px] px-6 py-20 md:px-10 md:py-28">
          <SectionHeader
            index="02"
            eyebrow="The briefing"
            title="Top stories today"
            description="The biggest beats across the gaming world right now."
            to="/news"
            cta="News hub"
          />
          <div className="grid gap-12 lg:grid-cols-[1fr_300px]">
            <div className="grid gap-5 sm:grid-cols-2">
              {topStories.slice(0, 4).map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
            <aside className="lg:sticky lg:top-24 self-start rounded-2xl gradient-border bg-surface/40 p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">
                  Trending now
                </h3>
                <Flame className="h-4 w-4 text-primary" />
              </div>
              <ol className="mt-5 divide-y divide-border/60">
                {trending.map((a, i) => (
                  <li key={a.slug} className="group flex gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="font-display text-2xl font-bold leading-none gradient-text w-8 flex-shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <Link
                      to="/news/$slug"
                      params={{ slug: a.slug }}
                      className="min-w-0 flex-1"
                    >
                      <div className="text-[10px] font-mono-accent uppercase tracking-wider text-muted-foreground">
                        {a.source}
                      </div>
                      <h4 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary transition-colors">
                        {a.title}
                      </h4>
                    </Link>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        </div>
      </section>

      {/* ============================================================
          SPOTLIGHT — featured games (asymmetric)
          ============================================================ */}
      <section className="mx-auto max-w-[1280px] px-6 py-20 md:px-10 md:py-28">
        <SectionHeader
          index="03"
          eyebrow="Spotlight"
          title="Featured games"
          description="Hand-picked across genres — start your next adventure here."
          to="/games"
          cta="Game directory"
        />
        <div className="grid gap-4 md:grid-cols-12">
          {games[0] && (
            <Link
              to="/games/$slug"
              params={{ slug: games[0].slug }}
              className="group relative md:col-span-7 overflow-hidden rounded-2xl border border-border/60 bg-surface hover-lift"
            >
              <div className="relative aspect-[16/10] md:aspect-[16/11] overflow-hidden">
                <img
                  src={games[0].hero}
                  alt={games[0].title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                <div className="font-mono-accent text-[10px] uppercase tracking-[0.25em] text-primary">
                  ▍ Editor's pick
                </div>
                <h3 className="mt-3 font-display text-3xl md:text-4xl font-bold leading-tight group-hover:gradient-text">
                  {games[0].title}
                </h3>
                <p className="mt-2 max-w-md text-sm text-muted-foreground line-clamp-2">
                  {games[0].shortDescription}
                </p>
                <div className="mt-4 flex items-center gap-2 font-mono-accent text-[10px] uppercase">
                  <span className="rounded-full bg-primary/15 px-2 py-1 text-primary">
                    {games[0].rating}/100
                  </span>
                  {games[0].genres.slice(0, 2).map((g) => (
                    <span key={g} className="rounded-full bg-surface-3 px-2 py-1 text-muted-foreground">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          )}
          <div className="md:col-span-5 grid gap-4">
            {games.slice(1, 4).map((g) => (
              <GameCardWide key={g.slug} game={g} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          HEAT CHECK — horizontal trending rail
          ============================================================ */}
      <section className="relative border-t border-border/60 bg-surface/20">
        <div className="mx-auto max-w-[1280px] px-6 py-20 md:px-10 md:py-28">
          <SectionHeader
            index="04"
            eyebrow="Heat check"
            title="Trending in the community"
            description="What players are obsessed with this week."
            to="/games"
            cta="Browse all"
          />
          <div className="-mx-6 flex snap-x gap-4 overflow-x-auto px-6 scrollbar-none md:mx-0 md:px-0">
            {hot.map((g) => (
              <GameCard
                key={g.slug}
                game={g}
                className="w-44 flex-shrink-0 snap-start md:w-56"
                size="sm"
              />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          FINAL CTA
          ============================================================ */}
      <section className="relative overflow-hidden">
        {/* Background video */}
        <video
          src={ctaVideo.url}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />
        {/* Color/atmosphere overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/40 to-background" />
        <div className="bg-aurora absolute inset-0 opacity-50 mix-blend-screen" />
        <div className="bg-grid absolute inset-0 opacity-[0.12]" />
        <div className="relative mx-auto max-w-[1280px] px-6 py-28 md:px-10 md:py-40 text-center">
          <div className="font-mono-accent text-[11px] uppercase tracking-[0.3em] text-accent">
            ▍ Welcome to the verse
          </div>
          <h2 className="mx-auto mt-4 max-w-3xl font-display text-4xl md:text-6xl font-bold leading-[1.05]">
            Stop juggling tabs.
            <br />
            <span className="gradient-text">Start playing.</span>
          </h2>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/games"
              className="group flex items-center gap-2 rounded-full gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow"
            >
              <Play className="h-4 w-4" />
              Browse the directory
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/esports"
              className="flex items-center gap-2 rounded-full border border-border/80 bg-surface/60 px-6 py-3 text-sm font-medium hover:border-accent/50 hover:text-accent transition-colors"
            >
              See what's live
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* ─────────────────────────── helpers ─────────────────────────── */

function GameCardWide({ game }: { game: Game }) {
  return (
    <Link
      to="/games/$slug"
      params={{ slug: game.slug }}
      className="group relative flex h-full overflow-hidden rounded-xl border border-border/60 bg-surface hover-lift"
    >
      <div className="relative aspect-square w-28 flex-shrink-0 overflow-hidden">
        <img
          src={game.cover}
          alt={game.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 p-4">
        <div className="font-mono-accent text-[10px] uppercase tracking-wider text-muted-foreground">
          {game.genres[0]} · {game.platforms.slice(0, 2).join(" / ")}
        </div>
        <h3 className="font-display text-base font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-1">
          {game.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {game.shortDescription}
        </p>
        <div className="mt-1 flex items-center gap-2 font-mono-accent text-[10px] text-primary">
          ★ {game.rating}/100
        </div>
      </div>
    </Link>
  );
}
