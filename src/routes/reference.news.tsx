import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, CalendarDays, FileJson, Quote, Sparkles, UserRound } from "lucide-react";
import { ArticleCard } from "@/components/ArticleCard";
import { SectionHeader } from "@/components/SectionHeader";
import type { Article } from "@/data/news";
import { useMounted } from "@/hooks/use-mounted";

export const Route = createFileRoute("/reference/news")({
  head: () => ({
    meta: [
      { title: "News field reference — Gameverse" },
      {
        name: "description",
        content:
          "Sample shapes and UI patterns for the News hub: Article model, ArticleCard variants, and backend mapping notes.",
      },
    ],
  }),
  component: NewsReferencePage,
});

const featuredArticle: Article = {
  slug: "reference-premium-wire-story",
  title: "Afterlight's post-launch roadmap signals a new era for prestige narrative games",
  excerpt:
    "Three expansions, creator tools, and esports-style chapter events position Afterlight as a long-tail platform instead of a one-and-done hit.",
  body: [
    "In a closed media briefing, Aurora Interactive outlined a post-launch strategy that treats each chapter of Afterlight as a seasonal content drop. Rather than releasing isolated DLC packs, the studio is shipping narrative arcs with dedicated in-game events, creator templates, and timed community challenges that all roll up into a persistent world state.",
    "The most notable announcement is a public story editor that lets players remix moments from each chapter using curated scene blocks. Teams describe this as 'modding without the friction,' and the internal benchmark is to keep an end-to-end publish flow under ten minutes. If adoption trends mirror prior creator tools in this genre, Aurora expects user-authored episodes to outnumber official arcs within six months.",
    "Analysts we spoke with believe the move could shift expectations for premium games that usually rely on one major review cycle. By leaning into eventized launches, episodic beats, and social distribution, Afterlight is now competing for audience attention in a rhythm more common to live service ecosystems.",
    "Even critics skeptical of roadmap language agree on one point: the tooling and cadence on display look unusually production-ready for this stage. If execution lands, Afterlight may become the clearest template yet for how narrative-first teams can build sustainable engagement without diluting creative identity.",
  ],
  source: "PC Gamer",
  category: "Industry",
  author: "Jordan Kell",
  publishedAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
  cover:
    "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=1800&h=1000&q=80",
  relatedGameSlug: "afterlight",
  featured: true,
  reads: 248_600,
};

const relatedStories: Article[] = [
  {
    slug: "reference-related-story-1",
    title: "Eldoria Rising's late-game rework turns endgame factions into full campaigns",
    excerpt: "Patch 2.1 expands faction quests with region-wide consequences and asynchronous guild objectives.",
    body: ["Sample body line 1", "Sample body line 2"],
    source: "IGN",
    category: "Updates",
    author: "Casey Wren",
    publishedAt: new Date(Date.now() - 5 * 3600_000).toISOString(),
    cover:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&h=800&q=80",
    relatedGameSlug: "eldoria-rising",
    reads: 143_000,
  },
  {
    slug: "reference-related-story-2",
    title: "Valor Arena Champions viewership spikes 38% after format revamp",
    excerpt: "Swiss stage refinements and cleaner broadcast overlays boosted completion rates across regions.",
    body: ["Sample body line 1", "Sample body line 2"],
    source: "Dot Esports",
    category: "Esports",
    author: "Sami Ortega",
    publishedAt: new Date(Date.now() - 9 * 3600_000).toISOString(),
    cover:
      "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=1200&h=800&q=80",
    relatedGameSlug: "valor-arena",
    reads: 189_400,
  },
  {
    slug: "reference-related-story-3",
    title: "Neon Protocol's official mod kit shipped with campaign-quality templates",
    excerpt: "Creators now have access to AI behavior graphs, mission triggers, and cinematic event hooks.",
    body: ["Sample body line 1", "Sample body line 2"],
    source: "Polygon",
    category: "Reviews",
    author: "Devon Maine",
    publishedAt: new Date(Date.now() - 16 * 3600_000).toISOString(),
    cover:
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=1200&h=800&q=80",
    relatedGameSlug: "neon-protocol",
    reads: 97_300,
  },
];

