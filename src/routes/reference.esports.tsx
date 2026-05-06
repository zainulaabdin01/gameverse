import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Radio, Shield, Trophy, Users } from "lucide-react";
import { MatchCard } from "@/components/MatchCard";
import { SectionHeader } from "@/components/SectionHeader";
import { getTeam } from "@/data/esports";
import type { Match, Player, Team } from "@/data/esports";
import { useMounted } from "@/hooks/use-mounted";

export const Route = createFileRoute("/reference/esports")({
  head: () => ({
    meta: [
      { title: "Esports field reference — Gameverse" },
      {
        name: "description",
        content:
          "Match scoreboard data model, MatchCard behaviors for live/upcoming/final, and backend mapping guidance.",
      },
    ],
  }),
  component: EsportsReferencePage,
});

const featuredMatch: Match = {
  id: "reference-live-sample",
  game: "Valorant",
  tournament: "Valor Arena Champions · Upper Final",
  status: "live",
  startsAt: new Date(Date.now() - 24 * 60_000).toISOString(),
  teamAId: "sentinel",
  teamBId: "iron-maple",
  scoreA: 2,
  scoreB: 1,
  format: "BO5",
  currentMap: "Map 4 — Haven (8:6)",
  viewers: 512_000,
};

const relatedMatches: Match[] = [
  {
    id: "reference-upcoming-sample",
    game: "CS2",
    tournament: "CS2 Paris Major · Semifinal",
    status: "upcoming",
    startsAt: new Date(Date.now() + 90 * 60_000).toISOString(),
    teamAId: "vexar",
    teamBId: "north-star",
    scoreA: 0,
    scoreB: 0,
    format: "BO3",
  },
  {
    id: "reference-final-sample",
    game: "League of Legends",
    tournament: "LEC Spring Playoffs · Grand Final",
    status: "finished",
    startsAt: new Date(Date.now() - 48 * 3600_000).toISOString(),
    teamAId: "atlas",
    teamBId: "kingdom-9",
    scoreA: 1,
    scoreB: 3,
    format: "BO5",
  },
  {
    id: "reference-upcoming-sample-2",
    game: "Dota 2",
    tournament: "ESL One Finals · Winner Bracket",
    status: "upcoming",
    startsAt: new Date(Date.now() + 220 * 60_000).toISOString(),
    teamAId: "spirit-hunters",
    teamBId: "dynasty-league",
    scoreA: 0,
    scoreB: 0,
    format: "BO3",
  },
];

const mapSummary = [
  { map: "Ascent", result: "13-8", winner: "Sentinel" },
  { map: "Bind", result: "10-13", winner: "Iron Maple" },
  { map: "Lotus", result: "13-11", winner: "Sentinel" },
];

const playerStats: Player[] = [
  {
    id: "reference-p1",
    handle: "Phantom",
    realName: "Eli Park",
    teamId: "sentinel",
    game: "Valorant",
    role: "Duelist",
    rating: 1.34,
    kda: 1.62,
    signature: "Jett",
  },
  {
    id: "reference-p2",
    handle: "Aegis",
    realName: "Noah Price",
    teamId: "sentinel",
    game: "Valorant",
    role: "Initiator",
    rating: 1.22,
    kda: 1.41,
    signature: "Sova",
  },
  {
    id: "reference-p3",
    handle: "Aria",
    realName: "Mia Voss",
    teamId: "iron-maple",
    game: "Valorant",
    role: "Controller",
    rating: 1.21,
    kda: 1.39,
    signature: "Omen",
  },
  {
    id: "reference-p4",
    handle: "Iris",
    realName: "Lena Park",
    teamId: "iron-maple",
    game: "Valorant",
    role: "Sentinel",
    rating: 1.12,
    kda: 1.18,
    signature: "Killjoy",
  },
];

