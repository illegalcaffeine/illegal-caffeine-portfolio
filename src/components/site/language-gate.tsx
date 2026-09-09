import { useLanguage } from "@/i18n";

/**
 * Full-screen language choice, shown once on the first visit to any page.
 * Renders only after hydration so the served markup never changes.
 */
export function LanguageGate() {
  const { setLang, chosen, ready } = useLanguage();

  if (!ready || chosen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Language / 언어"
      className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-background px-5"
    >
      <p className="label-mono text-foreground">ILLEGAL CAFFEINE - DESIGNER -</p>
      <p className="label-mono mt-4">SELECT LANGUAGE / 언어 선택</p>

      <div className="mt-12 flex w-full max-w-md flex-col gap-3">
        <button
          type="button"
          onClick={() => setLang("en")}
          className="display-md flex min-h-16 items-center justify-center border border-border-strong text-muted-foreground transition-colors hover:bg-foreground hover:text-background"
        >
          ENGLISH
        </button>
        <button
          type="button"
          onClick={() => setLang("ko")}
          className="display-md flex min-h-16 items-center justify-center border border-border-strong text-muted-foreground transition-colors hover:bg-foreground hover:text-background"
        >
          한국어
        </button>
      </div>
    </div>
  );
}