function NewsReferencePage() {
  const mounted = useMounted();

  return (
    <div className="relative">
      <header className="relative overflow-hidden border-b border-border/60 bg-surface/20">
        <div className="bg-aurora absolute inset-0 opacity-40" />
        <div className="bg-grid absolute inset-0 opacity-[0.12]" />
        <div className="absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-primary/15 blur-[110px]" />
        <div className="absolute -bottom-32 -right-32 h-[420px] w-[420px] rounded-full bg-accent/15 blur-[110px]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-background" />
        <div className="relative mx-auto max-w-[1400px] px-4 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 py-2 font-mono-accent text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
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
            <span className="flex items-center gap-2">
              <BookOpen className="h-3 w-3 text-primary" />
              Reference · Premium article
            </span>
          </div>

          <div className="flex flex-col items-center py-6 text-center md:py-8">
            <div className="font-mono-accent text-[10px] uppercase tracking-[0.4em] text-primary">
              Implementation guide
            </div>
            <h1
              className="mt-2 font-display font-bold leading-none tracking-tight"
              style={{ fontSize: "clamp(2rem, 5.5vw, 3.25rem)" }}
            >
              News<span className="italic font-medium text-muted-foreground"> detail </span>
              <span className="gradient-text">showcase</span>
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
              A premium article-detail composition with immersive hero media, editorial storytelling
              blocks, related rails, and backend contract guidance.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs">
              <Link
                to="/news"
                className="rounded-full border border-border/60 bg-surface/60 px-4 py-2 font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              >
                ← Back to News hub
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] space-y-16 px-4 py-12 md:px-8 md:py-16">
        <section className="grid gap-8 xl:grid-cols-12">
          <article className="xl:col-span-8">
            <div className="overflow-hidden rounded-3xl border border-border/60 bg-surface/30">
              <div className="relative aspect-[16/9]">
                <img src={featuredArticle.cover} alt={featuredArticle.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-primary/40 bg-primary/20 px-2 py-1 font-mono-accent text-[10px] uppercase tracking-wider text-primary">
                      Breaking analysis
                    </span>
                    <span className="rounded-md border border-border/60 bg-surface/80 px-2 py-1 font-mono-accent text-[10px] uppercase tracking-wider text-muted-foreground">
                      {featuredArticle.category}
                    </span>
                    <span className="rounded-md border border-border/60 bg-surface/80 px-2 py-1 font-mono-accent text-[10px] uppercase tracking-wider text-muted-foreground">
                      {featuredArticle.source}
                    </span>
                  </div>
                  <h2 className="mt-4 max-w-4xl font-display text-3xl font-bold leading-tight md:text-4xl">
                    {featuredArticle.title}
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm text-muted-foreground md:text-base">
                    {featuredArticle.excerpt}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 border-t border-border/60 px-6 py-4 text-xs text-muted-foreground md:px-8">
                <span className="flex items-center gap-2">
                  <UserRound className="h-3.5 w-3.5 text-primary" />
                  {featuredArticle.author}
                </span>
                <span className="flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5 text-primary" />
                  {mounted ? new Date(featuredArticle.publishedAt).toLocaleString() : ""}
                </span>
                <span>{featuredArticle.reads?.toLocaleString()} reads</span>
              </div>
            </div>

            <div className="mt-8 space-y-5 rounded-3xl border border-border/60 bg-background/50 p-6 md:p-8">
              {featuredArticle.body.map((paragraph) => (
                <p key={paragraph.slice(0, 20)} className="text-[15px] leading-7 text-muted-foreground">
                  {paragraph}
                </p>
              ))}
              <blockquote className="rounded-2xl border border-primary/30 bg-primary/10 p-5">
                <div className="flex items-center gap-2 font-mono-accent text-[10px] uppercase tracking-[0.28em] text-primary">
                  <Quote className="h-3.5 w-3.5" />
                  Editorial callout
                </div>
                <p className="mt-3 font-display text-xl leading-snug text-foreground">
                  "We are entering an era where premium stories need live cadence, creator leverage,
                  and long-tail discoverability as first-class product features."
                </p>
              </blockquote>
            </div>
          </article>

          <aside className="space-y-6 xl:col-span-4">
            <div className="rounded-2xl border border-border/60 bg-surface/40 p-6">
              <SectionEyebrow icon={<FileJson className="h-3.5 w-3.5" />} label="Story metadata" />
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li><span className="font-medium text-foreground">slug</span> — stable id for detail routing.</li>
                <li><span className="font-medium text-foreground">title + excerpt</span> — headline and deck.</li>
                <li><span className="font-medium text-foreground">source + category</span> — badge styling + filters.</li>
                <li><span className="font-medium text-foreground">author + publishedAt</span> — byline module.</li>
                <li><span className="font-medium text-foreground">cover</span> — 16:9 hero media.</li>
                <li><span className="font-medium text-foreground">body</span> — rich article narrative sections.</li>
              </ul>
            </div>
          </aside>
        </section>

        <section>
          <SectionHeader
            index="01"
            eyebrow="Related content"
            title="Stories rail and discovery grid"
            description="Article detail pages can drive recirculation through compact rails and card grids."
          />
          <div className="space-y-8">
            <div>
              <SectionEyebrow icon={<Sparkles className="h-3.5 w-3.5" />} label="Lead related story" />
              <div className="mt-4">
                <ArticleCard article={relatedStories[0]} variant="featured" asStatic />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {relatedStories.map((article) => (
                <ArticleCard key={article.slug} article={article} asStatic />
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border/60 pt-16">
          <SectionHeader
            index="02"
            eyebrow="Backend contract"
            title="Article detail + list field contract"
            description="Reference mapping for list hydration and full detail page rendering."
          />
          <div className="grid gap-6 md:grid-cols-2">
            <ul className="space-y-3 rounded-2xl border border-border/60 bg-background/40 p-6 text-sm text-muted-foreground">
              <li className="font-mono-accent text-[10px] uppercase tracking-wider text-primary">
                Suggested mapping
              </li>
              <li>
                <span className="text-foreground">articles.id</span> → keep internal; expose{" "}
                <span className="text-foreground">slug</span> to clients.
              </li>
              <li>
                <span className="text-foreground">headline / dek</span> →{" "}
                <span className="text-foreground">title</span>, <span className="text-foreground">excerpt</span>.
              </li>
              <li>
                <span className="text-foreground">hero_asset.url</span> →{" "}
                <span className="text-foreground">cover</span>.
              </li>
              <li>
                <span className="text-foreground">outlet.name</span> →{" "}
                <span className="text-foreground">source</span> (must match allowed union for
                colors).
              </li>
              <li>
                <span className="text-foreground">desk / vertical</span> →{" "}
                <span className="text-foreground">category</span>.
              </li>
              <li>
                <span className="text-foreground">published_at</span> → ISO{" "}
                <span className="text-foreground">publishedAt</span>.
              </li>
              <li>
                <span className="text-foreground">analytics.views</span> → optional{" "}
                <span className="text-foreground">reads</span>.
              </li>
            </ul>
            <div className="rounded-2xl border border-dashed border-border/80 bg-surface/30 p-6 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Detail route additions</p>
              <p className="mt-2">
                The article page also consumes <span className="text-foreground">body</span> (string
                paragraphs), <span className="text-foreground">author</span>, and optional{" "}
                <span className="text-foreground">relatedGameSlug</span> for cross-links into the
                game directory.
              </p>
              <p className="mt-3">
                Optional fields like <span className="text-foreground">reads</span> and editorial
                tags are ideal for trust signals, popularity modules, and recommendation ranking.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function SectionEyebrow({ icon, label }: { icon?: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 font-mono-accent text-[11px] uppercase tracking-[0.32em] text-primary">
        <span className="h-px w-8 bg-primary" />
        {icon}
        Section
      </div>
      <h2 className="font-display text-xl md:text-2xl font-bold leading-none tracking-tight">
        {label}
      </h2>
      <span className="h-[2px] w-16 bg-gradient-to-r from-primary via-accent to-transparent" />
    </div>
  );
}
