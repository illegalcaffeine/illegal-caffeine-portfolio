import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export type SectionNavItem = { id: string; label: string };

/**
 * Minimal right-edge scroll navigator: one dot per major section.
 * Desktop only.
 */
export function SectionNav({ items }: { items: SectionNavItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const onScroll = () => {
      const line = window.innerHeight * 0.35;
      let current = items[0]?.id ?? "";
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= line) current = item.id;
      }
      setActive(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items]);

  return (
    <nav
      aria-label="Sections"
      className="fixed top-1/2 right-4 z-40 hidden -translate-y-1/2 flex-col items-center gap-4 lg:flex"
    >
      {items.map((item) => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            title={item.label}
            aria-label={item.label}
            aria-current={isActive ? "true" : undefined}
            onClick={() =>
              document
                .getElementById(item.id)
                ?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
            className="flex h-4 w-4 items-center justify-center"
          >
            <span
              className={cn(
                "block rounded-full transition-all duration-300",
                isActive
                  ? "h-3 w-3 border border-foreground bg-transparent"
                  : "h-1.5 w-1.5 bg-border-strong",
              )}
            />
          </button>
        );
      })}
    </nav>
  );
}
