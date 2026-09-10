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
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { SiteExtras } from "@/components/site/site-extras";
import { CursorFollower } from "@/components/site/cursor-follower";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider, useLanguage } from "@/i18n";
import { LanguageGate } from "@/components/site/language-gate";

function NotFoundComponent() {
  const { lang } = useLanguage();
  return (
    <section className="flex min-h-[78svh] items-center border-b border-border bg-background px-5 pt-28 md:px-10 md:pt-36">
      <div className="mx-auto w-full max-w-[1600px] py-20 md:py-28">
        <p className="label-mono">404 / PAGE NOT FOUND</p>
        <h1 className="display-xl mt-7 max-w-[10ch]">
          {lang === "ko" ? "이 페이지는 존재하지 않습니다." : "NOTHING HERE."}
        </h1>
        <p className="body-lg mt-8 max-w-xl">
          {lang === "ko"
            ? "요청한 주소에서 페이지를 찾을 수 없습니다. 인덱스로 돌아가거나 아카이브에서 작업을 둘러보세요."
            : "The requested page does not exist. Return to the index or continue through the archive."}
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/"
            className="label-mono inline-flex min-h-12 items-center border border-border-strong bg-foreground px-6 text-background transition-opacity hover:opacity-85"
          >
            {lang === "ko" ? "인덱스로 돌아가기" : "RETURN TO INDEX"}
          </Link>
          <Link
            to="/work"
            className="label-mono inline-flex min-h-12 items-center border border-border-strong px-6 text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            {lang === "ko" ? "아카이브 보기" : "VIEW ARCHIVE"}
          </Link>
        </div>
      </div>
    </section>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="max-w-md text-center">
        <p className="label-mono">ERROR / RENDER</p>
        <h1 className="display-md mt-6">This page didn't load.</h1>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="label-mono inline-flex min-h-12 items-center border border-border-strong px-6 text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            Try again
          </button>
          <a
            href="/"
            className="label-mono inline-flex min-h-12 items-center border border-border px-6 text-muted-foreground transition-colors hover:text-foreground"
          >
            Go home
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
      { name: "author", content: "Illegal Caffeine - Designer -" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
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
      <LanguageProvider>
        <LanguageGate />
        <SiteHeader />
        <main>
          <Outlet />
        </main>
        <SiteExtras />
        <SiteFooter />
        <Toaster />
        <CursorFollower />
      </LanguageProvider>
    </QueryClientProvider>
  );
}
