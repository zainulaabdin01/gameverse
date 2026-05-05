import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Gamepad2, Newspaper, Trophy, Library } from "lucide-react";
import { games } from "@/data/games";
import { articles } from "@/data/news";
import { matches, getTeam } from "@/data/esports";

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
    { label: "Home", to: "/", icon: Gamepad2 },
    { label: "News", to: "/news", icon: Newspaper },
    { label: "Esports", to: "/esports", icon: Trophy },
    { label: "Games", to: "/games", icon: Library },
  ];

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search games, news, matches…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Pages">
          {pages.map((p) => {
            const Icon = p.icon;
            return (
              <CommandItem
                key={p.to}
                value={`page ${p.label}`}
                onSelect={() => go(p.to)}
              >
                <Icon /> {p.label}
              </CommandItem>
            );
          })}
        </CommandGroup>

        {gameResults.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Games">
              {gameResults.map((g) => (
                <CommandItem
                  key={g.slug}
                  value={`game ${g.title} ${g.developer}`}
                  onSelect={() => go(`/games/${g.slug}`)}
                >
                  <Library />
                  <span className="flex-1">{g.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {g.developer}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {newsResults.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="News">
              {newsResults.map((a) => (
                <CommandItem
                  key={a.slug}
                  value={`news ${a.title} ${a.category}`}
                  onSelect={() => go(`/news/${a.slug}`)}
                >
                  <Newspaper />
                  <span className="flex-1 truncate">{a.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {a.source}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {matchResults.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Matches">
              {matchResults.map((m) => {
                const a = getTeam(m.teamAId);
                const b = getTeam(m.teamBId);
                return (
                  <CommandItem
                    key={m.id}
                    value={`match ${a.name} ${b.name} ${m.tournament}`}
                    onSelect={() => go(`/esports/${m.id}`)}
                  >
                    <Trophy />
                    <span className="flex-1 truncate">
                      {a.name} vs {b.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {m.tournament}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
