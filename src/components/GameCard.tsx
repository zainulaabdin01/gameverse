import { Link } from "@tanstack/react-router";
import type { Game } from "@/data/games";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface Props {
  game: Game;
  className?: string;
  size?: "sm" | "md" | "lg";
  /** When true, renders the same visuals without a link (e.g. field reference pages). */
  asStatic?: boolean;
  /** When true, links to the Games field reference instead of the game detail route. */
  linkFieldReference?: boolean;
}

export const genreColors: Record<string, string> = {
  Action: "text-red-200 bg-red-500/30 border-red-500/50",
  RPG: "text-purple-200 bg-purple-500/30 border-purple-500/50",
  Shooter: "text-orange-200 bg-orange-500/30 border-orange-500/50",
  Strategy: "text-blue-200 bg-blue-500/30 border-blue-500/50",
  Adventure: "text-emerald-200 bg-emerald-500/30 border-emerald-500/50",
  Sports: "text-yellow-200 bg-yellow-500/30 border-yellow-500/50",
  Racing: "text-sky-200 bg-sky-500/30 border-sky-500/50",
  Indie: "text-pink-200 bg-pink-500/30 border-pink-500/50",
  MMO: "text-indigo-200 bg-indigo-500/30 border-indigo-500/50",
  Fighting: "text-rose-200 bg-rose-500/30 border-rose-500/50",
  Simulation: "text-teal-200 bg-teal-500/30 border-teal-500/50",
  Horror: "text-zinc-200 bg-zinc-500/30 border-zinc-500/50",
};

export function GameCard({ game, className, size = "md", asStatic, linkFieldReference }: Props) {
  const shell =
    "group relative block overflow-hidden rounded-xl border border-border/60 bg-surface hover-lift";
  const inner = (
    <>
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
          <span className="font-mono-accent text-xs font-semibold">{(game.rating / 10).toFixed(1)}</span>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-3">
        <h3 className="font-display text-sm font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-1">
          {game.title}
        </h3>
        <div className="mt-1 flex items-center gap-1.5 text-[10px] font-mono-accent uppercase text-muted-foreground">
          <span
            className={cn(
              "rounded-md border px-1.5 py-0.5 backdrop-blur",
              genreColors[game.genres[0]] || "bg-surface/30 text-muted-foreground border-border/50"
            )}
          >
            {game.genres[0] || "Game"}
          </span>
          <span>·</span>
          <span>{game.platforms.slice(0, 3).join(" / ") || "TBD"}</span>
        </div>
      </div>
    </>
  );

  if (asStatic) {
    return <div className={cn(shell, className)}>{inner}</div>;
  }
  if (linkFieldReference) {
    return (
      <Link to="/reference/games" className={cn(shell, className)}>
        {inner}
      </Link>
    );
  }
  return (
    <Link to="/games/$slug" params={{ slug: game.slug }} className={cn(shell, className)}>
      {inner}
    </Link>
  );
}
