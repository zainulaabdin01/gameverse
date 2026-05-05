import { Outlet, Link, createRootRoute, HeadContent, Scripts, useRouterState } from "@tanstack/react-router";
import { TopNav } from "@/components/TopNav";
import { LiveTicker } from "@/components/LiveTicker";
import { SiteFooter } from "@/components/SiteFooter";
import { RouteProgress } from "@/components/RouteProgress";
import { PageSkeleton } from "@/components/PageSkeleton";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <h1 className="font-display text-7xl font-bold gradient-text">404</h1>
      <h2 className="mt-4 font-display text-xl font-semibold">Wrong dimension</h2>
      <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
        That page isn't part of this universe. Beam back to the home screen.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-md gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
      >
        Back to Gameverse
      </Link>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Gameverse — News, Esports & Game Directory in one place" },
      {
        name: "description",
        content:
          "Gameverse brings gaming news, live esports scores and a searchable game directory together in one fast, beautiful, dark-mode hub.",
      },
      { name: "author", content: "Gameverse" },
      { property: "og:title", content: "Gameverse — One place for everything gaming" },
      {
        property: "og:description",
        content:
          "Top stories, live esports, and thousands of games — all in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  pendingComponent: PageSkeleton,
  pendingMs: 80,
  pendingMinMs: 200,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <RouteProgress />
      <TopNav />
      <LiveTicker />
      <main key={pathname} className="flex-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
