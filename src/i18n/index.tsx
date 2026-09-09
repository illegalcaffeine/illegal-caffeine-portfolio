import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { ko } from "./ko";

export type Language = "en" | "ko";

const STORAGE_KEY = "ics-language";

type LanguageContextValue = {
  lang: Language;
  setLang: (lang: Language) => void;
  /** True once a language has been chosen (or restored from storage). */
  chosen: boolean;
  /** True after hydration — used to keep server and client markup identical. */
  ready: boolean;
  t: (text: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");
  const [chosen, setChosen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      stored = null;
    }
    if (stored === "en" || stored === "ko") {
      setLangState(stored);
      setChosen(true);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Language) => {
    setLangState(next);
    setChosen(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable — the choice still applies for this visit */
    }
  }, []);

  const t = useCallback(
    (text: string) => {
      if (lang !== "ko") return text;
      const translated = ko[text];
      if (translated) return translated;
      if (import.meta.env.DEV && text.trim()) {
        console.warn(`[i18n] Missing Korean translation: ${text}`);
      }
      return text;
    },
    [lang],
  );

  const value = useMemo(
    () => ({ lang, setLang, chosen, ready, t }),
    [lang, setLang, chosen, ready, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}

/** Translate a visible English string into the active language. */
export function useT() {
  return useLanguage().t;
}
