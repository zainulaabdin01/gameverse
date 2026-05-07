import { createFileRoute } from "@tanstack/react-router";
import { Radio, Shield, Trophy, Users } from "lucide-react";
import { MatchCard } from "@/components/MatchCard";
import {
  CodeBlock,
  FieldRow,
  FieldTable,
  RefSectionHeading,
  ReferenceShell,
} from "@/components/reference/ReferenceShell";
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
  { id: "p1", handle: "Phantom", realName: "Eli Park", teamId: "sentinel", game: "Valorant", role: "Duelist", rating: 1.34, kda: 1.62, signature: "Jett" },
  { id: "p2", handle: "Aegis", realName: "Noah Price", teamId: "sentinel", game: "Valorant", role: "Initiator", rating: 1.22, kda: 1.41, signature: "Sova" },
  { id: "p3", handle: "Aria", realName: "Mia Voss", teamId: "iron-maple", game: "Valorant", role: "Controller", rating: 1.21, kda: 1.39, signature: "Omen" },
  { id: "p4", handle: "Iris", realName: "Lena Park", teamId: "iron-maple", game: "Valorant", role: "Sentinel", rating: 1.12, kda: 1.18, signature: "Killjoy" },
];

const standingsSnapshot: Team[] = [
  { ...getTeam("sentinel"), wins: 14, losses: 3, points: 42, formStreak: ["W", "W", "W", "L", "W"] },
  { ...getTeam("iron-maple"), wins: 12, losses: 5, points: 36, formStreak: ["W", "L", "W", "W", "L"] },
  { ...getTeam("black-lotus"), wins: 11, losses: 6, points: 33, formStreak: ["L", "W", "W", "W", "W"] },
  { ...getTeam("pacific-tide"), wins: 9, losses: 8, points: 27, formStreak: ["W", "L", "L", "W", "L"] },
];

const teamA = getTeam(featuredMatch.teamAId);
const teamB = getTeam(featuredMatch.teamBId);

const tournamentSnapshot = {
  stage: "Upper Final",
  prizePool: "$2,000,000",
  location: "Berlin Arena",
  patch: "v9.04",
};

const sampleType = `export interface Match {
  id: string;
  game: EsportsGame;        // Valorant | CS2 | LoL | Dota 2
  tournament: string;
  status: "live" | "upcoming" | "finished";
  startsAt: string;         // ISO 8601
  teamAId: string;          // FK -> Team.id
  teamBId: string;
  scoreA: number;
  scoreB: number;
  format: string;           // "BO3", "BO5"
  currentMap?: string;      // live ticker
  viewers?: number;         // live concurrency
}`;

const sampleJson = `{
  "id": "vct-2026-uf-sen-irm",
  "game": "Valorant",
  "tournament": "Valor Arena Champions · Upper Final",
  "status": "live",
  "startsAt": "2026-05-07T18:30:00.000Z",
  "teamAId": "sentinel",
  "teamBId": "iron-maple",
  "scoreA": 2,
  "scoreB": 1,
  "format": "BO5",
  "currentMap": "Map 4 — Haven (8:6)",
  "viewers": 512000
}`;

const sections = [
  { id: "scoreboard", index: "01", label: "Live scoreboard hero" },
  { id: "series", index: "02", label: "Series & player stats" },
  { id: "standings", index: "03", label: "Standings snapshot" },
  { id: "rails", index: "04", label: "Match card variants" },
  { id: "schema", index: "05", label: "Schema & sample payload" },
  { id: "mapping", index: "06", label: "Backend mapping" },
];

