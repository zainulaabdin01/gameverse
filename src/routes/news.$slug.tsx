import { createFileRoute, Link, useRouter, notFound } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { ArticleCard } from "@/components/ArticleCard";
import { articles, getArticle } from "@/data/news";
import { getGame } from "@/data/games";
import { timeAgo } from "@/lib/format";

export const Route = createFileRoute("/news/$slug")({
  loader: ({ params }) => {
    const article = getArticle(params.slug);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.article.title} — Gameverse` },
          { name: "description", content: loaderData.article.excerpt },
          { property: "og:title", content: loaderData.article.title },
          { property: "og:description", content: loaderData.article.excerpt },
          { property: "og:image", content: loaderData.article.cover },
        ]
      : [],
  }),
  errorComponent: ErrorView,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Article not found</h1>
      <p className="mt-2 text-muted-foreground">It may have been moved or deleted.</p>
      <Link to="/news" className="mt-4 inline-block text-primary">
        Back to News Hub →
      </Link>
    </div>
  ),
  component: ArticlePage,
});

function ErrorView({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Something broke</h1>
      <p className="mt-2 text-muted-foreground">{error.message}</p>
      <button
        onClick={() => {
          router.invalidate();
          reset();
        }}
        className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground"
      >
        Try again
      </button>
    </div>
  );
}

function ArticlePage() {
  const { article } = Route.useLoaderData();
  const related = articles
    .filter((a) => a.slug !== article.slug && a.category === article.category)
    .slice(0, 3);
  const game = article.relatedGameSlug ? getGame(article.relatedGameSlug) : undefined;

  return (
    <article>
      <div className="relative h-[42vh] min-h-[320px] overflow-hidden">
        <img src={article.cover} alt={article.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
      </div>

      <div className="mx-auto -mt-32 max-w-3xl px-4 pb-16 md:px-0">
        <Link
          to="/news"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> News Hub
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-mono-accent uppercase tracking-wider text-primary">
            {article.source}
          </span>
          <span className="rounded-md bg-surface-3 px-2 py-0.5 text-[10px] font-mono-accent uppercase tracking-wider text-muted-foreground">
            {article.category}
          </span>
          <span className="text-xs text-muted-foreground">
            By {article.author} · {timeAgo(article.publishedAt)}
          </span>
        </div>

        <h1 className="mt-4 font-display text-3xl font-bold leading-tight md:text-5xl">
          {article.title}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{article.excerpt}</p>

        <div className="prose prose-invert mt-8 max-w-none text-base leading-relaxed">
          {article.body.map((p, i) => (
            <p key={i} className="mb-5 text-foreground/90">
              {p}
            </p>
          ))}
        </div>

        {game && (
          <Link
            to="/games/$slug"
            params={{ slug: game.slug }}
            className="mt-8 flex items-center gap-4 rounded-xl border border-border/60 bg-surface p-4 hover:border-primary/40"
          >
            <img src={game.cover} alt="" className="h-16 w-12 rounded object-cover" />
            <div className="flex-1">
              <div className="font-mono-accent text-[10px] uppercase text-primary">
                Game in this story
              </div>
              <div className="font-display text-base font-semibold">{game.title}</div>
              <div className="text-xs text-muted-foreground">{game.shortDescription}</div>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </Link>
        )}

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-xl font-bold mb-4">Related stories</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
