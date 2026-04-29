import { Link } from "@tanstack/react-router";
import { Gamepad2, Newspaper, Trophy, Library } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-surface/40">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-12 md:grid-cols-4 md:px-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Gamepad2 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">
              GAME<span className="gradient-text">VERSE</span>
            </span>
          </div>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            One place for every corner of gaming — top stories, live esports, and a
            directory of thousands of games. Built by gamers, for gamers.
          </p>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Explore
          </h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/news" className="hover:text-primary inline-flex items-center gap-2"><Newspaper className="h-3.5 w-3.5" /> News Hub</Link></li>
            <li><Link to="/esports" className="hover:text-primary inline-flex items-center gap-2"><Trophy className="h-3.5 w-3.5" /> Esports Stats</Link></li>
            <li><Link to="/games" className="hover:text-primary inline-flex items-center gap-2"><Library className="h-3.5 w-3.5" /> Game Directory</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Sources
          </h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>IGN · Kotaku · Polygon</li>
            <li>Dot Esports · PC Gamer</li>
            <li>Eurogamer · GameSpot</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-4 text-xs text-muted-foreground md:px-8">
          <span>© {new Date().getFullYear()} Gameverse</span>
          <span className="font-mono-accent uppercase tracking-widest">
            press start
          </span>
        </div>
      </div>
    </footer>
  );
}
