import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Command as CommandPrimitive } from "cmdk";
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Gamepad2,
  Newspaper,
  Trophy,
  Library,
  Search,
  Command,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  Sparkles,
} from "lucide-react";
import { games } from "@/data/games";
import { articles } from "@/data/news";
import { matches, getTeam } from "@/data/esports";
import { cn } from "@/lib/utils";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const q = query.trim().toLowerCase();

  const gameResults = useMemo(
    () =>
      games
        .filter((g) =>
          !q
            ? true
            : g.title.toLowerCase().includes(q) ||
              g.developer.toLowerCase().includes(q) ||
              g.genres.some((x) => x.toLowerCase().includes(q)),
        )
        .slice(0, 6),
    [q],
  );

  const newsResults = useMemo(
    () =>
      articles
        .filter((a) =>
          !q
            ? true
            : a.title.toLowerCase().includes(q) ||
              a.excerpt.toLowerCase().includes(q) ||
              a.category.toLowerCase().includes(q) ||
              a.source.toLowerCase().includes(q),
        )
        .slice(0, 6),
    [q],
  );

  const matchResults = useMemo(
    () =>
      matches
        .filter((m) => {
          const a = getTeam(m.teamAId);
          const b = getTeam(m.teamBId);
          if (!q) return true;
          return (
            m.tournament.toLowerCase().includes(q) ||
            m.game.toLowerCase().includes(q) ||
            a.name.toLowerCase().includes(q) ||
            b.name.toLowerCase().includes(q)
          );
        })
        .slice(0, 5),
    [q],
  );

  const go = (path: string) => {
    onOpenChange(false);
    navigate({ to: path });
  };

  const pages = [
    { label: "Home", to: "/", icon: Gamepad2, hint: "Landing & overview" },
    { label: "News", to: "/news", icon: Newspaper, hint: "Latest stories" },
    { label: "Esports", to: "/esports", icon: Trophy, hint: "Live & upcoming" },
    { label: "Games", to: "/games", icon: Library, hint: "Full directory" },
  ];

  const totalResults = gameResults.length + newsResults.length + matchResults.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-2xl gap-0 overflow-hidden border-border/60 bg-transparent p-0 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]",
        )}
      >
        {/* Atmospheric backdrop */}
        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-lg bg-surface/95 backdrop-blur-2xl" />
          <div className="absolute inset-0 -z-10 rounded-lg bg-aurora opacity-40" />
          <div className="absolute inset-0 -z-10 rounded-lg bg-grid opacity-[0.08]" />
          <div
            className="pointer-events-none absolute -inset-px -z-10 rounded-lg"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in oklab, var(--primary) 35%, transparent), transparent 40%, color-mix(in oklab, var(--accent) 30%, transparent))",
              WebkitMask:
                "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              padding: 1,
            }}
          />

          <CommandPrimitive
            className="flex h-full w-full flex-col overflow-hidden rounded-lg text-popover-foreground"
            shouldFilter={false}
          >
            {/* Custom header */}
            <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-md gradient-primary shadow-glow">
                <Search className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <CommandPrimitive.Input
                value={query}
                onValueChange={setQuery}
                placeholder="Search games, news, matches…"
                className="flex h-10 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
              />
              <kbd className="hidden items-center gap-0.5 rounded border border-border/60 bg-surface-3 px-1.5 py-0.5 font-mono-accent text-[10px] text-foreground/80 sm:flex">
                ESC
              </kbd>
            </div>

            {/* Tag row */}
            <div className="flex items-center gap-2 border-b border-border/60 bg-surface/30 px-4 py-2 font-mono-accent text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" />
              <span>The verse · {totalResults} matches</span>
              <span className="ml-auto hidden sm:inline">⌘K to toggle</span>
            </div>

            <CommandList className="max-h-[420px] px-2 py-2">
              <CommandEmpty className="flex flex-col items-center gap-2 py-10 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-surface/40">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">No results found</p>
                <p className="text-xs text-muted-foreground">
                  Try another keyword or browse the verse below.
                </p>
              </CommandEmpty>

              <CommandGroup
                heading="Jump to"
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono-accent [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.25em] [&_[cmdk-group-heading]]:text-muted-foreground"
              >
                {pages.map((p) => {
                  const Icon = p.icon;
                  return (
                    <CommandItem
                      key={p.to}
                      value={`page ${p.label}`}
                      onSelect={() => go(p.to)}
                      className="group my-0.5 cursor-pointer rounded-md data-[selected=true]:bg-gradient-to-r data-[selected=true]:from-primary/15 data-[selected=true]:to-accent/10 data-[selected=true]:text-foreground"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border/60 bg-surface/60 text-muted-foreground group-data-[selected=true]:border-primary/50 group-data-[selected=true]:text-primary">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-medium">{p.label}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {p.hint}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>

              {gameResults.length > 0 && (
                <>
                  <CommandSeparator className="my-1" />
                  <CommandGroup
                    heading="Games"
                    className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono-accent [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.25em] [&_[cmdk-group-heading]]:text-muted-foreground"
                  >
                    {gameResults.map((g) => (
                      <CommandItem
                        key={g.slug}
                        value={`game ${g.title} ${g.developer}`}
                        onSelect={() => go(`/games/${g.slug}`)}
                        className="group my-0.5 cursor-pointer rounded-md data-[selected=true]:bg-gradient-to-r data-[selected=true]:from-primary/15 data-[selected=true]:to-accent/10"
                      >
                        <img
                          src={g.cover}
                          alt=""
                          className="h-8 w-8 flex-shrink-0 rounded-md object-cover ring-1 ring-border/60"
                        />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-sm font-medium">{g.title}</span>
                          <span className="truncate text-[11px] text-muted-foreground">
                            {g.developer} · {g.genres[0]}
                          </span>
                        </div>
                        <span className="font-mono-accent text-[10px] text-primary">
                          ★ {g.rating}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}

              {newsResults.length > 0 && (
                <>
                  <CommandSeparator className="my-1" />
                  <CommandGroup
                    heading="News"
                    className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono-accent [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.25em] [&_[cmdk-group-heading]]:text-muted-foreground"
                  >
                    {newsResults.map((a) => (
                      <CommandItem
                        key={a.slug}
                        value={`news ${a.title} ${a.category}`}
                        onSelect={() => go(`/news/${a.slug}`)}
                        className="group my-0.5 cursor-pointer rounded-md data-[selected=true]:bg-gradient-to-r data-[selected=true]:from-primary/15 data-[selected=true]:to-accent/10"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border/60 bg-surface/60 text-muted-foreground group-data-[selected=true]:border-accent/50 group-data-[selected=true]:text-accent">
                          <Newspaper className="h-3.5 w-3.5" />
                        </div>
                        <span className="flex-1 truncate text-sm">{a.title}</span>
                        <span className="font-mono-accent text-[10px] uppercase tracking-wider text-muted-foreground">
                          {a.source}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}

              {matchResults.length > 0 && (
                <>
                  <CommandSeparator className="my-1" />
                  <CommandGroup
                    heading="Matches"
                    className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono-accent [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.25em] [&_[cmdk-group-heading]]:text-muted-foreground"
                  >
                    {matchResults.map((m) => {
                      const a = getTeam(m.teamAId);
                      const b = getTeam(m.teamBId);
                      return (
                        <CommandItem
                          key={m.id}
                          value={`match ${a.name} ${b.name} ${m.tournament}`}
                          onSelect={() => go(`/esports/${m.id}`)}
                          className="group my-0.5 cursor-pointer rounded-md data-[selected=true]:bg-gradient-to-r data-[selected=true]:from-primary/15 data-[selected=true]:to-accent/10"
                        >
                          <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border/60 bg-surface/60 text-muted-foreground group-data-[selected=true]:border-primary/50 group-data-[selected=true]:text-primary">
                            <Trophy className="h-3.5 w-3.5" />
                          </div>
                          <span className="flex-1 truncate text-sm">
                            <span className="font-semibold">{a.name}</span>
                            <span className="mx-1.5 text-muted-foreground">vs</span>
                            <span className="font-semibold">{b.name}</span>
                          </span>
                          <span className="font-mono-accent text-[10px] uppercase tracking-wider text-muted-foreground">
                            {m.game}
                          </span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </>
              )}
            </CommandList>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border/60 bg-surface/40 px-4 py-2 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="flex h-5 w-5 items-center justify-center rounded border border-border/60 bg-surface-3 font-mono-accent">
                    <ArrowUp className="h-2.5 w-2.5" />
                  </kbd>
                  <kbd className="flex h-5 w-5 items-center justify-center rounded border border-border/60 bg-surface-3 font-mono-accent">
                    <ArrowDown className="h-2.5 w-2.5" />
                  </kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="flex h-5 items-center justify-center gap-0.5 rounded border border-border/60 bg-surface-3 px-1 font-mono-accent">
                    <CornerDownLeft className="h-2.5 w-2.5" />
                  </kbd>
                  Open
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-mono-accent uppercase tracking-widest">Gameverse</span>
                <span className="opacity-50">·</span>
                <kbd className="flex items-center gap-0.5 rounded border border-border/60 bg-surface-3 px-1 py-0.5 font-mono-accent">
                  <Command className="h-2.5 w-2.5" />K
                </kbd>
              </div>
            </div>
          </CommandPrimitive>
        </div>
      </DialogContent>
    </Dialog>
  );
}
