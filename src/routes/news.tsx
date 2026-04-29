import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ArticleCard } from "@/components/ArticleCard";
import { articles, categories, sources, type NewsCategory, type NewsSource } from "@/data/news";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "News Hub — Gameverse" },
      {
        name: "description",
        content:
          "Filterable feed of gaming news from IGN, Kotaku, Dot Esports, PC Gamer and more — all in one place.",
      },
      { property: "og:title", content: "News Hub — Gameverse" },
      {
        property: "og:description",
        content: "Gaming news from across the internet, filtered however you want.",
      },
    ],
  }),
  component: NewsHub,
});

function NewsHub() {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<NewsSource | "all">("all");
  const [category, setCategory] = useState<NewsCategory | "all">("all");

  const filtered = useMemo(() => {
    return articles
      .filter((a) => (source === "all" ? true : a.source === source))
      .filter((a) => (category === "all" ? true : a.category === category))
      .filter((a) =>
        query.trim() === ""
          ? true
          : (a.title + a.excerpt).toLowerCase().includes(query.toLowerCase()),
      )
      .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
  }, [query, source, category]);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div>
      <header className="border-b border-border/60 bg-surface/40">
        <div className="mx-auto max-w-[1400px] px-4 py-12 md:px-8">
          <div className="font-mono-accent text-[11px] uppercase tracking-[0.3em] text-primary">
            ▍ News Hub
          </div>
          <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">
            Every gaming story, <span className="gradient-text">one feed.</span>
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Pulled from the internet's biggest gaming outlets — filter by source, category, or
            search for what matters to you.
          </p>
        </div>
      </header>

      <div className="sticky top-16 z-30 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto max-w-[1400px] px-4 py-3 md:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search headlines…"
                className="w-full rounded-md border border-border bg-surface px-9 py-2 text-sm placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none"
              />
            </div>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as NewsSource | "all")}
              className="rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary/60 focus:outline-none"
            >
              <option value="all">All sources</option>
              {sources.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="mt-3 -mx-4 flex gap-2 overflow-x-auto px-4 scrollbar-none md:mx-0 md:px-0">
            <Chip active={category === "all"} onClick={() => setCategory("all")}>
              All categories
            </Chip>
            {categories.map((c) => (
              <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
                {c}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-[1400px] px-4 py-10 md:px-8">
        {filtered.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border bg-surface text-sm text-muted-foreground">
            Nothing matches that filter. Try widening it.
          </div>
        ) : (
          <>
            {featured && (
              <div className="mb-8">
                <ArticleCard article={featured} variant="featured" />
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {rest.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </>
        )}
      </section>
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
        "whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-primary/60 bg-primary/15 text-primary"
          : "border-border bg-surface text-muted-foreground hover:text-foreground hover:border-primary/40",
      )}
    >
      {children}
    </button>
  );
}
