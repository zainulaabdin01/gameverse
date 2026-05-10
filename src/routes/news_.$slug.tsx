import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Bookmark, CalendarDays, ChevronRight, Clock, Quote, Share2, Sparkles, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { ArticleCard } from "@/components/ArticleCard";
import { RefSectionHeading } from "@/components/reference/ReferenceShell";
import { getGame } from "@/data/games";
import { getArticleBySlugFn, getRelatedArticlesFn } from "@/queries/news";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/news_/$slug")({
  loader: async ({ params }) => {
    const article = await getArticleBySlugFn({ data: params.slug });
    if (!article) throw notFound();
    
    const related = await getRelatedArticlesFn({ 
      data: { category: article.category, excludeSlug: article.slug } 
    });
    
    return { article, related };
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
  component: NewsArticlePage,
});

function NewsArticlePage() {
  const { article, related } = Route.useLoaderData();
  const mounted = useMounted();

  const sections = [
    { id: "body", index: "01", label: "Full Story" },
    ...(related.length > 0 ? [{ id: "discovery", index: "02", label: "Related Stories" }] : []),
  ];

  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  return (
    <div className="relative">
      <header className="relative overflow-hidden border-b border-border/60 bg-surface/20">
        {/* Restore the premium aurora background since the image is no longer full bleed */}
        <div className="bg-aurora absolute inset-0 opacity-40" />
        <div className="bg-grid absolute inset-0 opacity-[0.12]" />
        <div className="absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-primary/15 blur-[110px]" />
        <div className="absolute -bottom-32 -right-32 h-[420px] w-[420px] rounded-full bg-accent/15 blur-[110px]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-background" />
        
        <div className="relative mx-auto max-w-[1400px] px-4 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 py-2 font-mono-accent text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            <nav className="flex items-center gap-1.5">
              <Link to="/news" className="transition-colors hover:text-foreground">
                News
              </Link>
              <ChevronRight className="h-3 w-3 opacity-60" />
              <span className="text-foreground">{article.category}</span>
            </nav>
            <span className="flex items-center gap-2">
              <CalendarDays className="h-3 w-3 text-primary" />
              {mounted
                ? new Date(article.publishedAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : ""}
            </span>
          </div>

          <div className="grid items-start gap-8 py-8 md:grid-cols-12 md:py-16">
            <div className="md:col-span-8">
              {/* Smaller image placed within the hero section */}
              <div className="mb-8 overflow-hidden rounded-3xl border border-border/60 aspect-[21/9] bg-surface/30 shadow-xl relative">
                {/* Blurred backdrop */}
                <div 
                  className="absolute inset-0 bg-cover bg-center blur-2xl opacity-60 scale-110"
                  style={{ backgroundImage: `url(${article.cover})` }}
                />
                {/* Foreground contained image */}
                <img 
                  src={article.cover} 
                  alt={article.title} 
                  className="relative h-full w-full object-contain drop-shadow-2xl" 
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-5">
                {article.featured && (
                  <span className="rounded-md border border-primary/40 bg-primary/20 px-2 py-1 font-mono-accent text-[10px] uppercase tracking-wider text-primary">
                    Breaking analysis
                  </span>
                )}
                <span className="rounded-md border border-border/60 bg-surface/80 px-2 py-1 font-mono-accent text-[10px] uppercase tracking-wider text-foreground">
                  {article.category}
                </span>
              </div>
              <h1
                className="font-display font-bold leading-[1.05] tracking-tight text-foreground"
                style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
              >
                {article.title}
              </h1>
              <p className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
                {article.excerpt}
              </p>
            </div>

            <div className="md:col-span-4 lg:pl-6">
              <div className="grid grid-cols-2 gap-2 rounded-2xl border border-border/40 bg-background/40 p-3 backdrop-blur-xl">
                <div className="rounded-xl bg-surface/60 px-3 py-3">
                  <p className="font-mono-accent text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                    Author
                  </p>
                  <p className="mt-1 font-display text-base font-bold leading-none line-clamp-1">{article.author}</p>
                </div>
                <div className="rounded-xl bg-surface/60 px-3 py-3">
                  <p className="font-mono-accent text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                    Reads
                  </p>
                  <p className="mt-1 font-display text-base font-bold leading-none">{article.reads?.toLocaleString() || "N/A"}</p>
                </div>
                <div className="col-span-2 flex gap-2">
                  <button className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border/40 bg-surface/60 py-3 text-sm font-medium transition-colors hover:border-primary/50 hover:text-primary">
                    <Bookmark className="h-4 w-4" /> Save
                  </button>
                  <button className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border/40 bg-surface/60 py-3 text-sm font-medium transition-colors hover:border-primary/50 hover:text-primary">
                    <Share2 className="h-4 w-4" /> Share
                  </button>
                </div>
              </div>
              
              {/* Source pill positioned below the details block */}
              <div className="mt-3 flex justify-end">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-surface/40 px-3 py-1 font-mono-accent text-[10px] uppercase tracking-wider text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                  Source: {article.source}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-12 md:px-8 md:py-16 lg:grid-cols-12">
        <aside className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-24 space-y-3">
            <p className="font-mono-accent text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Contents
            </p>
            <nav className="space-y-1">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={cn(
                    "group flex items-start gap-3 rounded-lg border border-transparent px-3 py-2 text-sm transition-all",
                    active === s.id
                      ? "border-primary/40 bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:border-border/60 hover:bg-surface/40 hover:text-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "font-mono-accent text-[10px] tracking-wider pt-0.5 transition-colors",
                      active === s.id ? "text-primary" : "text-muted-foreground/70"
                    )}
                  >
                    {s.index}
                  </span>
                  <span className="leading-snug">{s.label}</span>
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <main className="space-y-20 lg:col-span-9">
          <section className="space-y-6">
            <RefSectionHeading
              id="body"
              index="01"
              eyebrow="Coverage"
              title="Full Story"
            />
            <div className="space-y-5 rounded-3xl border border-border/60 bg-background/50 p-6 md:p-8">
              {article.body.map((paragraph: string, i: number) => {
                const isCallout = i === 1 && paragraph.length > 50 && paragraph.length < 150;
                if (isCallout) {
                  return (
                    <blockquote key={i} className="rounded-2xl border border-primary/30 bg-primary/10 p-5">
                      <div className="flex items-center gap-2 font-mono-accent text-[10px] uppercase tracking-[0.28em] text-primary">
                        <Quote className="h-3.5 w-3.5" />
                        Editorial callout
                      </div>
                      <p className="mt-3 font-display text-xl leading-snug text-foreground">
                        "{paragraph}"
                      </p>
                    </blockquote>
                  );
                }
                return (
                  <p key={i} className="text-[15px] leading-7 text-muted-foreground">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          </section>

          {related.length > 0 && (
            <section className="space-y-6">
              <RefSectionHeading
                id="discovery"
                index="02"
                eyebrow="Discovery"
                title="Related stories"
              />
              {related.length >= 1 && (
                <div>
                  <p className="mb-3 font-mono-accent text-[10px] uppercase tracking-[0.28em] text-primary">
                    <Sparkles className="mr-1 inline h-3 w-3" />
                    Featured variant
                  </p>
                  <ArticleCard article={related[0]} variant="featured" />
                </div>
              )}
              {related.length > 1 && (
                <div>
                  <p className="mb-3 font-mono-accent text-[10px] uppercase tracking-[0.28em] text-primary">
                    Default grid
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    {related.slice(1).map((a) => (
                      <ArticleCard key={a.slug} article={a} />
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