const standingsSnapshot: Team[] = [
  { ...getTeam("sentinel"), wins: 14, losses: 3, points: 42, formStreak: ["W", "W", "W", "L", "W"] },
  { ...getTeam("iron-maple"), wins: 12, losses: 5, points: 36, formStreak: ["W", "L", "W", "W", "L"] },
  { ...getTeam("black-lotus"), wins: 11, losses: 6, points: 33, formStreak: ["L", "W", "W", "W", "W"] },
  { ...getTeam("pacific-tide"), wins: 9, losses: 8, points: 27, formStreak: ["W", "L", "L", "W", "L"] },
];

const teamA = getTeam(featuredMatch.teamAId);
const teamB = getTeam(featuredMatch.teamBId);

const seriesSnapshot = {
  objectiveControl: "Sentinel 56% · Iron Maple 44%",
  firstKills: "Sentinel 18 · Iron Maple 14",
  avgRoundTime: "1m 29s",
};

const tournamentSnapshot = {
  stage: "Upper Final",
  prizePool: "$2,000,000",
  location: "Berlin Arena",
  patch: "v9.04",
};

const sampleUpcomingMatch: Match = {
  id: "reference-upcoming-sample",
  game: "CS2",
  tournament: "CS2 Paris Major · Reference",
  status: "upcoming",
  startsAt: new Date(Date.now() + 90 * 60_000).toISOString(),
  teamAId: "vexar",
  teamBId: "north-star",
  scoreA: 0,
  scoreB: 0,
  format: "BO3",
};

