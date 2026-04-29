import { Link, useRouterState } from "@tanstack/react-router";
import { Gamepad2, Newspaper, Trophy, Library, Search, Command } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Home", icon: Gamepad2, hint: "00" },
  { to: "/news", label: "News", icon: Newspaper, hint: "01" },
  { to: "/esports", label: "Esports", icon: Trophy, hint: "02" },
  { to: "/games", label: "Games", icon: Library, hint: "03" },
] as const;

export function TopNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-40">
      {/* Hairline gradient divider */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="glass">
        <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center gap-6 px-4 md:px-8">
          {/* LOGO */}
          <Link to="/" className="group flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg gradient-primary shadow-glow transition-transform group-hover:scale-105">
              <Gamepad2 className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
              <span className="absolute -inset-px rounded-lg ring-1 ring-inset ring-white/15" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-[15px] font-bold tracking-tight">
                GAME<span className="gradient-text">VERSE</span>
              </span>
              <span className="font-mono-accent text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                one place · all gaming
              </span>
            </div>
          </Link>

          {/* NAV PILL */}
          <nav className="hidden md:flex relative mx-auto items-center rounded-full border border-border/60 bg-surface/40 p-1 backdrop-blur">
            {navItems.map((item) => {
              const active =
                item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "group relative flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {active && (
                    <span className="absolute inset-0 rounded-full gradient-primary shadow-glow -z-0" />
                  )}
                  <span className="relative flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                    <span
                      className={cn(
                        "font-mono-accent text-[9px] tracking-widest transition-opacity",
                        active ? "text-primary-foreground/70" : "text-muted-foreground/60"
                      )}
                    >
                      {item.hint}
                    </span>
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* RIGHT — Search + live pill */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-border/60 bg-surface/40 px-3 py-1.5 font-mono-accent text-[10px] uppercase tracking-widest text-muted-foreground">
              <span className="live-dot" />
              On the wire
            </div>
            <button
              type="button"
              className="group hidden md:flex items-center gap-2 rounded-full border border-border/60 bg-surface/40 px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
              aria-label="Search"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Search the verse</span>
              <kbd className="ml-1 flex items-center gap-0.5 rounded bg-surface-3 px-1.5 py-0.5 font-mono-accent text-[10px] text-foreground/80">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            </button>
            <Link
              to="/games"
              className="hidden md:flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/15 transition-colors"
            >
              Press start →
            </Link>
            <button
              type="button"
              aria-label="Search"
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-surface/40 text-muted-foreground"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* MOBILE NAV */}
        <nav className="flex md:hidden items-center justify-around border-t border-border/60 px-2 py-1.5">
          {navItems.map((item) => {
            const active =
              item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "relative flex flex-1 flex-col items-center gap-0.5 rounded-md px-2 py-1.5 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
                {active && (
                  <span className="absolute inset-x-4 -top-px h-0.5 rounded-full gradient-primary" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
