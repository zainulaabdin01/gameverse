import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Flame, Trophy, Newspaper } from "lucide-react";
import { ArticleCard } from "@/components/ArticleCard";
import { GameCard } from "@/components/GameCard";
import { MatchCard } from "@/components/MatchCard";
import { SectionHeader } from "@/components/SectionHeader";
import { articles, featuredArticles } from "@/data/news";
import { featuredGames, trendingGames } from "@/data/games";
import { liveMatches, upcomingMatches } from "@/data/esports";

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
  const heroes = featuredArticles().slice(0, 3);
  const main = heroes[0];
  const sides = heroes.slice(1);
  const live = liveMatches();
  const upcoming = upcomingMatches().slice(0, 3);
  const topStories = articles.filter((a) => !a.featured).slice(0, 6);
  const trending = articles.slice(0, 5);
  const games = featuredGames();
  const hot = trendingGames();

  return (
    <div className="bg-radial-spotlight">
      {/* HERO */}
      <section className="relative">
        <div className="bg-grid absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-[1400px] px-4 pb-16 pt-12 md:px-8 md:pt-16">
          <div className="mb-8 max-w-2xl animate-fade-up">
            <div className="font-mono-accent text-[11px] uppercase tracking-[0.3em] text-primary">
              ▍ Right now in gaming
            </div>
            <h1 className="mt-3 font-display text-4xl font-bold leading-[1.05] md:text-6xl">
              Every story, every score,
              <br />
              <span className="gradient-text">every game.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
              One hub for gaming news, live esports, and a directory of thousands of titles.
              Stop chasing five tabs — start here.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {main && (
              <ArticleCard article={main} variant="featured" className="md:col-span-2 md:row-span-2" />
            )}
            <div className="flex flex-col gap-4">
              {sides.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* QUICK ACCESS */}
      <section className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          <QuickCard
            to="/news"
            icon={Newspaper}
            eyebrow="News Hub"
            title="Read everything, fast"
            desc="A unified feed from IGN, Kotaku, Dot Esports and more."
          />
          <QuickCard
            to="/esports"
            icon={Trophy}
            eyebrow="Esports Stats"
            title="Live matches, standings, stats"
            desc="Valorant, CS2, League and Dota — all in one scoreboard."
          />
          <QuickCard
            to="/games"
            icon={Flame}
            eyebrow="Game Directory"
            title="Find your next obsession"
            desc="Search thousands of titles by genre, platform, or rating."
          />
        </div>
      </section>

      {/* LIVE & UPCOMING MATCHES */}
      <section className="mx-auto max-w-[1400px] px-4 py-16 md:px-8">
        <SectionHeader
          eyebrow="On the wire"
          title="Live & upcoming matches"
          description="Score updates as they happen. Tap any match for the full stat breakdown."
          to="/esports"
          cta="All esports"
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...live, ...upcoming].slice(0, 6).map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      </section>

      {/* TOP STORIES */}
      <section className="mx-auto max-w-[1400px] px-4 pb-16 md:px-8">
        <SectionHeader
          eyebrow="Editorial pulse"
          title="Top stories"
          description="The biggest beats across the gaming world today."
          to="/news"
          cta="News hub"
        />
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {topStories.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
          <aside className="rounded-2xl border border-border/60 bg-surface/60 p-5">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Trending now
            </h3>
            <ol className="mt-4 space-y-1">
              {trending.map((a, i) => (
                <li key={a.slug} className="flex gap-3">
                  <span className="font-display text-2xl font-bold gradient-text leading-none w-8 flex-shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <ArticleCard article={a} variant="compact" className="flex-1" />
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </section>

      {/* FEATURED GAMES */}
      <section className="mx-auto max-w-[1400px] px-4 pb-16 md:px-8">
        <SectionHeader
          eyebrow="Spotlight"
          title="Featured games"
          description="Hand-picked across genres — start your next adventure here."
          to="/games"
          cta="Game directory"
        />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
          {games.slice(0, 5).map((g) => (
            <GameCard key={g.slug} game={g} />
          ))}
        </div>
      </section>

      {/* TRENDING GAMES STRIP */}
      <section className="mx-auto max-w-[1400px] px-4 pb-20 md:px-8">
        <SectionHeader
          eyebrow="Heat check"
          title="Trending in the community"
          to="/games"
          cta="Browse all"
        />
        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 scrollbar-none md:mx-0 md:px-0">
          {hot.map((g) => (
            <GameCard key={g.slug} game={g} className="w-44 flex-shrink-0 md:w-56" size="sm" />
          ))}
        </div>
      </section>
    </div>
  );
}

function QuickCard({
  to,
  icon: Icon,
  eyebrow,
  title,
  desc,
}: {
  to: "/news" | "/esports" | "/games";
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      to={to}
      className="group relative flex items-start gap-4 overflow-hidden rounded-xl border border-border/60 bg-surface p-5 hover-lift hover:border-primary/40"
    >
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="font-mono-accent text-[10px] uppercase tracking-widest text-primary">
          {eyebrow}
        </div>
        <div className="mt-1 font-display text-base font-semibold">{title}</div>
        <div className="mt-1 text-sm text-muted-foreground">{desc}</div>
      </div>
      <ArrowRight className="absolute right-4 top-4 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
    </Link>
  );
}
