import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  to?: string;
  cta?: string;
  index?: string; // e.g. "01"
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  to,
  cta,
  index,
  className,
}: Props) {
  return (
    <div className={cn("mb-8 flex items-end justify-between gap-6", className)}>
      <div className="flex min-w-0 gap-5">
        {index && (
          <div className="hidden md:flex flex-col items-end pt-1">
            <span className="font-mono-accent text-[11px] tracking-widest text-primary">
              {index}
            </span>
            <span className="mt-1 h-12 w-px bg-gradient-to-b from-primary/70 to-transparent" />
          </div>
        )}
        <div className="min-w-0">
          {eyebrow && (
            <div className="mb-2 flex items-center gap-2 font-mono-accent text-[11px] uppercase tracking-[0.25em] text-primary">
              <span className="inline-block h-px w-6 bg-primary" />
              {eyebrow}
            </div>
          )}
          <h2 className="font-display text-3xl md:text-4xl font-bold leading-[1.05] tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="mt-2 max-w-xl text-sm md:text-base text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      {to && cta && (
        <Link
          to={to}
          className="group hidden md:flex flex-shrink-0 items-center gap-2 rounded-full border border-border/60 bg-surface/60 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
        >
          {cta}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
