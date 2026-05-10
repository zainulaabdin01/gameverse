import { createFileRoute, Link, useRouter, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { getMatch, getTeam, playersByGame, matchesByGame } from "@/data/esports";
import { MatchCard } from "@/components/MatchCard";
import { formatViewers, timeUntil } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/esports_/$matchId")({
  loader: ({ params }) => {
    const match = getMatch(params.matchId);
    if (!match) throw notFound();
    return { match };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [] };
    const a = getTeam(loaderData.match.teamAId);
    const b = getTeam(loaderData.match.teamBId);
    const title = `${a.name} vs ${b.name} — ${loaderData.match.tournament}`;
    return {
      meta: [
        { title: `${title} — Gameverse` },
        {
          name: "description",
          content: `${title}. Live scores, maps and player stats on Gameverse.`,
        },
        { property: "og:title", content: title },
      ],
    };
  },
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Match unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground"
        >
          Try again
        </button>
      </div>
    );
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-bold">Match not found</h1>
      <Link to="/esports" className="mt-4 inline-block text-primary">
        Back to Esports →
      </Link>
    </div>
  ),
  component: MatchPage,
});

function MatchPage() {
  const { match } = Route.useLoaderData();
  const a = getTeam(match.teamAId);
  const b = getTeam(match.teamBId);
  const playersA = playersByGame(match.game).filter((p) => p.teamId === a.id);
  const playersB = playersByGame(match.game).filter((p) => p.teamId === b.id);
  const otherFromTournament = matchesByGame(match.game)
    .filter((m) => m.id !== match.id && m.tournament === match.tournament)
    .slice(0, 3);

  return (
    <div>
      <div className="border-b border-border/60 bg-surface/40">
        <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-8">
          <Link
            to="/esports"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Esports
          </Link>
          <div className="mt-2 flex items-center gap-3 font-mono-accent text-[11px] uppercase tracking-widest text-muted-foreground">
            <span>{match.game}</span>
            <span>·</span>
            <span>{match.tournament}</span>
            <span>·</span>
            <span>{match.format}</span>
            {match.status === "live" && (
              <span className="flex items-center gap-1.5 text-[oklch(var(--live))]">
                <span className="live-dot" /> LIVE
              </span>
            )}
            {match.status === "upcoming" && <span>{timeUntil(match.startsAt)}</span>}
            {match.status === "finished" && <span>FINAL</span>}
          </div>

          <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-6">
            <BigTeam team={a} />
            <div className="text-center font-display">
              <div className="text-5xl font-bold tabular-nums md:text-7xl">
                <span>{match.scoreA}</span>
                <span className="text-muted-foreground/50"> : </span>
                <span>{match.scoreB}</span>
              </div>
              {match.currentMap && (
                <div className="mt-2 font-mono-accent text-xs uppercase text-muted-foreground">
                  {match.currentMap}
                </div>
              )}
              {match.viewers && (
                <div className="mt-1 font-mono-accent text-xs uppercase text-muted-foreground">
                  👁 {formatViewers(match.viewers)} watching
                </div>
              )}
            </div>
            <BigTeam team={b} align="right" />
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-[1200px] px-4 py-12 md:px-8">
        <h2 className="font-display text-xl font-bold mb-4">Player stats</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <RosterTable team={a} players={playersA} />
          <RosterTable team={b} players={playersB} />
        </div>
      </section>

      {otherFromTournament.length > 0 && (
        <section className="mx-auto max-w-[1200px] px-4 pb-16 md:px-8">
          <h2 className="font-display text-xl font-bold mb-4">More from {match.tournament}</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {otherFromTournament.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function BigTeam({
  team,
  align = "left",
}: {
  team: ReturnType<typeof getTeam>;
  align?: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-4",
        align === "right" && "flex-row-reverse text-right",
      )}
    >
      <div
        className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl font-display text-base font-bold text-background md:h-20 md:w-20 md:text-xl"
        style={{ background: team.logoColor }}
      >
        {team.tag}
      </div>
      <div className="min-w-0">
        <div className="font-display text-2xl font-bold leading-tight md:text-3xl">
          {team.name}
        </div>
        <div className="font-mono-accent text-xs uppercase text-muted-foreground">
          {team.region} · {team.wins}W – {team.losses}L
        </div>
      </div>
    </div>
  );
}

function RosterTable({
  team,
  players,
}: {
  team: ReturnType<typeof getTeam>;
  players: ReturnType<typeof playersByGame>;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-surface">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
        <span
          className="flex h-7 w-7 items-center justify-center rounded font-display text-[10px] font-bold text-background"
          style={{ background: team.logoColor }}
        >
          {team.tag}
        </span>
        <span className="font-display font-semibold">{team.name}</span>
      </div>
      {players.length === 0 ? (
        <div className="px-4 py-6 text-sm text-muted-foreground">No tracked players yet.</div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-[10px] font-mono-accent uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 text-left">Player</th>
              <th className="px-4 py-2.5 text-left">Role</th>
              <th className="px-4 py-2.5 text-right">Rating</th>
              <th className="px-4 py-2.5 text-right">KDA</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p.id} className="border-t border-border/60">
                <td className="px-4 py-3">
                  <div className="font-medium">{p.handle}</div>
                  <div className="text-[10px] font-mono-accent uppercase text-muted-foreground">
                    {p.signature}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.role}</td>
                <td className="px-4 py-3 text-right tabular-nums text-primary font-semibold">
                  {p.rating.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                  {p.kda.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
