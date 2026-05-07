import { createFileRoute } from "@tanstack/react-router";
import { Bookmark, CalendarDays, FileJson, Quote, Share2, Sparkles, UserRound } from "lucide-react";
import { ArticleCard } from "@/components/ArticleCard";
import {
  CodeBlock,
  FieldRow,
  FieldTable,
  RefSectionHeading,
  ReferenceShell,
} from "@/components/reference/ReferenceShell";
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
    "The most notable announcement is a public story editor that lets players remix moments from each chapter using curated scene blocks. Teams describe this as 'modding without the friction,' and the internal benchmark is to keep an end-to-end publish flow under ten minutes.",
    "Analysts believe the move could shift expectations for premium games that usually rely on one major review cycle. By leaning into eventized launches, episodic beats, and social distribution, Afterlight is now competing for audience attention in a rhythm more common to live service ecosystems.",
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
    body: ["Sample"],
    source: "IGN",
    category: "Updates",
    author: "Casey Wren",
    publishedAt: new Date(Date.now() - 5 * 3600_000).toISOString(),
    cover: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&h=800&q=80",
    relatedGameSlug: "eldoria-rising",
    reads: 143_000,
  },
  {
    slug: "reference-related-story-2",
    title: "Valor Arena Champions viewership spikes 38% after format revamp",
    excerpt: "Swiss stage refinements and cleaner broadcast overlays boosted completion rates across regions.",
    body: ["Sample"],
    source: "Dot Esports",
    category: "Esports",
    author: "Sami Ortega",
    publishedAt: new Date(Date.now() - 9 * 3600_000).toISOString(),
    cover: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=1200&h=800&q=80",
    relatedGameSlug: "valor-arena",
    reads: 189_400,
  },
  {
    slug: "reference-related-story-3",
    title: "Neon Protocol's official mod kit shipped with campaign-quality templates",
    excerpt: "Creators now have access to AI behavior graphs, mission triggers, and cinematic event hooks.",
    body: ["Sample"],
    source: "Polygon",
    category: "Reviews",
    author: "Devon Maine",
    publishedAt: new Date(Date.now() - 16 * 3600_000).toISOString(),
    cover: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=1200&h=800&q=80",
    relatedGameSlug: "neon-protocol",
    reads: 97_300,
  },
];

const sampleJson = `{
  "slug": "afterlight-roadmap-deep-dive",
  "title": "Afterlight's post-launch roadmap...",
  "excerpt": "Three expansions, creator tools...",
  "source": "PC Gamer",
  "category": "Industry",
  "author": "Jordan Kell",
  "publishedAt": "2026-05-07T14:32:00.000Z",
  "cover": "https://cdn.gameverse.app/articles/afterlight-hero.jpg",
  "relatedGameSlug": "afterlight",
  "featured": true,
  "reads": 248600
}`;

const sampleType = `export interface Article {
  slug: string;          // URL identifier
  title: string;
  excerpt: string;       // ~160 chars
  body: string[];        // paragraphs
  source: NewsSource;    // enum: IGN | Kotaku | ...
  category: NewsCategory;
  author: string;
  publishedAt: string;   // ISO 8601
  cover: string;         // 16:9 hero
  relatedGameSlug?: string;
  featured?: boolean;
  reads?: number;
}`;

const sections = [
  { id: "hero", index: "01", label: "Article hero anatomy" },
  { id: "body", index: "02", label: "Editorial body & callouts" },
  { id: "discovery", index: "03", label: "Related & discovery rails" },
  { id: "schema", index: "04", label: "Schema & field contract" },
  { id: "mapping", index: "05", label: "Backend mapping" },
];

