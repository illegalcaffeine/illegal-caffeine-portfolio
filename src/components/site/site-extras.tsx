import { useRouterState } from "@tanstack/react-router";
import { useLanguage } from "@/i18n";
import { Reveal } from "@/components/site/reveal";

export function SiteExtras() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { lang } = useLanguage();

  if (pathname === "/") return <Recognition lang={lang} />;
  return null;
}

function Recognition({ lang }: { lang: "en" | "ko" }) {
  return (
    <section className="border-t border-border bg-surface/20">
      <div className="mx-auto max-w-[1600px] px-5 py-20 md:px-10 md:py-28">
        <Reveal>
          <p className="label-mono text-foreground">
            {lang === "ko" ? "수상 / 선정" : "AWARDS / RECOGNITION"}
          </p>
          <div className="mt-8 grid gap-6 border-t border-border pt-8 md:grid-cols-12 md:items-end">
            <div className="md:col-span-8">
              <p className="display-md">2025 KIBO COMPETITION</p>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {lang === "ko"
                  ? "ORGANIC BUILDS에 소개된 작품이 2025 KIBO COMPETITION에서 수상했습니다."
                  : "The work featured in ORGANIC BUILDS was awarded at the 2025 KIBO COMPETITION."}
              </p>
            </div>
            <p className="label-mono md:col-span-4 md:text-right">
              {lang === "ko" ? "수상 · 2025" : "AWARDED · 2025"}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
