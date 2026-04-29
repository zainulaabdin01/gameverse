import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MatchCard } from "@/components/MatchCard";
import { SectionHeader } from "@/components/SectionHeader";
import {
  esportsGames,
  liveMatches,
  upcomingMatches,
  finishedMatches,
  teamsByGame,
  playersByGame,
  type EsportsGame,
} from "@/data/esports";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/esports")({
  head: () => ({
    meta: [
      { title: "Esports Stats — Gameverse" },
      {
        name: "description",
        content:
          "Live match scores, upcoming tournaments, team standings and player stats across Valorant, CS2, League of Legends and Dota 2.",
      },
      { property: "og:title", content: "Esports Stats — Gameverse" },
      {
        property: "og:description",
        content: "Live scores, standings and player stats — all in one scoreboard.",
      },
    ],
  }),
  component: EsportsPage,
});

function EsportsPage() {
  const [filter, setFilter] = useState<EsportsGame | "all">("all");

  const live = useMemo(
    () => liveMatches().filter((m) => filter === "all" || m.game === filter),
    [filter],
  );
  const upcoming = useMemo(
    () => upcomingMatches().filter((m) => filter === "all" || m.game === filter),
    [filter],
  );
  const finished = useMemo(
    () => finishedMatches().filter((m) => filter === "all" || m.game === filter),
    [filter],
  );

  const standingsGames: EsportsGame[] =
    filter === "all" ? esportsGames : [filter];

  return (
    <div>
      <header className="border-b border-border/60 bg-surface/40">
        <div className="mx-auto max-w-[1400px] px-4 py-12 md:px-8">
          <div className="font-mono-accent text-[11px] uppercase tracking-[0.3em] text-primary">
            ▍ Esports HQ
          </div>
          <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">
            Live scores. Real standings. <span className="gradient-text">No tabs.</span>
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Everything happening in Valorant, CS2, League and Dota — current matches, upcoming
            tournaments, team standings and the players setting the meta.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Pill active={filter === "all"} onClick={() => setFilter("all")}>
              All games
            </Pill>
            {esportsGames.map((g) => (
              <Pill key={g} active={filter === g} onClick={() => setFilter(g)}>
                {g}
              </Pill>
            ))}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1400px] px-4 py-12 md:px-8">
        <SectionHeader
          eyebrow="On now"
          title="Live matches"
          description="Score updates roll in every few seconds."
        />
        {live.length === 0 ? (
          <EmptyRow>No live matches in this filter right now.</EmptyRow>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {live.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-[1400px] px-4 pb-12 md:px-8">
        <SectionHeader eyebrow="Coming up" title="Upcoming matches" />
        {upcoming.length === 0 ? (
          <EmptyRow>Nothing scheduled yet.</EmptyRow>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {upcoming.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-[1400px] px-4 pb-12 md:px-8">
        <SectionHeader eyebrow="Recent" title="Latest results" />
        {finished.length === 0 ? (
          <EmptyRow>No recent results.</EmptyRow>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {finished.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-[1400px] px-4 pb-16 md:px-8 space-y-12">
        {standingsGames.map((game) => (
          <div key={game}>
            <SectionHeader eyebrow="Standings" title={`${game} — Season Table`} />
            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <StandingsTable game={game} />
              <PlayersBoard game={game} />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-primary/60 bg-primary/15 text-primary"
          : "border-border bg-surface text-muted-foreground hover:text-foreground hover:border-primary/40",
      )}
    >
      {children}
    </button>
  );
}

function EmptyRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-border bg-surface/40 text-sm text-muted-foreground">
      {children}
    </div>
  );
}

function StandingsTable({ game }: { game: EsportsGame }) {
  const teams = teamsByGame(game);
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-surface">
      <table className="w-full text-sm">
        <thead className="bg-surface-2 text-[10px] font-mono-accent uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left">#</th>
            <th className="px-4 py-3 text-left">Team</th>
            <th className="px-4 py-3 text-right">W</th>
            <th className="px-4 py-3 text-right">L</th>
            <th className="px-4 py-3 text-right">PTS</th>
            <th className="px-4 py-3 text-right">Form</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((t, i) => (
            <tr key={t.id} className="border-t border-border/60 hover:bg-surface-2/50">
              <td className="px-4 py-3 font-mono-accent text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded font-display text-[10px] font-bold text-background"
                    style={{ background: t.logoColor }}
                  >
                    {t.tag}
                  </span>
                  <span className="font-medium">{t.name}</span>
                  <span className="text-[10px] font-mono-accent uppercase text-muted-foreground">
                    {t.region}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-right tabular-nums">{t.wins}</td>
              <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                {t.losses}
              </td>
              <td className="px-4 py-3 text-right font-display font-semibold text-primary">
                {t.points}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  {t.formStreak.map((r, idx) => (
                    <span
                      key={idx}
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded font-mono-accent text-[10px] font-bold",
                        r === "W"
                          ? "bg-[oklch(var(--success)/0.2)] text-[oklch(var(--success))]"
                          : "bg-[oklch(var(--live)/0.2)] text-[oklch(var(--live))]",
                      )}
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PlayersBoard({ game }: { game: EsportsGame }) {
  const players = playersByGame(game);
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-surface">
      <div className="border-b border-border/60 bg-surface-2 px-4 py-2.5 text-[10px] font-mono-accent uppercase tracking-wider text-muted-foreground">
        Top Players
      </div>
      <ul>
        {players.map((p, i) => (
          <li
            key={p.id}
            className="flex items-center gap-3 border-t border-border/60 px-4 py-3 first:border-t-0"
          >
            <span className="w-6 font-mono-accent text-xs text-muted-foreground">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-display font-semibold leading-tight truncate">
                {p.handle}
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {p.realName}
                </span>
              </div>
              <div className="font-mono-accent text-[10px] uppercase text-muted-foreground">
                {p.role} · {p.signature}
              </div>
            </div>
            <div className="text-right">
              <div className="font-display font-semibold text-primary tabular-nums">
                {p.rating.toFixed(2)}
              </div>
              <div className="font-mono-accent text-[10px] uppercase text-muted-foreground">
                KDA {p.kda.toFixed(2)}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
