import { Link } from "@tanstack/react-router";
import type { Match } from "@/data/esports";
import { getTeam } from "@/data/esports";
import { formatViewers, timeUntil } from "@/lib/format";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";

interface Props {
  match: Match;
  className?: string;
  /** When true, renders the same visuals without a link (e.g. field reference pages). */
  asStatic?: boolean;
  /** When true, links to the Esports field reference instead of the match detail route. */
  linkFieldReference?: boolean;
}

export function MatchCard({ match, className, asStatic, linkFieldReference }: Props) {
  const a = getTeam(match.teamAId);
  const b = getTeam(match.teamBId);
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";
  const winner = isFinished ? (match.scoreA > match.scoreB ? "a" : "b") : null;
  const mounted = useMounted();

  const shell =
    "group flex flex-col gap-3 rounded-xl border border-border/60 bg-surface p-4 hover-lift transition-colors hover:border-primary/40";

  const inner = (
    <>
      <div className="flex items-center justify-between">
        <span className="font-mono-accent text-[10px] uppercase tracking-wider text-muted-foreground">
          {match.game} · {match.tournament}
        </span>
        {isLive && (
          <span className="flex items-center gap-1.5 rounded-full bg-[oklch(var(--live)/0.15)] px-2 py-0.5 text-[10px] font-mono-accent uppercase text-[oklch(var(--live))]">
            <span className="live-dot" />
            LIVE
          </span>
        )}
        {match.status === "upcoming" && (
          <span className="font-mono-accent text-[10px] uppercase text-muted-foreground">
            {mounted ? timeUntil(match.startsAt) : "soon"}
          </span>
        )}
        {isFinished && (
          <span className="font-mono-accent text-[10px] uppercase text-muted-foreground">
            FINAL
          </span>
        )}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <TeamSide team={a} dim={winner === "b"} />
        <div className="flex flex-col items-center font-display">
          <div className="flex items-center gap-2 text-2xl font-bold tabular-nums">
            <span className={cn(winner === "b" && "text-muted-foreground")}>{match.scoreA}</span>
            <span className="text-muted-foreground/60">:</span>
            <span className={cn(winner === "a" && "text-muted-foreground")}>{match.scoreB}</span>
          </div>
          <span className="mt-0.5 font-mono-accent text-[10px] uppercase text-muted-foreground">
            {match.format}
          </span>
        </div>
        <TeamSide team={b} dim={winner === "a"} align="right" />
      </div>

      {(match.currentMap || match.viewers) && (
        <div className="flex items-center justify-between border-t border-border/60 pt-3 text-[11px] font-mono-accent uppercase text-muted-foreground">
          <span>{match.currentMap ?? "—"}</span>
          {match.viewers && <span>👁 {formatViewers(match.viewers)} watching</span>}
        </div>
      )}
    </>
  );

  if (asStatic) {
    return <div className={cn(shell, className)}>{inner}</div>;
  }
  if (linkFieldReference) {
    return (
      <Link to="/reference/esports" className={cn(shell, className)}>
        {inner}
      </Link>
    );
  }
  return (
    <Link to="/esports/$matchId" params={{ matchId: match.id }} className={cn(shell, className)}>
      {inner}
    </Link>
  );
}

function TeamSide({
  team,
  dim,
  align = "left",
}: {
  team: ReturnType<typeof getTeam>;
  dim?: boolean;
  align?: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        align === "right" && "flex-row-reverse text-right",
        dim && "opacity-60",
      )}
    >
      <div
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg font-display text-xs font-bold text-background"
        style={{ background: team.logoColor }}
      >
        {team.tag}
      </div>
      <div className="min-w-0">
        <div className="truncate font-display text-sm font-semibold">{team.name}</div>
        <div className="font-mono-accent text-[10px] uppercase text-muted-foreground">
          {team.region}
        </div>
      </div>
    </div>
  );
}