function EsportsReferencePage() {
  const mounted = useMounted();

  return (
    <div className="relative">
      <header className="relative overflow-hidden border-b border-border/60 bg-surface/20">
        <div className="bg-aurora absolute inset-0 opacity-40" />
        <div className="bg-grid absolute inset-0 opacity-[0.12]" />
        <div className="absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-primary/15 blur-[110px]" />
        <div className="absolute -bottom-32 -right-32 h-[420px] w-[420px] rounded-full bg-accent/15 blur-[110px]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-background" />
        <div className="relative mx-auto max-w-[1400px] px-4 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 py-2 font-mono-accent text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
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
            <span className="flex items-center gap-2">
              <BookOpen className="h-3 w-3 text-primary" />
              Reference · Match detail
            </span>
          </div>

          <div className="flex flex-col items-center py-6 text-center md:py-8">
            <div className="font-mono-accent text-[10px] uppercase tracking-[0.4em] text-primary">
              Implementation guide
            </div>
            <h1
              className="mt-2 font-display font-bold leading-none tracking-tight"
              style={{ fontSize: "clamp(2rem, 5.5vw, 3.25rem)" }}
            >
              Esports<span className="italic font-medium text-muted-foreground"> detail </span>
              <span className="gradient-text">showcase</span>
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
              A full tournament-match detail composition with scoreboard hero, series intelligence,
              player stats, and linked match rails.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs">
              <Link
                to="/esports"
                className="rounded-full border border-border/60 bg-surface/60 px-4 py-2 font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              >
                ← Back to Esports hub
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] space-y-16 px-4 py-12 md:px-8 md:py-16">
        <section className="overflow-hidden rounded-3xl border border-border/60 bg-surface/35 p-6 md:p-8">
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="space-y-5 lg:col-span-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[oklch(var(--live)/0.15)] px-3 py-1 font-mono-accent text-[10px] uppercase tracking-wider text-[oklch(var(--live))]">
                  LIVE NOW
                </span>
                <span className="font-mono-accent text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  {featuredMatch.tournament}
                </span>
              </div>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-2xl border border-border/60 bg-background/50 p-5">
                <TeamBadge team={teamA} />
                <div className="text-center">
                  <div className="font-display text-4xl font-bold tabular-nums md:text-5xl">
                    {featuredMatch.scoreA} : {featuredMatch.scoreB}
                  </div>
                  <p className="mt-1 font-mono-accent text-[10px] uppercase tracking-[0.26em] text-muted-foreground">
                    {featuredMatch.format} · {featuredMatch.currentMap}
                  </p>
                </div>
                <TeamBadge team={teamB} align="right" />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <InfoPill title="Objective control" value={seriesSnapshot.objectiveControl} />
                <InfoPill title="First kills" value={seriesSnapshot.firstKills} />
                <InfoPill title="Avg round time" value={seriesSnapshot.avgRoundTime} />
              </div>
            </div>

            <aside className="space-y-3 rounded-2xl border border-border/60 bg-background/45 p-5 lg:col-span-4">
              <h3 className="font-display text-xl font-semibold">Tournament snapshot</h3>
              <p className="text-sm text-muted-foreground">
                {mounted ? new Date(featuredMatch.startsAt).toLocaleString() : ""} · {featuredMatch.viewers?.toLocaleString()} live viewers
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><span className="text-foreground">Stage</span> — {tournamentSnapshot.stage}</li>
                <li><span className="text-foreground">Prize pool</span> — {tournamentSnapshot.prizePool}</li>
                <li><span className="text-foreground">Venue</span> — {tournamentSnapshot.location}</li>
                <li><span className="text-foreground">Patch</span> — {tournamentSnapshot.patch}</li>
              </ul>
            </aside>
          </div>
        </section>

        <section>
          <SectionHeader
            index="01"
            eyebrow="Series detail modules"
            title="Map summary and player stat table"
            description="A convincing match detail page layers per-map outcomes with compact player telemetry."
          />
          <div className="grid gap-6 xl:grid-cols-12">
            <div className="space-y-6 xl:col-span-7">
              <div className="rounded-2xl border border-border/60 bg-background/45 p-5">
                <SectionEyebrow icon={<Radio className="h-3.5 w-3.5" />} label="Map / series summary" />
                <div className="mt-4 space-y-2">
                  {mapSummary.map((item) => (
                    <div
                      key={item.map}
                      className="flex items-center justify-between rounded-lg border border-border/60 bg-surface/40 px-4 py-3 text-sm"
                    >
                      <span className="font-medium">{item.map}</span>
                      <span className="text-muted-foreground">{item.result} · {item.winner}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-border/60 bg-background/45">
                <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
                  <SectionEyebrow icon={<Users className="h-3.5 w-3.5" />} label="Player stats" />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[540px] text-sm">
                    <thead className="bg-surface/50 text-left font-mono-accent text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Player</th>
                        <th className="px-4 py-3">Team</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Rating</th>
                        <th className="px-4 py-3">KDA</th>
                        <th className="px-4 py-3">Signature</th>
                      </tr>
                    </thead>
                    <tbody>
                      {playerStats.map((player) => (
                        <tr key={player.id} className="border-t border-border/50">
                          <td className="px-4 py-3 font-medium">{player.handle}</td>
                          <td className="px-4 py-3 text-muted-foreground">{getTeam(player.teamId).tag}</td>
                          <td className="px-4 py-3 text-muted-foreground">{player.role}</td>
                          <td className="px-4 py-3 text-muted-foreground">{player.rating.toFixed(2)}</td>
                          <td className="px-4 py-3 text-muted-foreground">{player.kda.toFixed(2)}</td>
                          <td className="px-4 py-3 text-muted-foreground">{player.signature}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <aside className="space-y-4 xl:col-span-5">
              <div className="rounded-2xl border border-border/60 bg-surface/40 p-5">
                <SectionEyebrow icon={<Shield className="h-3.5 w-3.5" />} label="Standings snapshot" />
                <div className="mt-4 space-y-2">
                  {standingsSnapshot.map((team) => (
                    <div key={team.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-2 rounded-lg border border-border/60 bg-background/45 px-3 py-2 text-sm">
                      <span className="font-medium">{team.name}</span>
                      <span className="text-muted-foreground">{team.wins}-{team.losses}</span>
                      <span className="font-mono-accent text-xs text-primary">{team.points} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section>
          <SectionHeader
            index="02"
            eyebrow="Related match rails"
            title="Upcoming and completed match cards"
            description="Use existing MatchCard variants for adjacent context and quick navigation."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <MatchCard match={sampleUpcomingMatch} asStatic />
            {relatedMatches.map((match) => (
              <MatchCard key={match.id} match={match} asStatic />
            ))}
          </div>
        </section>

        <section className="border-t border-border/60 pt-16">
          <SectionHeader
            index="03"
            eyebrow="Backend contract"
            title="Match detail + listing contract"
            description="Keep foreign keys and telemetry aligned so cards, scoreboard, tables, and standings stay coherent."
          />
          <div className="grid gap-6 md:grid-cols-2">
            <ul className="space-y-3 rounded-2xl border border-border/60 bg-background/40 p-6 text-sm text-muted-foreground">
              <li className="font-mono-accent text-[10px] uppercase tracking-wider text-primary">
                Core match fields
              </li>
              <li>
                <span className="text-foreground">id</span> — opaque match id for{" "}
                <code className="font-mono text-xs">/esports/$matchId</code>.
              </li>
              <li>
                <span className="text-foreground">game</span> — enum (
                <span className="text-foreground">EsportsGame</span>) for filters + label.
              </li>
              <li>
                <span className="text-foreground">tournament</span> — human-readable series name in
                the eyebrow row.
              </li>
              <li>
                <span className="text-foreground">status</span> —{" "}
                <span className="text-foreground">live</span> |{" "}
                <span className="text-foreground">upcoming</span> |{" "}
                <span className="text-foreground">finished</span>.
              </li>
              <li>
                <span className="text-foreground">startsAt</span> — ISO; drives countdown +
                ordering.
              </li>
              <li>
                <span className="text-foreground">teamAId · teamBId</span> — must resolve via teams
                lookup for crests.
              </li>
              <li>
                <span className="text-foreground">scoreA · scoreB</span> — maps won or game points
                depending on format.
              </li>
              <li>
                <span className="text-foreground">format</span> — short label like{" "}
                <span className="italic">BO3</span>.
              </li>
              <li>
                <span className="text-foreground">currentMap</span> — optional live ticker string.
              </li>
              <li>
                <span className="text-foreground">viewers</span> — optional integer for live
                concurrency.
              </li>
            </ul>
            <div className="space-y-4 rounded-2xl border border-dashed border-border/80 bg-surface/30 p-6 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Team sheet alignment</p>
              <p>
                <span className="text-foreground">Team</span> rows power standings tables:{" "}
                <span className="text-foreground">tag</span> for monograms,{" "}
                <span className="text-foreground">logoColor</span> for CSS fills, and{" "}
                <span className="text-foreground">formStreak</span> for the last five results.
              </p>
              <p>
                <span className="text-foreground">Player</span> stats reuse{" "}
                <span className="text-foreground">teamId</span> +{" "}
                <span className="text-foreground">game</span> to stay consistent with match
                metadata.
              </p>
            </div>
          </div>
        </section>
      </main>
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
      <h2 className="font-display text-xl md:text-2xl font-bold leading-none tracking-tight">
        {label}
      </h2>
      <span className="h-[2px] w-16 bg-gradient-to-r from-primary via-accent to-transparent" />
    </div>
  );
}

function TeamBadge({
  team,
  align = "left",
}: {
  team: ReturnType<typeof getTeam>;
  align?: "left" | "right";
}) {
  return (
    <div className={`flex items-center gap-3 ${align === "right" ? "flex-row-reverse text-right" : ""}`}>
      <div
        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl font-display text-sm font-bold text-background"
        style={{ background: team.logoColor }}
      >
        {team.tag}
      </div>
      <div className="min-w-0">
        <p className="truncate font-display text-lg font-semibold leading-none">{team.name}</p>
        <p className="mt-1 font-mono-accent text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          {team.region}
        </p>
      </div>
    </div>
  );
}

function InfoPill({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/45 px-4 py-3">
      <p className="font-mono-accent text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{title}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
