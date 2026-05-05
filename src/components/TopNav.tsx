import { Link, useRouterState } from "@tanstack/react-router";
import { Gamepad2, Newspaper, Trophy, Library, Search, Command, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Home", icon: Gamepad2, hint: "00" },
  { to: "/news", label: "News", icon: Newspaper, hint: "01" },
  { to: "/esports", label: "Esports", icon: Trophy, hint: "02" },
  { to: "/games", label: "Games", icon: Library, hint: "03" },
] as const;

export function TopNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [indicator, setIndicator] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const activeKey =
    navItems.find((i) => (i.to === "/" ? pathname === "/" : pathname.startsWith(i.to)))?.to ?? "/";

  // Move the magic pill indicator
  useEffect(() => {
    const key = hoverKey ?? activeKey;
    const el = itemRefs.current[key];
    const parent = navRef.current;
    if (!el || !parent) return;
    const elRect = el.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();
    setIndicator({
      left: elRect.left - parentRect.left,
      width: elRect.width,
      opacity: 1,
    });
  }, [hoverKey, activeKey, pathname]);

  // Scroll-aware shrink/border
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40">
      {/* Animated hairline gradient divider */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px overflow-hidden">
        <div
          className={cn(
            "absolute inset-y-0 w-[60%] bg-gradient-to-r from-transparent via-primary to-transparent transition-opacity duration-500",
            scrolled ? "opacity-90" : "opacity-40"
          )}
          style={{ animation: "nav-shimmer 6s linear infinite" }}
        />
      </div>

      <style>{`
        @keyframes nav-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(266%); }
        }
        @keyframes nav-orb {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(8px,-4px) scale(1.08); }
        }
      `}</style>

      <div
        className={cn(
          "glass relative transition-all duration-300",
          scrolled ? "shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)]" : ""
        )}
      >
        {/* Floating orb glow inside the nav */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-10 left-1/3 h-32 w-32 rounded-full opacity-30 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, color-mix(in oklab, var(--primary) 70%, transparent), transparent)",
            animation: "nav-orb 9s ease-in-out infinite",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-10 right-1/4 h-32 w-32 rounded-full opacity-25 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, color-mix(in oklab, var(--accent) 70%, transparent), transparent)",
            animation: "nav-orb 11s ease-in-out infinite reverse",
          }}
        />

        <div
          className={cn(
            "mx-auto flex w-full max-w-[1400px] items-center gap-6 px-4 transition-all duration-300 md:px-8",
            scrolled ? "h-14" : "h-16"
          )}
        >
          {/* LOGO */}
          <Link to="/" className="group relative flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg gradient-primary shadow-glow transition-all duration-300 group-hover:scale-110 group-hover:rotate-[-6deg]">
              <Gamepad2 className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
              <span className="absolute -inset-px rounded-lg ring-1 ring-inset ring-white/15" />
              <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
              </span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-[15px] font-bold tracking-tight">
                GAME<span className="gradient-text">VERSE</span>
              </span>
              <span className="font-mono-accent text-[9px] uppercase tracking-[0.2em] text-muted-foreground transition-colors group-hover:text-primary">
                one place · all gaming
              </span>
            </div>
          </Link>

          {/* NAV PILL with magic indicator */}
          <nav
            ref={navRef}
            onMouseLeave={() => setHoverKey(null)}
            className="relative mx-auto hidden items-center rounded-full border border-border/60 bg-surface/40 p-1 backdrop-blur md:flex"
          >
            {/* Magic moving indicator */}
            <span
              aria-hidden
              className="pointer-events-none absolute top-1 bottom-1 rounded-full gradient-primary shadow-glow transition-all duration-[420ms]"
              style={{
                left: indicator.left,
                width: indicator.width,
                opacity: indicator.opacity,
                transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            />
            {navItems.map((item) => {
              const active = activeKey === item.to;
              const isHot = (hoverKey ?? activeKey) === item.to;
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  ref={(el) => {
                    itemRefs.current[item.to] = el;
                  }}
                  onMouseEnter={() => setHoverKey(item.to)}
                  className={cn(
                    "relative z-10 flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                    isHot
                      ? "text-primary-foreground"
                      : active
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-3.5 w-3.5 transition-transform duration-300",
                      isHot ? "scale-110 -rotate-6" : ""
                    )}
                  />
                  {item.label}
                  <span
                    className={cn(
                      "font-mono-accent text-[9px] tracking-widest transition-opacity",
                      isHot ? "text-primary-foreground/70" : "text-muted-foreground/60"
                    )}
                  >
                    {item.hint}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* RIGHT — Search + live pill */}
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1.5 rounded-full border border-border/60 bg-surface/40 px-3 py-1.5 font-mono-accent text-[10px] uppercase tracking-widest text-muted-foreground lg:flex">
              <span className="live-dot" />
              On the wire
            </div>
            <button
              type="button"
              className="group hidden items-center gap-2 rounded-full border border-border/60 bg-surface/40 px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-primary/50 hover:bg-surface/60 hover:text-foreground md:flex"
              aria-label="Search"
            >
              <Search className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
              <span className="hidden lg:inline">Search the verse</span>
              <kbd className="ml-1 flex items-center gap-0.5 rounded bg-surface-3 px-1.5 py-0.5 font-mono-accent text-[10px] text-foreground/80">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            </button>
            <Link
              to="/games"
              className="group relative hidden items-center gap-1.5 overflow-hidden rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary transition-all hover:border-primary hover:text-primary-foreground md:flex"
            >
              <span
                aria-hidden
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-primary to-primary-glow transition-transform duration-500 group-hover:translate-x-0"
              />
              <Sparkles className="relative h-3 w-3" />
              <span className="relative">Press start →</span>
            </Link>
            <button
              type="button"
              aria-label="Search"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-surface/40 text-muted-foreground md:hidden"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* MOBILE NAV */}
        <nav className="flex items-center justify-around border-t border-border/60 px-2 py-1.5 md:hidden">
          {navItems.map((item) => {
            const active =
              item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "relative flex flex-1 flex-col items-center gap-0.5 rounded-md px-2 py-1.5 text-[10px] font-medium transition-all",
                  active ? "text-primary scale-105" : "text-muted-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4 transition-transform", active && "scale-110")} />
                {item.label}
                {active && (
                  <span className="absolute inset-x-4 -top-px h-0.5 rounded-full gradient-primary shadow-glow" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
