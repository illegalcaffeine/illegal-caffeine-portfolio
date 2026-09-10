import { Link, createFileRoute } from "@tanstack/react-router";
import { Reveal, RevealLines } from "@/components/site/reveal";
import { useLanguage } from "@/i18n";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Illegal Caffeine - Designer -" },
      { name: "description", content: "Frequently asked questions about Minecraft commissions, delivery, payment, revisions and privacy." },
    ],
  }),
  component: FaqPage,
});

const faq = [
  { en: "What information should I include in a commission inquiry?", ko: "커미션 문의에는 어떤 정보를 포함해야 하나요?", answerEn: "A useful brief includes the purpose of the build, approximate scale, visual references, budget range and preferred deadline. You do not need to have every detail decided before contacting me.", answerKo: "건축의 용도, 대략적인 규모, 시각적 레퍼런스, 예산 범위와 희망 마감일을 알려주시면 가장 좋습니다. 문의 전에 모든 세부 사항이 정해져 있을 필요는 없습니다." },
  { en: "What can be commissioned?", ko: "어떤 작업을 의뢰할 수 있나요?", answerEn: "Server spawns and hubs, cities, fantasy architecture, terrain and environments, streamer server worlds, organic builds and other custom Minecraft worldbuilding can be discussed.", answerKo: "서버 스폰과 허브, 도시, 판타지 건축, 지형과 환경, 스트리머 서버 월드, 오가닉 빌드 등 다양한 마인크래프트 월드빌딩 작업을 협의할 수 있습니다." },
  { en: "How are files delivered?", ko: "완성된 작업은 어떤 형식으로 전달되나요?", answerEn: "Delivery is normally arranged as a schematic or world file depending on the project. The exact format is confirmed before work begins.", answerKo: "프로젝트에 따라 일반적으로 스키매틱 또는 월드 파일로 전달합니다. 정확한 전달 형식은 작업 시작 전에 확정합니다." },
  { en: "How do payment and revisions work?", ko: "결제와 수정은 어떻게 진행되나요?", answerEn: "Payment terms, milestones and the revision scope are agreed before the build starts. The payment page explains the standard arrangement in more detail.", answerKo: "결제 조건, 진행 단계와 수정 범위는 작업 시작 전에 합의합니다. 결제 안내 페이지에서 기본 진행 방식을 더 자세히 확인할 수 있습니다." },
  { en: "Can a commission remain private?", ko: "커미션을 비공개로 진행할 수 있나요?", answerEn: "Yes. If the project should not appear in the portfolio, mention that before the commission begins so privacy can be agreed in advance.", answerKo: "가능합니다. 포트폴리오에 공개되지 않아야 하는 프로젝트라면 커미션 시작 전에 말씀해 주세요. 사전에 비공개 조건을 협의할 수 있습니다." },
];

function FaqPage() {
  const { lang } = useLanguage();
  return (
    <>
      <section className="border-b border-border px-4 pt-28 pb-10 sm:px-5 sm:pt-32 md:px-8 md:pt-40 md:pb-14 lg:px-10 lg:pt-48 lg:pb-16">
        <div className="mx-auto max-w-[1600px]">
          <p className="label-mono">FAQ / COMMISSIONS</p>
          <RevealLines immediate className="mt-5 md:mt-6" lineTextClassName="text-[clamp(2.4rem,7vw,4.0625rem)] font-bold leading-[0.98] tracking-[-0.03em] uppercase" lines={[lang === "ko" ? "자주 묻는 질문" : "BEFORE YOU INQUIRE"]} />
          <p className="body-lg mt-6 max-w-2xl md:mt-8">{lang === "ko" ? "의뢰 전에 자주 확인하는 내용을 정리했습니다. 아래에 없는 내용은 CONTACT에서 직접 문의해 주세요." : "Common questions to review before starting a commission. If something is not covered here, contact me directly."}</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-4 py-12 sm:px-5 md:px-8 md:py-20 lg:px-10 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-4">
            <p className="label-mono text-foreground">ILLEGAL CAFFEINE</p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">{lang === "ko" ? "프로젝트 범위와 조건은 작업마다 다를 수 있으며, 실제 의뢰 조건은 시작 전에 개별적으로 확정합니다." : "Scope and terms can vary by project. Final commission conditions are confirmed individually before work begins."}</p>
          </Reveal>

          <div className="lg:col-span-8">
            {faq.map((item, index) => (
              <Reveal key={item.en} className="grid gap-3 border-t border-border py-7 sm:grid-cols-[52px_1fr] sm:gap-5 md:grid-cols-[64px_1fr] md:gap-6 md:py-10">
                <span className="label-mono">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h2 className="text-base font-medium leading-snug text-foreground md:text-lg">{lang === "ko" ? item.ko : item.en}</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:mt-4">{lang === "ko" ? item.answerKo : item.answerEn}</p>
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
