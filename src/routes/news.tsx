import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, TrendingUp, Clock, Sparkles, ArrowUpRight } from "lucide-react";
import { ArticleCard } from "@/components/ArticleCard";
import { articles, categories, sources, type NewsCategory, type NewsSource } from "@/data/news";
import { timeAgo } from "@/lib/format";
import { useMounted } from "@/hooks/use-mounted";
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
  const mounted = useMounted();
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<NewsSource | "all">("all");
  const [category, setCategory] = useState<NewsCategory | "all">("all");

  const sorted = useMemo(
    () => [...articles].sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt)),
    [],
  );

  const filtered = useMemo(() => {
    return sorted
      .filter((a) => (source === "all" ? true : a.source === source))
      .filter((a) => (category === "all" ? true : a.category === category))
      .filter((a) =>
        query.trim() === ""
          ? true
          : (a.title + a.excerpt).toLowerCase().includes(query.toLowerCase()),
      );
  }, [sorted, query, source, category]);

  // Editorial layout slices
  const lead = filtered[0];
  const subFeatured = filtered.slice(1, 3);
  const editorPicks = filtered.slice(3, 6);
  const rest = filtered.slice(6);

  const mostRead = useMemo(
    () => [...articles].sort((a, b) => (b.reads ?? 0) - (a.reads ?? 0)).slice(0, 5),
    [],
  );

  const todayCount = sorted.filter(
    (a) => Date.now() - +new Date(a.publishedAt) < 24 * 3600_000,
  ).length;

  return (
    <div className="relative">
      {/* Nameplate — compact newspaper header */}
      <header className="relative border-b border-border/60 bg-surface/20">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8">
          {/* Top meta row */}
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
            <span className="hidden sm:inline">Vol. IV · No. {sorted.length}</span>
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Live · {todayCount} today
            </span>
          </div>

          {/* Nameplate */}
          <div className="flex flex-col items-center py-6 text-center md:py-8">
            <div className="font-mono-accent text-[10px] uppercase tracking-[0.4em] text-primary">
              The Gameverse Wire
            </div>
            <h1 className="mt-2 font-display font-bold leading-none tracking-tight"
                style={{ fontSize: "clamp(2rem, 5.5vw, 4rem)" }}>
              News<span className="italic font-medium text-muted-foreground"> &amp; </span>
              <span className="gradient-text">Reports</span>
            </h1>
            <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="h-px w-8 bg-border" />
              The day's gaming headlines, curated from {sources.length} outlets
              <span className="h-px w-8 bg-border" />
            </div>
          </div>

          {/* Headline ticker */}
          <div className="flex items-center gap-3 overflow-hidden border-t border-border/40 py-2.5">
            <span className="flex flex-shrink-0 items-center gap-1.5 rounded-sm bg-primary/15 px-2 py-0.5 font-mono-accent text-[10px] uppercase tracking-wider text-primary">
              <TrendingUp className="h-3 w-3" />
              Breaking
            </span>
            <div className="flex min-w-0 gap-6 overflow-x-auto scrollbar-none text-xs text-muted-foreground">
              {sorted.slice(0, 5).map((a) => (
                <Link
                  key={a.slug}
                  to="/news/$slug"
                  params={{ slug: a.slug }}
                  className="flex flex-shrink-0 items-center gap-2 hover:text-foreground"
                >
                  <span className="font-mono-accent text-[10px] uppercase text-primary/80">
                    {a.source}
                  </span>
                  <span className="line-clamp-1">{a.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Filter bar */}
      <div className="sticky top-16 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1400px] px-4 py-3 md:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search the wire…"
                className="w-full rounded-lg border border-border bg-surface/70 px-9 py-2 text-sm placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as NewsSource | "all")}
              className="rounded-lg border border-border bg-surface/70 px-3 py-2 text-sm focus:border-primary/60 focus:outline-none"
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

      {filtered.length === 0 ? (
        <section className="mx-auto max-w-[1400px] px-4 py-16 md:px-8">
          <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border bg-surface/40 text-sm text-muted-foreground">
            Nothing matches that filter. Try widening it.
          </div>
        </section>
      ) : (
        <>
          {/* Editorial above-the-fold */}
          <section className="mx-auto max-w-[1400px] px-4 py-12 md:px-8 md:py-16">
            <SectionEyebrow icon={<Sparkles className="h-3.5 w-3.5" />} label="The Front Page" />
            <div className="mt-6 grid gap-6 lg:grid-cols-12">
              {lead && (
                <div className="lg:col-span-8">
                  <ArticleCard article={lead} variant="featured" className="h-full" />
                </div>
              )}
              <aside className="flex flex-col gap-6 lg:col-span-4">
                {subFeatured.map((a) => (
                  <ArticleCard key={a.slug} article={a} className="h-full" />
                ))}
              </aside>
            </div>
          </section>

          {/* Editor's picks + Most read sidebar */}
          <section className="border-t border-border/60 bg-surface/30">
            <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-14 md:px-8 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <SectionEyebrow icon={<Clock className="h-3.5 w-3.5" />} label="Editor's Picks" />
                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {editorPicks.map((a) => (
                    <ArticleCard key={a.slug} article={a} />
                  ))}
                </div>
              </div>

              <aside className="lg:col-span-4">
                <SectionEyebrow icon={<TrendingUp className="h-3.5 w-3.5" />} label="Most Read" />
                <ol className="mt-6 divide-y divide-border/60 rounded-2xl border border-border/60 bg-background/40 backdrop-blur">
                  {mostRead.map((a, i) => (
                    <li key={a.slug}>
                      <Link
                        to="/news/$slug"
                        params={{ slug: a.slug }}
                        className="group flex items-start gap-4 p-4 transition-colors hover:bg-surface/60"
                      >
                        <span className="font-display text-3xl font-bold leading-none text-transparent"
                              style={{ WebkitTextStroke: "1px color-mix(in oklab, var(--primary) 70%, transparent)" }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] font-mono-accent uppercase tracking-wider text-muted-foreground">
                            {a.source} · {((a.reads ?? 0) / 1000).toFixed(0)}k reads
                          </div>
                          <h4 className="mt-1 line-clamp-2 text-sm font-medium leading-snug group-hover:text-primary">
                            {a.title}
                          </h4>
                        </div>
                        <ArrowUpRight className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                      </Link>
                    </li>
                  ))}
                </ol>
              </aside>
            </div>
          </section>

          {/* The Rest of the Wire */}
          {rest.length > 0 && (
            <section className="mx-auto max-w-[1400px] px-4 py-16 md:px-8">
              <SectionEyebrow label="The Wire" />
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {rest.map((a) => (
                  <ArticleCard key={a.slug} article={a} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-5 py-3">
      <div className="font-display text-2xl font-bold leading-none gradient-text">{value}</div>
      <div className="mt-1 text-[10px] font-mono-accent uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
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
