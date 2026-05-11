import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Radio, CalendarClock, Trophy, Sparkles } from "lucide-react";
import { MatchCard } from "@/components/MatchCard";
import {
  esportsGames,
  gameColors,
  type EsportsGame,
} from "@/data/esports";
import { 
  listMatchesFn, 
  listTeamsFn, 
  listPlayersFn 
} from "@/queries/esports";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/esports/")({
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
  loader: async () => {
    const [live, upcoming, finished, teams, players] = await Promise.all([
      listMatchesFn({ data: { status: "live", limit: 50 } }),
      listMatchesFn({ data: { status: "upcoming", limit: 50 } }),
      listMatchesFn({ data: { status: "finished", limit: 50 } }),
      listTeamsFn({ data: {} }),
      listPlayersFn({ data: {} }),
    ]);
    
    return { live, upcoming, finished, teams, players };
  },
  component: EsportsPage,
});

function EsportsPage() {
  const mounted = useMounted();
  const [filter, setFilter] = useState<EsportsGame | "all">("all");
  const loaderData = Route.useLoaderData();

  const live = useMemo(
    () => loaderData.live.filter((m) => filter === "all" || m.game === filter),
    [filter, loaderData.live],
  );
  const upcoming = useMemo(
    () => loaderData.upcoming.filter((m) => filter === "all" || m.game === filter),
    [filter, loaderData.upcoming],
  );
  const finished = useMemo(
    () => loaderData.finished.filter((m) => filter === "all" || m.game === filter),
    [filter, loaderData.finished],
  );

  const standingsGames: EsportsGame[] = filter === "all" ? esportsGames : [filter];

  return (
    <div className="relative">
      {/* Nameplate — same compact editorial header as News */}
      <header className="relative overflow-hidden border-b border-border/60 bg-surface/20">
        <div className="bg-aurora absolute inset-0 opacity-40" />
        <div className="bg-grid absolute inset-0 opacity-[0.12]" />
        <div className="absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-primary/15 blur-[110px]" />
        <div className="absolute -bottom-32 -right-32 h-[420px] w-[420px] rounded-full bg-accent/15 blur-[110px]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-background" />
        <div className="relative mx-auto max-w-[1400px] px-4 md:px-8">
          <div className="flex items-center justify-between border-b border-border/40 py-2 font-mono-accent text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            <span>
              {mounted
                ? new Date().toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : ""}
            </span>
            <span className="hidden sm:inline">Esports HQ · {esportsGames.length} circuits</span>
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[oklch(var(--live))] opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[oklch(var(--live))]" />
              </span>
              {live.length} live now
            </span>
          </div>

          <div className="flex flex-col items-center py-6 text-center md:py-8">
            <div className="font-mono-accent text-[10px] uppercase tracking-[0.4em] text-primary">
              The Gameverse Scoreboard
            </div>
            <h1
              className="mt-2 font-display font-bold leading-none tracking-tight"
              style={{ fontSize: "clamp(2rem, 5.5vw, 4rem)" }}
            >
              Live<span className="italic font-medium text-muted-foreground"> &amp; </span>
              <span className="gradient-text">Standings</span>
            </h1>
            <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="h-px w-8 bg-border" />
              Scores, fixtures, tables and player ratings — refreshed continuously
              <span className="h-px w-8 bg-border" />
            </div>
          </div>
        </div>
      </header>

      {/* Sticky filter bar — matches News */}
      <div className="sticky top-16 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1400px] px-4 py-3 md:px-8">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 scrollbar-none md:mx-0 md:px-0">
            <Chip active={filter === "all"} onClick={() => setFilter("all")}>
              All games
            </Chip>
            {esportsGames.map((g) => (
              <Chip key={g} active={filter === g} onClick={() => setFilter(g)} colorClass={gameColors[g]}>
                {g}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-[1400px] px-4 py-12 md:px-8 md:py-16">
        <SectionEyebrow icon={<Radio className="h-3.5 w-3.5" />} label="On Now · Live" />
        <div className="mt-6">
          {live.length === 0 ? (
            <EmptyRow>No live matches in this filter right now.</EmptyRow>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {live.map((m, i) => (
                <MatchCard key={m.id} match={m} linkFieldReference={i === 0} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-border/60 bg-surface/30">
        <div className="mx-auto max-w-[1400px] px-4 py-14 md:px-8">
          <SectionEyebrow icon={<CalendarClock className="h-3.5 w-3.5" />} label="Coming Up" />
          <div className="mt-6">
            {upcoming.length === 0 ? (
              <EmptyRow>Nothing scheduled yet.</EmptyRow>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {upcoming.map((m, i) => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    linkFieldReference={live.length === 0 && i === 0}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-14 md:px-8">
        <SectionEyebrow icon={<Sparkles className="h-3.5 w-3.5" />} label="Latest Results" />
        <div className="mt-6">
          {finished.length === 0 ? (
            <EmptyRow>No recent results.</EmptyRow>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {finished.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-border/60 bg-surface/30">
        <div className="mx-auto max-w-[1400px] space-y-14 px-4 py-16 md:px-8">
          {standingsGames.map((game) => (
            <div key={game}>
              <SectionEyebrow
                icon={<Trophy className="h-3.5 w-3.5" />}
                label={`${game} · Season Table`}
              />
              <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
                <StandingsTable game={game} />
                <PlayersBoard game={game} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionEyebrow({ icon, label }: { icon?: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 font-mono-accent text-[11px] uppercase tracking-[0.32em] text-primary">
        <span className="h-px w-8 bg-primary" />
        {icon}
        Section
      </div>
      <h2 className="font-display text-2xl md:text-3xl font-bold leading-none tracking-tight">
        {label}
      </h2>
      <span className="h-[2px] w-16 bg-gradient-to-r from-primary via-accent to-transparent" />
    </div>
  );
}

function Chip({
  children,
  active,
  onClick,
  colorClass,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  colorClass?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all",
        active
          ? colorClass
            ? `${colorClass} shadow-glow`
            : "border-primary/60 bg-primary/15 text-primary shadow-glow"
          : colorClass
            ? "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function EmptyRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-28 items-center justify-center rounded-2xl border border-dashed border-border bg-surface/40 text-sm text-muted-foreground">
      {children}
    </div>
  );
}

function StandingsTable({ game }: { game: EsportsGame }) {
  const loaderData = Route.useLoaderData();
  const teams = loaderData.teams.filter((t) => t.game === game);
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-background/40 backdrop-blur">
      <table className="w-full text-sm">
        <thead className="bg-surface/60 text-[10px] font-mono-accent uppercase tracking-wider text-muted-foreground">
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
            <tr key={t.id} className="border-t border-border/60 hover:bg-surface/40">
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
  const loaderData = Route.useLoaderData();
  const players = loaderData.players.filter((p) => p.game === game);
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-background/40 backdrop-blur">
      <div className="border-b border-border/60 bg-surface/60 px-4 py-2.5 text-[10px] font-mono-accent uppercase tracking-wider text-muted-foreground">
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
                <span className="ml-2 text-xs font-normal text-muted-foreground">{p.realName}</span>
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
