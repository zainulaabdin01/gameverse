import { Link } from "@tanstack/react-router";
import type { Game } from "@/data/games";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface Props {
  game: Game;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function GameCard({ game, className, size = "md" }: Props) {
  return (
    <Link
      to="/games/$slug"
      params={{ slug: game.slug }}
      className={cn(
        "group relative block overflow-hidden rounded-xl border border-border/60 bg-surface hover-lift",
        className,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden",
          size === "sm" && "aspect-[3/4]",
          size === "md" && "aspect-[4/5]",
          size === "lg" && "aspect-[16/9]",
        )}
      >
        <img
          src={game.cover}
          alt={game.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-background/80 px-2 py-1 backdrop-blur">
          <Star className="h-3 w-3 fill-primary text-primary" />
          <span className="font-mono-accent text-xs font-semibold">{game.rating}</span>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-3">
        <h3 className="font-display text-sm font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-1">
          {game.title}
        </h3>
        <div className="mt-1 flex items-center gap-1.5 text-[10px] font-mono-accent uppercase text-muted-foreground">
          <span>{game.genres[0]}</span>
          <span>·</span>
          <span>{game.platforms.slice(0, 3).join(" / ")}</span>
        </div>
      </div>
    </Link>
  );
}
