import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  to?: string;
  cta?: string;
  className?: string;
}

export function SectionHeader({ eyebrow, title, description, to, cta, className }: Props) {
  return (
    <div className={cn("flex items-end justify-between gap-4 mb-6", className)}>
      <div className="min-w-0">
        {eyebrow && (
          <div className="font-mono-accent text-[11px] uppercase tracking-[0.2em] text-primary mb-2">
            {eyebrow}
          </div>
        )}
        <h2 className="font-display text-2xl md:text-3xl font-bold leading-tight">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground max-w-xl">{description}</p>
        )}
      </div>
      {to && cta && (
        <Link
          to={to}
          className="group hidden md:flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          {cta}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
