import { createFileRoute, Link, useRouter, notFound } from "@tanstack/react-router";
import { ArrowLeft, Star } from "lucide-react";
import { getGame, games as allGames } from "@/data/games";
import { articlesByGame } from "@/data/news";
import { ArticleCard } from "@/components/ArticleCard";
import { GameCard } from "@/components/GameCard";

export const Route = createFileRoute("/games/$slug")({
  loader: ({ params }) => {
    const game = getGame(params.slug);
    if (!game) throw notFound();
    return { game };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.game.title} — Gameverse` },
          { name: "description", content: loaderData.game.shortDescription },
          { property: "og:title", content: loaderData.game.title },
          { property: "og:description", content: loaderData.game.shortDescription },
          { property: "og:image", content: loaderData.game.hero },
        ]
      : [],
  }),
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Game unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground"
        >
          Try again
        </button>
      </div>
    );
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-bold">Game not found</h1>
      <Link to="/games" className="mt-4 inline-block text-primary">
        Back to directory →
      </Link>
    </div>
  ),
  component: GamePage,
});

function GamePage() {
  const { game } = Route.useLoaderData();
  const news = articlesByGame(game.slug);
  const similar = allGames
    .filter((g) => g.slug !== game.slug && g.genres.some((x) => game.genres.includes(x)))
    .slice(0, 5);

  return (
    <div>
      <div className="relative h-[55vh] min-h-[400px] overflow-hidden">
        <img src={game.hero} alt={game.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1200px] px-4 pb-10 md:px-8">
          <Link
            to="/games"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Game Directory
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {game.genres.map((g: string) => (
              <span
                key={g}
                className="rounded-md bg-surface-3/80 px-2 py-0.5 text-[10px] font-mono-accent uppercase tracking-wider text-muted-foreground backdrop-blur"
              >
                {g}
              </span>
            ))}
          </div>
          <h1 className="mt-3 font-display text-4xl font-bold md:text-6xl">
            {game.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span>{game.developer}</span>
            <span>·</span>
            <span>{game.releaseYear}</span>
            <span>·</span>
            <span>{game.platforms.join(" / ")}</span>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-[1200px] px-4 py-12 md:px-8">
        <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
          <div>
            <p className="text-lg leading-relaxed text-foreground/90">
              {game.description}
            </p>

            {game.screenshots.length > 0 && (
              <div className="mt-8">
                <h2 className="font-display text-xl font-bold mb-4">Screenshots</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {game.screenshots.map((s: string, i: number) => (
                    <img
                      key={i}
                      src={s}
                      alt=""
                      className="aspect-video w-full rounded-lg object-cover"
                      loading="lazy"
                    />
                  ))}
                </div>
              </div>
            )}

            {news.length > 0 && (
              <div className="mt-12">
                <h2 className="font-display text-xl font-bold mb-4">Recent news</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {news.map((a) => (
                    <ArticleCard key={a.slug} article={a} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-border/60 bg-surface p-5">
              <div className="flex items-end justify-between">
                <div>
                  <div className="font-mono-accent text-[10px] uppercase tracking-widest text-muted-foreground">
                    Critic score
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="font-display text-4xl font-bold gradient-text">
                      {game.rating}
                    </span>
                    <span className="text-xs text-muted-foreground">/100</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono-accent text-[10px] uppercase tracking-widest text-muted-foreground">
                    User
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="font-display text-2xl font-bold">
                      {game.userScore.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-surface p-5 space-y-3 text-sm">
              <Detail label="Developer" value={game.developer} />
              <Detail label="Publisher" value={game.publisher} />
              <Detail label="Release" value={String(game.releaseYear)} />
              <Detail label="Platforms" value={game.platforms.join(", ")} />
              <Detail label="Genres" value={game.genres.join(", ")} />
            </div>
          </aside>
        </div>
      </section>

      {similar.length > 0 && (
        <section className="mx-auto max-w-[1200px] px-4 pb-16 md:px-8">
          <h2 className="font-display text-xl font-bold mb-4">If you liked this</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {similar.map((g) => (
              <GameCard key={g.slug} game={g} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-mono-accent text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="text-right">{value}</span>
    </div>
  );
}
