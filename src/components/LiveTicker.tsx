import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { liveMatches, upcomingMatches, getTeam, type Match } from "@/data/esports";
import { formatViewers, timeUntil } from "@/lib/format";
import { useMounted } from "@/hooks/use-mounted";

/** Subtle live nudge: tweak scores/viewers periodically to feel alive. */
function useLiveNudge(initial: Match[]) {
  const [items, setItems] = useState(initial);
  useEffect(() => {
    const id = setInterval(() => {
      setItems((prev) =>
        prev.map((m) => {
          if (m.status !== "live") return m;
          const bumpA = Math.random() < 0.15 ? 1 : 0;
          const bumpB = !bumpA && Math.random() < 0.15 ? 1 : 0;
          const viewerDelta = Math.floor((Math.random() - 0.45) * 1500);
          return {
            ...m,
            scoreA: m.scoreA + bumpA,
            scoreB: m.scoreB + bumpB,
            viewers: Math.max(1000, (m.viewers ?? 0) + viewerDelta),
          };
        }),
      );
    }, 4000);
    return () => clearInterval(id);
  }, []);
  return items;
}

export function LiveTicker() {
  const live = useLiveNudge(liveMatches());
  const upcoming = upcomingMatches().slice(0, 4);

  // Duplicate items for seamless loop
  const items = [...live, ...upcoming];
  const stream = [...items, ...items];

  if (items.length === 0) return null;

  return (
    <div className="border-b border-border/60 bg-surface/60 backdrop-blur">
      <div className="relative mx-auto flex max-w-[1400px] items-center gap-3 px-4 md:px-8">
        <div className="hidden md:flex items-center gap-2 py-2 pr-4 border-r border-border/60">
          <span className="live-dot" />
          <span className="font-mono-accent text-[10px] uppercase tracking-widest text-muted-foreground">
            Live & next
          </span>
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div className="flex w-max animate-ticker gap-6 py-2">
            {stream.map((m, idx) => (
              <TickerItem key={`${m.id}-${idx}`} match={m} />
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-surface/95 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-surface/95 to-transparent" />
        </div>
      </div>
    </div>
  );
}

function TickerItem({ match }: { match: Match }) {
  const a = getTeam(match.teamAId);
  const b = getTeam(match.teamBId);
  const mounted = useMounted();
  return (
    <Link
      to="/esports/$matchId"
      params={{ matchId: match.id }}
      className="group flex items-center gap-3 whitespace-nowrap text-xs"
    >
      <span className="font-mono-accent uppercase text-[10px] text-muted-foreground">
        {match.game}
      </span>
      {match.status === "live" ? (
        <span className="flex items-center gap-1.5 font-mono-accent uppercase text-[10px] text-[oklch(var(--live))]">
          <span className="live-dot" /> LIVE
        </span>
      ) : (
        <span className="font-mono-accent uppercase text-[10px] text-muted-foreground">
          {mounted ? timeUntil(match.startsAt) : "soon"}
        </span>
      )}
      <span className="flex items-center gap-2 font-medium group-hover:text-primary transition-colors">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: a.logoColor }} />
          {a.tag}
        </span>
        <span className="font-mono-accent text-foreground">
          {match.scoreA} <span className="text-muted-foreground">:</span> {match.scoreB}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: b.logoColor }} />
          {b.tag}
        </span>
      </span>
      {match.viewers && (
        <span className="font-mono-accent text-[10px] text-muted-foreground">
          👁 {formatViewers(match.viewers)}
        </span>
      )}
    </Link>
  );
}
