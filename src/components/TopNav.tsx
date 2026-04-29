import { Link, useRouterState } from "@tanstack/react-router";
import { Gamepad2, Newspaper, Trophy, Library, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Home", icon: Gamepad2 },
  { to: "/news", label: "News Hub", icon: Newspaper },
  { to: "/esports", label: "Esports", icon: Trophy },
  { to: "/games", label: "Games", icon: Library },
] as const;

export function TopNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-4 md:px-8">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg gradient-primary shadow-glow">
            <Gamepad2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg font-bold tracking-tight">
              GAME<span className="gradient-text">VERSE</span>
            </span>
            <span className="font-mono-accent text-[10px] uppercase text-muted-foreground">
              one place. all gaming.
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active =
              item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "relative flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-px h-0.5 gradient-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hidden md:flex items-center gap-2 rounded-md border border-border/80 bg-surface px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/60 transition-colors"
            aria-label="Search"
          >
            <Search className="h-3.5 w-3.5" />
            Search games, news, teams
            <kbd className="ml-3 rounded bg-surface-3 px-1.5 py-0.5 font-mono-accent text-[10px]">
              ⌘K
            </kbd>
          </button>
          <Link
            to="/esports"
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-md bg-surface text-muted-foreground"
          >
            <Trophy className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* mobile nav */}
      <div className="flex md:hidden items-center justify-around border-t border-border/60 bg-background/80 px-2 py-1.5">
        {navItems.map((item) => {
          const active =
            item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-md px-2 py-1.5 text-[10px]",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
