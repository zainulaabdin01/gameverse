import { Link } from "@tanstack/react-router";
import type { Article } from "@/data/news";
import { timeAgo } from "@/lib/format";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";

interface Props {
  article: Article;
  variant?: "default" | "featured" | "compact";
  className?: string;
  /** When true, renders the same visuals without a link (e.g. field reference pages). */
  asStatic?: boolean;
  /** When true, links to the News field reference instead of the article detail route. */
  linkFieldReference?: boolean;
}

const sourceColors: Record<string, string> = {
  IGN: "bg-red-500/30 text-red-200 border-red-500/50",
  Kotaku: "bg-emerald-500/30 text-emerald-200 border-emerald-500/50",
  "Dot Esports": "bg-amber-500/30 text-amber-200 border-amber-500/50",
  "PC Gamer": "bg-sky-500/30 text-sky-200 border-sky-500/50",
  Eurogamer: "bg-violet-500/30 text-violet-200 border-violet-500/50",
  Polygon: "bg-pink-500/30 text-pink-200 border-pink-500/50",
  GameSpot: "bg-orange-500/30 text-orange-200 border-orange-500/50",
};

const categoryColors: Record<string, string> = {
  Esports: "text-blue-200 bg-blue-500/30 border-blue-500/50",
  Reviews: "text-purple-200 bg-purple-500/30 border-purple-500/50",
  Industry: "text-slate-200 bg-slate-500/30 border-slate-500/50",
  Updates: "text-teal-200 bg-teal-500/30 border-teal-500/50",
  Drama: "text-rose-200 bg-rose-500/30 border-rose-500/50",
  Hardware: "text-zinc-200 bg-zinc-500/30 border-zinc-500/50",
};

export function ArticleCard({
  article,
  variant = "default",
  className,
  asStatic,
  linkFieldReference,
}: Props) {
  const mounted = useMounted();
  const ago = mounted ? timeAgo(article.publishedAt) : "just now";

  if (variant === "featured") {
    const shell =
      "group relative block overflow-hidden rounded-2xl border border-border/60 bg-surface hover-lift";
    if (asStatic) {
      return (
        <div className={cn(shell, className)}>
          <FeaturedBody article={article} ago={ago} />
        </div>
      );
    }
    if (linkFieldReference) {
      return (
        <Link to="/reference/news" className={cn(shell, className)}>
          <FeaturedBody article={article} ago={ago} />
        </Link>
      );
    }
    return (
      <Link to="/news/$slug" params={{ slug: article.slug }} className={cn(shell, className)}>
        <FeaturedBody article={article} ago={ago} />
      </Link>
    );
  }

  if (variant === "compact") {
    const shell = "group flex gap-3 rounded-lg p-2 transition-colors hover:bg-surface";
    if (asStatic) {
      return (
        <div className={cn(shell, className)}>
          <CompactBody article={article} ago={ago} />
        </div>
      );
    }
    if (linkFieldReference) {
      return (
        <Link to="/reference/news" className={cn(shell, className)}>
          <CompactBody article={article} ago={ago} />
        </Link>
      );
    }
    return (
      <Link to="/news/$slug" params={{ slug: article.slug }} className={cn(shell, className)}>
        <CompactBody article={article} ago={ago} />
      </Link>
    );
  }

  const shell =
    "group flex flex-col overflow-hidden rounded-xl border border-border/60 bg-surface hover-lift";
  if (asStatic) {
    return (
      <div className={cn(shell, className)}>
        <DefaultBody article={article} ago={ago} />
      </div>
    );
  }
  if (linkFieldReference) {
    return (
      <Link to="/reference/news" className={cn(shell, className)}>
        <DefaultBody article={article} ago={ago} />
      </Link>
    );
  }
  return (
    <Link to="/news/$slug" params={{ slug: article.slug }} className={cn(shell, className)}>
      <DefaultBody article={article} ago={ago} />
    </Link>
  );
}

function FeaturedBody({ article, ago }: { article: Article; ago: string }) {
  return (
    <>
      <div className="relative aspect-[16/9] overflow-hidden md:aspect-[21/9]">
        <img
          src={article.cover}
          alt={article.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-md border px-2 py-0.5 text-[10px] font-mono-accent uppercase tracking-wider",
              sourceColors[article.source],
            )}
          >
            {article.source}
          </span>
          <span
            className={cn(
              "rounded-md border px-2 py-0.5 text-[10px] font-mono-accent uppercase tracking-wider",
              categoryColors[article.category] || "bg-surface-3/80 text-muted-foreground"
            )}
          >
            {article.category}
          </span>
          <span className="text-xs text-muted-foreground">{ago}</span>
        </div>
        <h3 className="mt-3 max-w-3xl font-display text-2xl font-bold leading-tight md:text-3xl group-hover:gradient-text transition-colors">
          {article.title}
        </h3>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground line-clamp-2">
          {article.excerpt}
        </p>
      </div>
    </>
  );
}

function CompactBody({ article, ago }: { article: Article; ago: string }) {
  return (
    <>
      <div className="h-16 w-20 flex-shrink-0 overflow-hidden rounded-md">
        <img src={article.cover} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="min-w-0">
        <span className="text-[10px] font-mono-accent uppercase text-muted-foreground">
          {article.source} · {ago}
        </span>
        <h4 className="mt-0.5 line-clamp-2 text-sm font-medium leading-snug group-hover:text-primary">
          {article.title}
        </h4>
      </div>
    </>
  );
}

function DefaultBody({ article, ago }: { article: Article; ago: string }) {
  return (
    <>
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={article.cover}
          alt={article.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className={cn(
            "absolute left-3 top-3 rounded-md border px-2 py-0.5 text-[10px] font-mono-accent uppercase tracking-wider backdrop-blur",
            sourceColors[article.source],
          )}
        >
          {article.source}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2 text-[10px] font-mono-accent uppercase text-muted-foreground">
          <span className={cn("rounded-sm border px-1.5 py-0.5", categoryColors[article.category] || "text-muted-foreground")}>
            {article.category}
          </span>
          <span>·</span>
          <span>{ago}</span>
        </div>
        <h3 className="font-display text-base font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
      </div>
    </>
  );
}
