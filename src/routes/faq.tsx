import { Link, createFileRoute } from "@tanstack/react-router";
import { Reveal, RevealLines } from "@/components/site/reveal";
import { fetchSiteContent } from "@/data/site-cms";
import { useLanguage } from "@/i18n";

export const Route = createFileRoute("/faq")({
  loader: () => fetchSiteContent(),
  head: () => ({
    meta: [
      { title: "FAQ — Illegal Caffeine - Designer -" },
      { name: "description", content: "Frequently asked questions about Minecraft commissions, delivery, payment, revisions and privacy." },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  const { lang } = useLanguage();
  const site = Route.useLoaderData();
  const faq = site.faq;
  const text = (value: { en: string; ko: string }) => lang === "ko" ? value.ko || value.en : value.en;
  return (
    <>
      <section className="border-b border-border px-4 pt-28 pb-10 sm:px-5 sm:pt-32 md:px-8 md:pt-40 md:pb-14 lg:px-10 lg:pt-48 lg:pb-16">
        <div className="mx-auto max-w-[1600px]">
          <p className="label-mono">{text(faq.eyebrow)}</p>
          <RevealLines immediate className="mt-5 md:mt-6" lineTextClassName="text-[clamp(2.4rem,7vw,4.0625rem)] font-bold leading-[0.98] tracking-[-0.03em] uppercase" lines={[text(faq.title)]} />
          <p className="body-lg mt-6 max-w-2xl md:mt-8">{text(faq.intro)}</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-4 py-12 sm:px-5 md:px-8 md:py-20 lg:px-10 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-4">
            <p className="label-mono text-foreground">ILLEGAL CAFFEINE</p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">{text(faq.side_note)}</p>
          </Reveal>

          <div className="lg:col-span-8">
            {faq.items.map((item, index) => (
              <Reveal key={`${item.question.en}-${index}`} className="grid gap-3 border-t border-border py-7 sm:grid-cols-[52px_1fr] sm:gap-5 md:grid-cols-[64px_1fr] md:gap-6 md:py-10">
                <span className="label-mono">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h2 className="text-base font-medium leading-snug text-foreground md:text-lg">{text(item.question)}</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:mt-4">{text(item.answer)}</p>
                </div>
              </Reveal>
            ))}

            <div className="flex flex-col gap-3 border-t border-border pt-7 sm:flex-row sm:flex-wrap sm:pt-8">
              <Link to="/contact" className="label-mono inline-flex min-h-12 items-center justify-center border border-border-strong bg-foreground px-5 text-center text-background transition-opacity hover:opacity-85 sm:px-6">{lang === "ko" ? "문의하기" : "START AN INQUIRY"}</Link>
              <Link to="/payment" className="label-mono inline-flex min-h-12 items-center justify-center border border-border-strong px-5 text-center text-foreground transition-colors hover:bg-foreground hover:text-background sm:px-6">{lang === "ko" ? "결제 안내" : "PAYMENT INFORMATION"}</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