function EsportsReferencePage() {
  const mounted = useMounted();

  return (
    <ReferenceShell
      domain="Esports"
      domainColor="#fb7185"
      backTo="/esports"
      backLabel="← Back to Esports hub"
      title={
        <>
          The <span className="gradient-text">Esports</span>
          <br />
          match blueprint
        </>
      }
      description="Live scoreboards, post-match recaps, standings tables, and player telemetry — every esports surface derives from the Match, Team, and Player models documented here."
      stats={[
        { label: "Models", value: "3" },
        { label: "Statuses", value: "live · upcoming · final" },
        { label: "Card variants", value: "3" },
        { label: "Routes", value: "/esports/$matchId" },
      ]}
      sections={sections}
    >
      <section className="space-y-6">
        <RefSectionHeading
          id="scoreboard"
          index="01"
          eyebrow="Scoreboard"
          title="Live match hero"
          description="The detail page leads with the live scoreboard, format/map context, and tournament metadata aside."
        />
        <div className="overflow-hidden rounded-3xl border border-border/60 bg-surface/35 p-6 md:p-8">
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="space-y-5 lg:col-span-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1.5 rounded-full bg-[oklch(var(--live)/0.15)] px-3 py-1 font-mono-accent text-[10px] uppercase tracking-wider text-[oklch(var(--live))]">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[oklch(var(--live))] opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[oklch(var(--live))]" />
                  </span>
                  LIVE
                </span>
                <span className="font-mono-accent text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  {featuredMatch.tournament}
                </span>
                <span className="ml-auto font-mono-accent text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  {featuredMatch.viewers?.toLocaleString()} watching
                </span>
              </div>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-2xl border border-border/60 bg-background/50 p-5">
                <TeamBadge team={teamA} />
                <div className="text-center">
                  <div className="font-display text-4xl font-bold tabular-nums md:text-5xl">
                    <span className="text-primary">{featuredMatch.scoreA}</span>
                    <span className="px-2 text-muted-foreground/50">:</span>
                    <span className="text-accent">{featuredMatch.scoreB}</span>
                  </div>
                  <p className="mt-1 font-mono-accent text-[10px] uppercase tracking-[0.26em] text-muted-foreground">
                    {featuredMatch.format} · {featuredMatch.currentMap}
                  </p>
                </div>
                <TeamBadge team={teamB} align="right" />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <InfoPill title="Objective control" value="SEN 56% · IRM 44%" />
                <InfoPill title="First kills" value="SEN 18 · IRM 14" />
                <InfoPill title="Avg round time" value="1m 29s" />
              </div>
            </div>

            <aside className="space-y-3 rounded-2xl border border-border/60 bg-background/45 p-5 lg:col-span-4">
              <div className="flex items-center gap-2 font-mono-accent text-[10px] uppercase tracking-[0.28em] text-primary">
                <Trophy className="h-3.5 w-3.5" /> Tournament
              </div>
              <p className="font-display text-xl font-semibold leading-tight">{featuredMatch.tournament}</p>
              <p className="text-xs text-muted-foreground">
                {mounted ? new Date(featuredMatch.startsAt).toLocaleString() : ""}
              </p>
              <ul className="space-y-2 border-t border-border/60 pt-3 text-sm text-muted-foreground">
                <li><span className="text-foreground">Stage</span> — {tournamentSnapshot.stage}</li>
                <li><span className="text-foreground">Prize pool</span> — {tournamentSnapshot.prizePool}</li>
                <li><span className="text-foreground">Venue</span> — {tournamentSnapshot.location}</li>
                <li><span className="text-foreground">Patch</span> — {tournamentSnapshot.patch}</li>
              </ul>
            </aside>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <RefSectionHeading
          id="series"
          index="02"
          eyebrow="Series detail"
          title="Map summary & player table"
          description="Per-map outcomes plus compact player telemetry; both share team FKs with the scoreboard."
        />
        <div className="grid gap-6 xl:grid-cols-12">
          <div className="space-y-6 xl:col-span-7">
            <div className="rounded-2xl border border-border/60 bg-background/45 p-5">
              <div className="flex items-center gap-2 font-mono-accent text-[10px] uppercase tracking-[0.28em] text-primary">
                <Radio className="h-3.5 w-3.5" /> Map / series summary
              </div>
              <div className="mt-4 space-y-2">
                {mapSummary.map((item, i) => (
                  <div
                    key={item.map}
                    className="flex items-center justify-between rounded-lg border border-border/60 bg-surface/40 px-4 py-3 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono-accent text-[10px] text-muted-foreground">M{i + 1}</span>
                      <span className="font-medium">{item.map}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono tabular-nums text-foreground/90">{item.result}</span>
                      <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                        {item.winner}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border/60 bg-background/45">
              <div className="flex items-center gap-2 border-b border-border/60 bg-surface/40 px-5 py-3 font-mono-accent text-[10px] uppercase tracking-[0.28em] text-primary">
                <Users className="h-3.5 w-3.5" /> Player stats
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[540px] text-sm">
                  <thead className="text-left font-mono-accent text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Player</th>
                      <th className="px-4 py-3">Team</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3 text-right">Rating</th>
                      <th className="px-4 py-3 text-right">KDA</th>
                      <th className="px-4 py-3">Signature</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playerStats.map((player) => (
                      <tr key={player.id} className="border-t border-border/50 transition-colors hover:bg-surface/30">
                        <td className="px-4 py-3 font-medium">{player.handle}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-md px-1.5 py-0.5 text-xs font-bold text-background" style={{ background: getTeam(player.teamId).logoColor }}>
                            {getTeam(player.teamId).tag}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{player.role}</td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums text-foreground/90">{player.rating.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground">{player.kda.toFixed(2)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{player.signature}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <aside id="standings" className="space-y-4 scroll-mt-24 xl:col-span-5">
            <div className="rounded-2xl border border-border/60 bg-surface/40 p-5">
              <div className="flex items-center gap-2 font-mono-accent text-[10px] uppercase tracking-[0.28em] text-primary">
                <Shield className="h-3.5 w-3.5" /> Standings snapshot
              </div>
              <div className="mt-4 space-y-2">
                {standingsSnapshot.map((team, i) => (
                  <div key={team.id} className="grid grid-cols-[24px_1fr_auto_auto] items-center gap-3 rounded-lg border border-border/60 bg-background/45 px-3 py-2 text-sm">
                    <span className="font-mono-accent text-[11px] text-muted-foreground">#{i + 1}</span>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="h-6 w-6 flex-shrink-0 rounded-md text-center text-[10px] font-bold leading-6 text-background" style={{ background: team.logoColor }}>
                        {team.tag}
                      </span>
                      <span className="truncate font-medium">{team.name}</span>
                    </div>
                    <span className="font-mono tabular-nums text-muted-foreground">{team.wins}-{team.losses}</span>
                    <span className="font-mono-accent text-xs text-primary">{team.points}p</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-1 border-t border-border/60 pt-3">
                <span className="font-mono-accent text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Recent form (SEN)</span>
                <div className="ml-auto flex gap-1">
                  {standingsSnapshot[0].formStreak.map((r, i) => (
                    <span
                      key={i}
                      className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${
                        r === "W" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                      }`}
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="space-y-6">
        <RefSectionHeading
          id="rails"
          index="04"
          eyebrow="Discovery"
          title="MatchCard variants"
          description="The same MatchCard renders the three states with subtle status accents."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {relatedMatches.map((match) => (
            <MatchCard key={match.id} match={match} asStatic />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <RefSectionHeading
          id="schema"
          index="05"
          eyebrow="Schema"
          title="Match model & sample payload"
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <CodeBlock language="typescript" filename="src/data/esports.ts" code={sampleType} />
          <CodeBlock language="json" filename="GET /api/matches/:id" code={sampleJson} />
        </div>

        <FieldTable title="Match fields">
          <FieldRow name="id" type="string" required desc="Opaque match id; powers /esports/$matchId." />
          <FieldRow name="game" type="EsportsGame" required desc="Enum: Valorant | CS2 | League of Legends | Dota 2." />
          <FieldRow name="tournament" type="string" required desc="Series + stage label, e.g. 'Champions · Upper Final'." />
          <FieldRow name="status" type="'live' | 'upcoming' | 'finished'" required desc="Drives badge color and card variant." />
          <FieldRow name="startsAt" type="string (ISO)" required desc="ISO 8601; powers countdown + ordering." />
          <FieldRow name="teamAId" type="string" required desc="FK → Team.id (left side)." />
          <FieldRow name="teamBId" type="string" required desc="FK → Team.id (right side)." />
          <FieldRow name="scoreA" type="number" required desc="Maps won or game points." />
          <FieldRow name="scoreB" type="number" required desc="Same as scoreA." />
          <FieldRow name="format" type="string" required desc="Short label, 'BO3' / 'BO5'." />
          <FieldRow name="currentMap" type="string?" desc="Live ticker string; live status only." />
          <FieldRow name="viewers" type="number?" desc="Live concurrency count." />
        </FieldTable>
      </section>

      <section className="space-y-6">
        <RefSectionHeading
          id="mapping"
          index="06"
          eyebrow="Backend"
          title="Cross-model alignment"
          description="Match references Team and Player by id — keep these consistent across endpoints."
        />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-background/40 p-6 text-sm text-muted-foreground">
            <p className="font-display text-base font-semibold text-foreground">Team contract</p>
            <ul className="mt-3 space-y-2">
              <li><code className="text-foreground">tag</code> — 2–3 char monogram, drives crests.</li>
              <li><code className="text-foreground">logoColor</code> — hex for crest fill.</li>
              <li><code className="text-foreground">formStreak</code> — last 5 results, ('W'|'L')[].</li>
              <li><code className="text-foreground">wins · losses · points</code> — standings columns.</li>
              <li><code className="text-foreground">region · game</code> — partition for filters.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-dashed border-border/80 bg-surface/30 p-6 text-sm text-muted-foreground">
            <p className="font-display text-base font-semibold text-foreground">Player contract</p>
            <ul className="mt-3 space-y-2">
              <li><code className="text-foreground">teamId</code> — FK → Team.id; required.</li>
              <li><code className="text-foreground">game</code> — must match team.game.</li>
              <li><code className="text-foreground">role</code> — game-specific string.</li>
              <li><code className="text-foreground">rating · kda</code> — numeric, decimal places preserved.</li>
              <li><code className="text-foreground">signature</code> — agent / champion / hero name.</li>
            </ul>
            <div className="mt-5 rounded-xl border border-primary/30 bg-primary/10 p-4 text-foreground/90">
              <p className="font-mono-accent text-[10px] uppercase tracking-[0.22em] text-primary">Tip</p>
              <p className="mt-1.5">
                When <code>status === "live"</code>, also return <code>currentMap</code> and{" "}
                <code>viewers</code> — the UI hides the badge if either is missing.
              </p>
            </div>
          </div>
        </div>
      </section>
    </ReferenceShell>
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
        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl font-display text-sm font-bold text-background shadow-lg"
        style={{ background: team.logoColor, boxShadow: `0 6px 24px -8px ${team.logoColor}` }}
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
