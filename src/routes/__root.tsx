import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Button } from "@/components/ui/button";

function NotFoundComponent() {
  return (
    <div className="bg-hero flex min-h-screen items-center justify-center px-4">
      <div className="glass-strong max-w-md rounded-3xl p-10 text-center shadow-warm">
        <div className="mx-auto mb-4 w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          404
        </div>
        <h1 className="font-display text-4xl font-semibold">
          This dish is off the menu
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          We couldn't find the page you were looking for. It may have been moved
          or eaten by a very hungry chef.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link to="/">
            <Button className="rounded-full">Back home</Button>
          </Link>
          <Link to="/recipes">
            <Button variant="outline" className="rounded-full">
              Browse recipes
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl font-semibold">Something burned</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Try again or head home while we sort things out.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            Try again
          </Button>
          <a href="/">
            <Button variant="outline">Go home</Button>
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Saveur — Interactive Recipe Book" },
      {
        name: "description",
        content:
          "Discover, cook, and share beautiful recipes with Saveur — an interactive recipe book for curious home cooks.",
      },
      { property: "og:title", content: "Saveur — Interactive Recipe Book" },
      {
        property: "og:description",
        content:
          "Discover, cook, and share beautiful recipes with Saveur.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
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
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
