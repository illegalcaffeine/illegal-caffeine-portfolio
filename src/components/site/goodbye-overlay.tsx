import { useEffect, useRef, useState } from "react";

import { useLanguage } from "@/i18n";

const LEAVE_DELAY_MS = 1700;

export function GoodbyeOverlay() {
  const { lang } = useLanguage();
  const [destination, setDestination] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target as Element | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.hasAttribute("download") || anchor.target === "_blank") return;

      const rawHref = anchor.getAttribute("href");
      if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:")) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      if (url.protocol !== "http:" && url.protocol !== "https:") return;
      if (url.origin === window.location.origin) return;

      event.preventDefault();
      setDestination(url.href);

      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        window.location.assign(url.href);
      }, LEAVE_DELAY_MS);
    };

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const stay = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setDestination(null);
  };

  const leaveNow = () => {
    if (!destination) return;
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    window.location.assign(destination);
  };

  if (!destination) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/96 px-5 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="goodbye-title"
    >
      <div className="w-full max-w-2xl text-center">
        <p className="label-mono text-muted-foreground">GOODBYE / EXIT</p>
        <h2 id="goodbye-title" className="display-lg mt-6 text-foreground">
          {lang === "ko" ? "떠나시나요..?" : "LEAVING ALREADY..?"}
        </h2>
        <p className="body-lg mx-auto mt-7 max-w-xl">
          {lang === "ko"
            ? "벌써 가시는군요. 언젠가 이 월드에서 다시 만날 수 있길 바랄게요..."
            : "Looks like this is where we part ways. Hope our paths cross again someday."}
        </p>
        <p className="label-mono mt-8 text-foreground">SEE YOU AGAIN.</p>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={stay}
            className="label-mono inline-flex min-h-12 items-center justify-center border border-border-strong px-7 text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            {lang === "ko" ? "조금 더 둘러보기" : "STAY A LITTLE LONGER"}
          </button>
          <button
            type="button"
            onClick={leaveNow}
            className="label-mono inline-flex min-h-12 items-center justify-center bg-foreground px-7 text-background transition-opacity hover:opacity-85"
          >
            {lang === "ko" ? "이제 갈게요" : "LEAVE NOW"}
          </button>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          {lang === "ko" ? "이 청크는 다시 오실 때까지 기억해둘게요." : "This chunk will stay loaded for you."}
        </p>
      </div>
    </div>
  );
}
