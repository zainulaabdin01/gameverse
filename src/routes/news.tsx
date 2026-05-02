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
      {/* Masthead */}
      <header className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-radial-spotlight opacity-90" />
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="relative mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-24">
          <div className="flex items-center gap-3 font-mono-accent text-[11px] uppercase tracking-[0.32em] text-primary">
            <span className="h-px w-10 bg-primary/60" />
            The Wire · Vol. IV
            <span className="text-muted-foreground/70">
              — {mounted ? new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }) : ""}
            </span>
          </div>

          <h1 className="mt-6 max-w-5xl font-display font-bold leading-[0.9] tracking-tight"
              style={{ fontSize: "clamp(2.75rem, 8vw, 6.5rem)" }}>
            Every gaming story,
            <br />
            <span className="italic font-medium gradient-text">one masthead.</span>
          </h1>

          <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
            <p className="max-w-xl text-base text-muted-foreground md:text-lg">
              An editor-curated wire of the day's most consequential reporting from the
              biggest outlets in games — filtered however you want it.
            </p>
            <div className="flex divide-x divide-border/60 rounded-xl border border-border/60 bg-surface/40 backdrop-blur">
              <Stat label="Stories" value={sorted.length.toString()} />
              <Stat label="Today" value={todayCount.toString()} />
              <Stat label="Sources" value={sources.length.toString()} />
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
