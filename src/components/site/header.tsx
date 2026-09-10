import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n";

const nav = [
  { to: "/", label: "Index" },
  { to: "/work", label: "archive" },
  { to: "/payment", label: "Payment" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
] as const;

function LanguageSwitch({ className }: { className?: string }) {
  const { lang, setLang } = useLanguage();
  return (
    <div className={cn("flex items-center gap-1", className)} aria-label="Language">
      {(["en", "ko"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={cn(
            "label-mono px-2 py-1 transition-colors",
            lang === code ? "text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { t } = useLanguage();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-90 transition-colors duration-500",
        scrolled || open ? "border-b border-border bg-background/92 backdrop-blur-sm" : "",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-5 lg:h-20 lg:px-10">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-3 transition-opacity hover:opacity-60"
          aria-label="Illegal Caffeine - Designer - — home"
        >
          <span className="h-9 w-9 shrink-0 overflow-hidden rounded-[9px] bg-surface lg:h-10 lg:w-10 lg:rounded-[10px]">
            <img
              src="/illegalcaffeine-logo.png"
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover [image-rendering:pixelated]"
              width={40}
              height={40}
            />
          </span>
          <span className="label-mono hidden truncate text-foreground sm:inline">
            ILLEGAL CAFFEINE<span className="text-muted-foreground"> - DESIGNER -</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 xl:gap-10 lg:flex" aria-label="Main">
          {nav.map((item) =>
            item.to === "/contact" ? (
              <Link
                key={item.to}
                to={item.to}
                className="label-mono border border-border-strong px-4 py-3 text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                {t(item.label)}
              </Link>
            ) : (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="label-mono relative py-2 transition-colors hover:text-foreground data-[status=active]:text-foreground"
              >
                {t(item.label)}
              </Link>
            )
          )}
          <LanguageSwitch className="-mr-2" />
        </nav>

        <div className="flex shrink-0 items-center gap-1 lg:hidden">
          <LanguageSwitch />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="-mr-2 flex h-11 w-11 items-center justify-center"
          >
            <span className="relative block h-3 w-6">
              <span
                className={cn(
                  "absolute left-0 block h-px w-6 bg-foreground transition-transform duration-300",
                  open ? "top-1.5 rotate-45" : "top-0",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 block h-px w-6 bg-foreground transition-transform duration-300",
                  open ? "top-1.5 -rotate-45" : "top-3",
                )}
              />
            </span>
          </button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-border transition-[max-height,opacity] duration-500 lg:hidden",
          open ? "max-h-[calc(100svh-4rem)] border-t opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <nav className="flex max-h-[calc(100svh-4rem)] flex-col overflow-y-auto px-4 py-4 sm:px-5" aria-label="Mobile">
          {nav.map((item) =>
            item.to === "/contact" ? (
              <Link
                key={item.to}
                to={item.to}
                className="label-mono mt-5 flex min-h-12 items-center justify-center border border-border-strong text-foreground"
              >
                {t(item.label)}
              </Link>
            ) : (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="display-md border-b border-border py-4 text-muted-foreground data-[status=active]:text-foreground sm:py-5"
              >
                {t(item.label)}
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
