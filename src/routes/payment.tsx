import { createFileRoute, Link } from "@tanstack/react-router";

import { Reveal } from "@/components/site/reveal";
import { fetchSiteContent } from "@/data/site-cms";
import { useLanguage, useT } from "@/i18n";

export const Route = createFileRoute("/payment")({
  loader: () => fetchSiteContent(),
  head: () => ({
    meta: [
      { title: "Payment — Illegal Caffeine - Designer -" },
      {
        name: "description",
        content:
          "Commission payments for Illegal Caffeine - Designer - are handled through PayPal. This website does not process payments directly.",
      },
      { property: "og:title", content: "Payment — Illegal Caffeine - Designer -" },
      {
        property: "og:description",
        content: "Commission payments are handled through PayPal. No payments are processed here.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PaymentPage,
});

function PaymentPage() {
  const t = useT();
  const { lang } = useLanguage();
  const payment = Route.useLoaderData().payment;
  const text = (value: { en: string; ko: string }) => lang === "ko" ? value.ko || value.en : value.en;
  return (
    <>
      <section className="border-b border-border px-5 pt-28 pb-9 sm:pt-32 sm:pb-10 md:px-10 md:pt-48 md:pb-14">
        <div className="mx-auto max-w-[1600px]">
          <p className="label-mono">{"\u00a0"}{text(payment.provider)}</p>
          <h1 className="display-xl mt-5 break-words !text-[clamp(2.5rem,12vw,3.75rem)] md:mt-6 md:!text-[60px]">{text(payment.title)}</h1>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 py-12 sm:py-16 md:px-10 md:py-24">
        <div className="grid gap-9 sm:gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-5">
            <Reveal><h2 className="display-md max-w-[16ch] break-words !text-[clamp(1.75rem,9vw,2.75rem)] md:!text-[clamp(1.5rem,3.2vw,2.75rem)]">{text(payment.heading)}</h2></Reveal>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <Reveal delay={80}><p className="body-lg">{text(payment.body_1)}</p></Reveal>
            <Reveal delay={140}><p className="mt-5 text-sm leading-relaxed text-muted-foreground sm:mt-6 sm:text-base">{text(payment.body_2)}</p></Reveal>
            <Reveal delay={200}><p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">{text(payment.body_3)}</p></Reveal>
            <Reveal delay={260}>
              <Link to="/contact" className="label-mono mt-8 inline-flex min-h-12 w-full items-center justify-center border border-border-strong px-6 text-foreground transition-colors hover:bg-foreground hover:text-background sm:mt-10 sm:w-auto">{t("Start a Project")}</Link>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
