import { Outlet, useLocation } from "react-router-dom";

import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";
import { SceneBackground, type SceneKey } from "@/components/SceneBackground";
import { SiteHeader } from "@/components/SiteHeader";

function sceneForPath(pathname: string): SceneKey | undefined {
  if (pathname.startsWith("/ingredients")) return "pantry";
  if (pathname.startsWith("/preferences")) return "taste";
  return undefined;
}

export function AppLayout() {
  const { pathname } = useLocation();
  const scene = sceneForPath(pathname);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <RouteErrorBoundary label="App layout">
        {scene ? (
          <SceneBackground scene={scene}>
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
              <RouteErrorBoundary label="Page content">
                <Outlet />
              </RouteErrorBoundary>
            </main>
          </SceneBackground>
        ) : (
          <div className="flex-1 bg-gradient-to-br from-amber-50 via-orange-50/30 to-stone-100 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
            <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
              <RouteErrorBoundary label="Page content">
                <Outlet />
              </RouteErrorBoundary>
            </main>
          </div>
        )}
      </RouteErrorBoundary>
    </div>
  );
}
