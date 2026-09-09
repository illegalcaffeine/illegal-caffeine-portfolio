import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n";

const nav = [
  { to: "/", label: "Index" },
  { to: "/work", label: "Previous Works" },
  { to: "/payment", label: "Payment" },
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
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5 md:h-20 md:px-10">
        <Link
          to="/"
          className="label-mono text-foreground transition-opacity hover:opacity-60"
          aria-label="Illegal Caffeine - Designer - — home"
        >
          ILLEGAL CAFFEINE<span className="text-muted-foreground"> - DESIGNER -</span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex" aria-label="Main">
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
                <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-foreground transition-[width] duration-500 group-hover:w-full" />
              </Link>
            )
          )}
          <LanguageSwitch className="-mr-2" />
        </nav>

        <div className="flex items-center gap-1 md:hidden">
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

      {/* Mobile navigation */}
      <div
        className={cn(
          "overflow-hidden border-border transition-[max-height,opacity] duration-500 md:hidden",
          open ? "max-h-[80vh] border-t opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <nav className="flex flex-col px-5 py-4" aria-label="Mobile">
          {nav.map((item) =>
            item.to === "/contact" ? (
              <Link
                key={item.to}
                to={item.to}
                className="label-mono mt-6 flex min-h-12 items-center justify-center border border-border-strong text-foreground"
              >
                {t(item.label)}
              </Link>
            ) : (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="display-md border-b border-border py-5 text-muted-foreground data-[status=active]:text-foreground"
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
