import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { getTickerDataFn, listMatchesFn } from "@/queries/esports";
import { formatViewers, timeUntil } from "@/lib/format";
import { useMounted } from "@/hooks/use-mounted";
import type { Match } from "@/data/esports";

/** Fetch real ticker data from database */
function useTickerData() {
  const [data, setData] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    let mounted = true;
    
    const fetchData = async () => {
      try {
        const tickerData = await getTickerDataFn();
        if (mounted) {
          setData(tickerData);
        }
      } catch (error) {
        console.error('Failed to fetch ticker data:', error);
        // Fallback to empty array if database is unavailable
        if (mounted) {
          setData([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    // Refresh every 30 seconds to get latest live data
    const interval = setInterval(fetchData, 30000);
    
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);
  
  return { data, loading };
}

export function LiveTicker() {
  const { data: live, loading } = useTickerData();
  
  // Get upcoming matches for ticker
  const [upcoming, setUpcoming] = useState<Match[]>([]);
  
  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const upcomingData = await listMatchesFn({ data: { status: "upcoming", limit: 4 } });
        setUpcoming(upcomingData);
      } catch (error) {
        console.error('Failed to fetch upcoming matches:', error);
        setUpcoming([]);
      }
    };
    
    fetchUpcoming();
    const interval = setInterval(fetchUpcoming, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Combine live and upcoming matches
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
  // For ticker, we'll show team IDs as fallback since we don't have full team data
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
          <span className="h-2 w-2 rounded-full bg-muted" />
          {match.teamAId}
        </span>
        <span className="font-mono-accent text-foreground">
          {match.scoreA} <span className="text-muted-foreground">:</span> {match.scoreB}
        </span>
        <span className="flex items-center gap-1.5">
          {match.teamBId}
          <span className="h-2 w-2 rounded-full bg-muted" />
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
