import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Flame, Trophy, Newspaper, Play, Radio, Gamepad2 } from "lucide-react";
import { ArticleCard } from "@/components/ArticleCard";
import { GameCard } from "@/components/GameCard";
import { MatchCard } from "@/components/MatchCard";
import { SectionHeader } from "@/components/SectionHeader";
import { articles, featuredArticles } from "@/data/news";
import { featuredGames, trendingGames } from "@/data/games";
import { liveMatches, upcomingMatches, getTeam } from "@/data/esports";

export const Route = createFileRoute("/")({
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
  const heroes = featuredArticles();
  const lead = heroes[0];
  const subLeads = heroes.slice(1, 4);
  const live = liveMatches();
  const upcoming = upcomingMatches().slice(0, 3);
  const topStories = articles.filter((a) => !a.featured).slice(0, 6);
  const trending = articles.slice(0, 5);
  const games = featuredGames();
  const hot = trendingGames();
  const featuredGame = games[0];

  return (
    <>
      {/* ============================================================
          HERO — editorial split: massive headline left, lead story right
          ============================================================ */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="bg-grid absolute inset-0 opacity-[0.35]" />
        <div className="bg-aurora absolute inset-0 opacity-60" />
        <div className="relative mx-auto max-w-[1400px] px-4 pb-16 pt-14 md:px-8 md:pb-24 md:pt-20">
          {/* Top meta bar */}
          <div className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono-accent text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            <span className="flex items-center gap-2 text-primary">
              <span className="live-dot" /> Issue 042 · Live
            </span>
            <span className="hidden md:inline">Wed, Apr 29</span>
            <span className="hidden md:inline">{articles.length} stories today</span>
            <span className="hidden md:inline">{live.length} matches running</span>
          </div>

          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            {/* LEFT — Big statement */}
            <div className="lg:col-span-6 animate-fade-up">
              <h1 className="font-display text-[clamp(2.75rem,7vw,5.5rem)] font-bold leading-[0.95] tracking-tight">
                Every story.
                <br />
                Every score.
                <br />
                <span className="gradient-text">Every game.</span>
              </h1>
              <p className="mt-6 max-w-md text-base text-muted-foreground md:text-lg">
                One hub for gaming news, live esports, and a searchable directory of
                thousands of titles. Stop chasing five tabs — start here.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/news"
                  className="group flex items-center gap-2 rounded-full gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
                >
                  <Newspaper className="h-4 w-4" />
                  Today's headlines
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/esports"
                  className="flex items-center gap-2 rounded-full border border-border/80 bg-surface/60 px-5 py-2.5 text-sm font-medium hover:border-accent/50 hover:text-accent transition-colors"
                >
                  <Radio className="h-4 w-4" />
                  Watch live matches
                </Link>
              </div>

              {/* Stat band */}
              <dl className="mt-12 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60">
                <Stat label="Outlets" value="14" />
                <Stat label="Live now" value={String(live.length).padStart(2, "0")} accent />
                <Stat label="Games" value="2.4K" />
              </dl>
            </div>

            {/* RIGHT — Lead story + 3 stacked sub-leads */}
            <div className="lg:col-span-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
              {lead && (
                <ArticleCard
                  article={lead}
                  variant="featured"
                  className="sm:col-span-2"
                />
              )}
              {subLeads.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          COMMAND DECK — Live esports rail w/ upcoming + game spotlight
          Asymmetric: 8/4 split
          ============================================================ */}
      <section className="relative border-b border-border/60 bg-surface/30">
        <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-20">
          <SectionHeader
            index="01"
            eyebrow="Command deck"
            title="Live & next on the wire"
            description="Score updates as they happen across Valorant, CS2, League and Dota."
            to="/esports"
            cta="All esports"
          />

          <div className="grid gap-5 lg:grid-cols-12">
            <div className="lg:col-span-8 grid gap-4 sm:grid-cols-2">
              {[...live, ...upcoming].slice(0, 4).map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>

            {/* Featured game card — vertical poster */}
            {featuredGame && (
              <Link
                to="/games/$slug"
                params={{ slug: featuredGame.slug }}
                className="group relative lg:col-span-4 overflow-hidden rounded-2xl border border-border/60 bg-surface hover-lift"
              >
                <div className="relative aspect-[4/5] lg:aspect-auto lg:h-full overflow-hidden">
                  <img
                    src={featuredGame.hero}
                    alt={featuredGame.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/10" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <div className="font-mono-accent text-[10px] uppercase tracking-[0.25em] text-accent">
                    ▍ Game spotlight
                  </div>
                  <h3 className="mt-3 font-display text-2xl font-bold leading-tight group-hover:gradient-text transition-colors">
                    {featuredGame.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {featuredGame.shortDescription}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2 font-mono-accent text-[10px] uppercase">
                    <span className="rounded-full bg-primary/15 px-2 py-1 text-primary">
                      {featuredGame.rating}/100
                    </span>
                    {featuredGame.genres.slice(0, 2).map((g) => (
                      <span key={g} className="rounded-full bg-surface-3 px-2 py-1 text-muted-foreground">
                        {g}
                      </span>
                    ))}
                    <span className="ml-auto flex items-center gap-1 text-foreground">
                      Explore <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================
          DESTINATIONS — three quick portals
          ============================================================ */}
      <section className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-20">
        <div className="mb-10 max-w-2xl">
          <div className="font-mono-accent text-[11px] uppercase tracking-[0.25em] text-primary">
            ▍ Pick your lane
          </div>
          <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold leading-tight">
            Three destinations.{" "}
            <span className="gradient-text">One universe.</span>
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <DestinationCard
            to="/news"
            number="A"
            icon={Newspaper}
            title="News Hub"
            kicker="Read everything, fast"
            desc="A unified feed pulling from IGN, Kotaku, Dot Esports, PC Gamer and more — no subreddit hopping required."
          />
          <DestinationCard
            to="/esports"
            number="B"
            icon={Trophy}
            title="Esports Stats"
            kicker="Live matches & standings"
            desc="Live scoreboards, standings, and player ratings for the biggest tournaments in Valorant, CS2, League and Dota."
            accent
          />
          <DestinationCard
            to="/games"
            number="C"
            icon={Gamepad2}
            title="Game Directory"
            kicker="Find your next obsession"
            desc="Search thousands of titles by genre, platform or rating. Descriptions and recent news come baked in."
          />
        </div>
      </section>

      {/* ============================================================
          THE BRIEFING — magazine-style top stories + numbered trending
          ============================================================ */}
      <section className="relative border-y border-border/60 bg-surface/20">
        <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-20">
          <SectionHeader
            index="02"
            eyebrow="The briefing"
            title="Top stories today"
            description="The biggest beats across the gaming world right now."
            to="/news"
            cta="News hub"
          />
          <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {topStories.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
            <aside className="lg:sticky lg:top-24 self-start rounded-2xl gradient-border bg-surface/60 p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">
                  Trending now
                </h3>
                <Flame className="h-4 w-4 text-primary" />
              </div>
              <ol className="mt-5 divide-y divide-border/60">
                {trending.map((a, i) => (
                  <li key={a.slug} className="group flex gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="font-display text-3xl font-bold leading-none gradient-text w-9 flex-shrink-0">
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
          SPOTLIGHT — featured games grid (intentional asymmetry)
          ============================================================ */}
      <section className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-20">
        <SectionHeader
          index="03"
          eyebrow="Spotlight"
          title="Featured games"
          description="Hand-picked across genres — start your next adventure here."
          to="/games"
          cta="Game directory"
        />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
          {games[0] && (
            <div className="col-span-2 row-span-2 md:col-span-3 md:row-span-2">
              <GameCard game={games[0]} size="lg" className="h-full" />
            </div>
          )}
          {games.slice(1, 5).map((g) => (
            <div key={g.slug} className="md:col-span-3 lg:col-span-3 xl:col-span-3">
              <GameCardWide game={g} />
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          HEAT CHECK — horizontal trending rail
          ============================================================ */}
      <section className="relative border-t border-border/60 bg-surface/20">
        <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-20">
          <SectionHeader
            index="04"
            eyebrow="Heat check"
            title="Trending in the community"
            description="What players are obsessed with this week."
            to="/games"
            cta="Browse all"
          />
          <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 scrollbar-none md:mx-0 md:px-0">
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
        <div className="bg-aurora absolute inset-0 opacity-50" />
        <div className="relative mx-auto max-w-[1400px] px-4 py-20 md:px-8 md:py-28 text-center">
          <div className="font-mono-accent text-[11px] uppercase tracking-[0.3em] text-accent">
            ▍ Welcome to the verse
          </div>
          <h2 className="mx-auto mt-4 max-w-3xl font-display text-4xl md:text-6xl font-bold leading-[1.05]">
            Stop juggling tabs.
            <br />
            <span className="gradient-text">Start playing.</span>
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-surface px-4 py-4 md:px-5 md:py-5">
      <div
        className={
          "font-display text-2xl md:text-3xl font-bold tabular-nums " +
          (accent ? "gradient-text" : "")
        }
      >
        {value}
      </div>
      <div className="mt-1 font-mono-accent text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function DestinationCard({
  to,
  number,
  icon: Icon,
  title,
  kicker,
  desc,
  accent,
}: {
  to: "/news" | "/esports" | "/games";
  number: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  kicker: string;
  desc: string;
  accent?: boolean;
}) {
  return (
    <Link
      to={to}
      className={
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-surface p-6 hover-lift " +
        (accent ? "hover:border-accent/50" : "hover:border-primary/50")
      }
    >
      <div className="flex items-start justify-between">
        <div
          className={
            "flex h-12 w-12 items-center justify-center rounded-xl " +
            (accent ? "bg-accent/15 text-accent" : "bg-primary/15 text-primary")
          }
        >
          <Icon className="h-5 w-5" />
        </div>
        <span className="font-mono-accent text-[11px] tracking-widest text-muted-foreground">
          0{number === "A" ? "1" : number === "B" ? "2" : "3"} / 03
        </span>
      </div>
      <div className="mt-6 font-mono-accent text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        {kicker}
      </div>
      <h3 className="mt-2 font-display text-2xl font-bold leading-tight group-hover:text-foreground">
        {title}
      </h3>
      <p className="mt-3 flex-1 text-sm text-muted-foreground">{desc}</p>
      <div className="mt-6 flex items-center gap-1.5 text-sm font-medium text-foreground">
        Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

function GameCardWide({ game }: { game: ReturnType<typeof featuredGames>[number] }) {
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
