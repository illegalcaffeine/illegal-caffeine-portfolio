import { createFileRoute, Link } from "@tanstack/react-router";

import { paymentInfo } from "@/data/projects";
import { Reveal } from "@/components/site/reveal";
import { useT } from "@/i18n";

export const Route = createFileRoute("/payment")({
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
  return (
    <>
      <section className="border-b border-border px-5 pt-32 pb-10 md:px-10 md:pt-48 md:pb-14">
        <div className="mx-auto max-w-[1600px]">
          <p className="label-mono">{t(paymentInfo.provider.toUpperCase())}</p>
          <h1 className="display-xl mt-6">{t(paymentInfo.title)}</h1>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 py-16 md:px-10 md:py-24">
        <div className="grid gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-5">
            <Reveal>
              <h2 className="display-md">{t(paymentInfo.heading)}</h2>
            </Reveal>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <Reveal delay={80}>
              <p className="body-lg">{t("Commission payments are handled through PayPal.")}</p>
            </Reveal>
            <Reveal delay={140}>
              <p className="mt-6 text-muted-foreground">
                {t("This website does not process payments directly.")}
              </p>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-4 text-muted-foreground">
                {t("Payment details are provided after the project scope and terms are agreed.")}
              </p>
            </Reveal>
            <Reveal delay={260}>
              <Link
                to="/contact"
                className="label-mono mt-10 inline-flex min-h-12 items-center border border-border-strong px-6 text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                {t("Start a Project")}
              </Link>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