function NewsReferencePage() {
  const mounted = useMounted();

  return (
    <ReferenceShell
      domain="News"
      domainColor="#f472b6"
      backTo="/news"
      backLabel="← Back to News hub"
      title={
        <>
          The <span className="gradient-text">News</span>
          <br />
          article blueprint
        </>
      }
      description="Every editorial surface — from premium long-reads to compact rails — derives from the same Article model. This page documents every field, every variant, and the backend contract."
      stats={[
        { label: "Fields", value: "12" },
        { label: "Card variants", value: "3" },
        { label: "Required", value: "8" },
        { label: "Routes", value: "/news/$slug" },
      ]}
      sections={sections}
    >
      <section className="space-y-6">
        <RefSectionHeading
          id="hero"
          index="01"
          eyebrow="Hero composition"
          title="Premium article hero"
          description="The detail page leads with an immersive 16:9 cover, badge stack, headline, deck, and byline strip."
        />

        <article className="overflow-hidden rounded-3xl border border-border/60 bg-surface/30">
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
              <h2 className="mt-4 max-w-4xl font-display text-2xl font-bold leading-tight md:text-4xl">
                {featuredArticle.title}
              </h2>
              <p className="mt-3 max-w-3xl text-sm text-muted-foreground md:text-base">
                {featuredArticle.excerpt}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/60 px-6 py-4 text-xs text-muted-foreground md:px-8">
            <div className="flex flex-wrap items-center gap-4">
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
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 transition-colors hover:border-primary/50 hover:text-foreground">
                <Bookmark className="h-3.5 w-3.5" /> Save
              </button>
              <button className="flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 transition-colors hover:border-primary/50 hover:text-foreground">
                <Share2 className="h-3.5 w-3.5" /> Share
              </button>
            </div>
          </div>
        </article>

        <AnatomyGrid
          items={[
            { tag: "cover", note: "16:9 hero image, 1800×1000 minimum" },
            { tag: "category + source", note: "Two short enum chips" },
            { tag: "title", note: "h1, 2 lines max on desktop" },
            { tag: "excerpt", note: "Deck, max 200 chars" },
            { tag: "author + publishedAt", note: "Byline strip" },
            { tag: "reads", note: "Trust signal, optional" },
          ]}
        />
      </section>

      <section className="space-y-6">
        <RefSectionHeading
          id="body"
          index="02"
          eyebrow="Body & callouts"
          title="Editorial reading flow"
          description="The narrative body is rendered from a string[] of paragraphs. Pull-quote blocks add visual rhythm in long-reads."
        />
        <div className="space-y-5 rounded-3xl border border-border/60 bg-background/50 p-6 md:p-8">
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
              "We're entering an era where premium stories need live cadence, creator leverage, and
              long-tail discoverability as first-class product features."
            </p>
          </blockquote>
        </div>
      </section>

      <section className="space-y-6">
        <RefSectionHeading
          id="discovery"
          index="03"
          eyebrow="Discovery"
          title="Related rails & card variants"
          description="ArticleCard ships in featured, default, and compact variants — all driven by the same model."
        />
        <div>
          <p className="mb-3 font-mono-accent text-[10px] uppercase tracking-[0.28em] text-primary">
            <Sparkles className="mr-1 inline h-3 w-3" />
            Featured variant
          </p>
          <ArticleCard article={relatedStories[0]} variant="featured" asStatic />
        </div>
        <div>
          <p className="mb-3 font-mono-accent text-[10px] uppercase tracking-[0.28em] text-primary">
            Default grid
          </p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {relatedStories.map((article) => (
              <ArticleCard key={article.slug} article={article} asStatic />
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <RefSectionHeading
          id="schema"
          index="04"
          eyebrow="Schema"
          title="Article model & sample payload"
          description="The TypeScript shape and a representative JSON document the API should return."
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <CodeBlock language="typescript" filename="src/data/news.ts" code={sampleType} />
          <CodeBlock language="json" filename="GET /api/articles/:slug" code={sampleJson} />
        </div>

        <FieldTable title="Article fields">
          <FieldRow name="slug" type="string" required desc="URL-safe identifier; primary key for routing." />
          <FieldRow name="title" type="string" required desc="Headline; renders as h1 on detail." />
          <FieldRow name="excerpt" type="string" required desc="Deck/summary, ~160 chars." />
          <FieldRow name="body" type="string[]" required desc="Paragraphs; markdown-stripped plain text." />
          <FieldRow name="source" type="NewsSource" required desc="Enum: IGN | Kotaku | Dot Esports | PC Gamer | Eurogamer | Polygon | GameSpot." />
          <FieldRow name="category" type="NewsCategory" required desc="Enum: Esports | Reviews | Industry | Updates | Drama | Hardware." />
          <FieldRow name="author" type="string" required desc="Byline display name." />
          <FieldRow name="publishedAt" type="string (ISO)" required desc="ISO 8601 timestamp; powers sort + relative time." />
          <FieldRow name="cover" type="string (URL)" required desc="16:9 hero image, ≥1800×1000." />
          <FieldRow name="relatedGameSlug" type="string?" desc="Optional FK into Games for cross-link block." />
          <FieldRow name="featured" type="boolean?" desc="Promotes into the hero rail on /news." />
          <FieldRow name="reads" type="number?" desc="Aggregated view count for trust signal." />
        </FieldTable>
      </section>

      <section className="space-y-6">
        <RefSectionHeading
          id="mapping"
          index="05"
          eyebrow="Backend"
          title="Mapping from upstream sources"
          description="When wiring CMS or wire-feed data, normalize to the Article shape using these mappings."
        />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-background/40 p-6">
            <div className="flex items-center gap-2 font-mono-accent text-[10px] uppercase tracking-[0.28em] text-primary">
              <FileJson className="h-3.5 w-3.5" />
              Suggested mapping
            </div>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li><code className="text-foreground">articles.id</code> → keep internal; expose <code className="text-foreground">slug</code> to clients.</li>
              <li><code className="text-foreground">headline</code> → <code className="text-foreground">title</code>.</li>
              <li><code className="text-foreground">dek</code> → <code className="text-foreground">excerpt</code>.</li>
              <li><code className="text-foreground">hero_asset.url</code> → <code className="text-foreground">cover</code>.</li>
              <li><code className="text-foreground">outlet.name</code> → <code className="text-foreground">source</code> (enum-validate).</li>
              <li><code className="text-foreground">desk</code> → <code className="text-foreground">category</code>.</li>
              <li><code className="text-foreground">published_at</code> → ISO <code className="text-foreground">publishedAt</code>.</li>
              <li><code className="text-foreground">analytics.views</code> → <code className="text-foreground">reads</code>.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-dashed border-border/80 bg-surface/30 p-6 text-sm text-muted-foreground">
            <p className="font-display text-base font-semibold text-foreground">Detail-page extras</p>
            <p className="mt-2">
              The article page additionally consumes <code className="text-foreground">body</code>,{" "}
              <code className="text-foreground">author</code>, and{" "}
              <code className="text-foreground">relatedGameSlug</code> for cross-links into the
              games directory.
            </p>
            <p className="mt-3">
              Treat <code className="text-foreground">reads</code> and{" "}
              <code className="text-foreground">featured</code> as optional engagement signals — both
              degrade gracefully if missing.
            </p>
            <div className="mt-5 rounded-xl border border-primary/30 bg-primary/10 p-4">
              <p className="font-mono-accent text-[10px] uppercase tracking-[0.22em] text-primary">
                Tip
              </p>
              <p className="mt-1.5 text-foreground/90">
                Validate the <code>source</code> and <code>category</code> enums at the edge — the UI
                uses them to pick badge colors.
              </p>
            </div>
          </div>
        </div>
      </section>
    </ReferenceShell>
  );
}

function AnatomyGrid({ items }: { items: { tag: string; note: string }[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <div key={it.tag} className="rounded-xl border border-border/60 bg-background/40 p-3">
          <code className="font-mono text-xs text-primary">{it.tag}</code>
          <p className="mt-1 text-xs text-muted-foreground">{it.note}</p>
        </div>
      ))}
    </div>
  );
}
