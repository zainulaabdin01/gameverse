import { Link } from "@tanstack/react-router";
import { BookOpen, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useMounted } from "@/hooks/use-mounted";

export interface RefSection {
  id: string;
  index: string;
  label: string;
}

export interface RefStat {
  label: string;
  value: string;
}

interface Props {
  domain: "News" | "Games" | "Esports";
  domainColor: string; // hex for accent dot
  backTo: string;
  backLabel: string;
  title: React.ReactNode;
  description: string;
  stats: RefStat[];
  sections: RefSection[];
  children: React.ReactNode;
}

export function ReferenceShell({
  domain,
  domainColor,
  backTo,
  backLabel,
  title,
  description,
  stats,
  sections,
  children,
}: Props) {
  const mounted = useMounted();
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
        <div className="bg-aurora absolute inset-0 opacity-40" />
        <div className="bg-grid absolute inset-0 opacity-[0.12]" />
        <div className="absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-primary/15 blur-[110px]" />
        <div className="absolute -bottom-32 -right-32 h-[420px] w-[420px] rounded-full bg-accent/15 blur-[110px]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-background" />
        <div className="relative mx-auto max-w-[1400px] px-4 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 py-2 font-mono-accent text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            <nav className="flex items-center gap-1.5">
              <Link to={backTo} className="transition-colors hover:text-foreground">
                {backLabel.replace("← ", "").replace(" hub", "").replace(" directory", "")}
              </Link>
              <ChevronRight className="h-3 w-3 opacity-60" />
              <span className="text-foreground">Reference</span>
              <ChevronRight className="h-3 w-3 opacity-60" />
              <span>{domain}</span>
            </nav>
            <span className="flex items-center gap-2">
              <BookOpen className="h-3 w-3 text-primary" />
              {mounted
                ? new Date().toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : ""}
            </span>
          </div>

          <div className="grid items-end gap-8 py-8 md:grid-cols-12 md:py-12">
            <div className="md:col-span-8">
              <div className="flex items-center gap-2 font-mono-accent text-[10px] uppercase tracking-[0.4em] text-primary">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: domainColor, boxShadow: `0 0 12px ${domainColor}` }}
                />
                {domain} · Implementation reference
              </div>
              <h1
                className="mt-3 font-display font-bold leading-[0.95] tracking-tight"
                style={{ fontSize: "clamp(2.25rem, 6vw, 4rem)" }}
              >
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
                {description}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
                <Link
                  to={backTo}
                  className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface/60 px-4 py-2 font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  {backLabel}
                </Link>
                <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-2 font-mono-accent uppercase tracking-[0.2em] text-primary">
                  v1 contract
                </span>
              </div>
            </div>

            <div className="md:col-span-4">
              <div className="grid grid-cols-2 gap-2 rounded-2xl border border-border/60 bg-background/50 p-3 backdrop-blur">
                {stats.map((s) => (
                  <div key={s.label} className="rounded-xl bg-surface/50 px-3 py-3">
                    <p className="font-mono-accent text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                      {s.label}
                    </p>
                    <p className="mt-1 font-display text-lg font-bold leading-none">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-12 md:px-8 md:py-16 lg:grid-cols-12">
        <aside className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-24 space-y-3">
            <p className="font-mono-accent text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              In this guide
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

        <main className="space-y-20 lg:col-span-9">{children}</main>
      </div>
    </div>
  );
}

export function RefSectionHeading({
  index,
  eyebrow,
  title,
  description,
  id,
}: {
  index: string;
  eyebrow: string;
  title: string;
  description?: string;
  id: string;
}) {
  return (
    <div id={id} className="scroll-mt-24">
      <div className="flex items-center gap-3 font-mono-accent text-[10px] uppercase tracking-[0.32em] text-primary">
        <span className="rounded-md border border-primary/40 bg-primary/10 px-2 py-0.5">
          {index}
        </span>
        <span className="h-px w-10 bg-gradient-to-r from-primary to-transparent" />
        {eyebrow}
      </div>
      <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">{description}</p>
      )}
      <span className="mt-4 block h-[2px] w-24 bg-gradient-to-r from-primary via-accent to-transparent" />
    </div>
  );
}

export function CodeBlock({
  language,
  code,
  filename,
}: {
  language: string;
  code: string;
  filename?: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-background/70">
      <div className="flex items-center justify-between border-b border-border/60 bg-surface/40 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-primary-glow/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
          {filename && (
            <span className="ml-3 font-mono-accent text-[11px] text-muted-foreground">
              {filename}
            </span>
          )}
        </div>
        <span className="font-mono-accent text-[10px] uppercase tracking-wider text-primary">
          {language}
        </span>
      </div>
      <pre className="overflow-x-auto px-5 py-4 text-[12.5px] leading-relaxed">
        <code className="font-mono text-foreground/90">{code}</code>
      </pre>
    </div>
  );
}

export function FieldRow({
  name,
  type,
  required,
  desc,
}: {
  name: string;
  type: string;
  required?: boolean;
  desc: string;
}) {
  return (
    <div className="grid gap-2 border-b border-border/40 px-4 py-3 last:border-b-0 md:grid-cols-[180px_140px_1fr] md:items-baseline md:gap-4">
      <div className="flex items-center gap-2">
        <code className="font-mono text-sm text-foreground">{name}</code>
        {required && (
          <span className="font-mono-accent text-[9px] uppercase tracking-wider text-primary">
            required
          </span>
        )}
      </div>
      <code className="font-mono text-xs text-accent">{type}</code>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

export function FieldTable({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-background/40">
      <div className="flex items-center justify-between border-b border-border/60 bg-surface/40 px-4 py-3">
        <p className="font-display text-sm font-semibold">{title}</p>
        <p className="hidden font-mono-accent text-[10px] uppercase tracking-[0.22em] text-muted-foreground md:block">
          field · type · description
        </p>
      </div>
      <div>{children}</div>
    </div>
  );
}
