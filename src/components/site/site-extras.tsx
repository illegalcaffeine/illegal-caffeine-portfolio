import { Link, useRouterState } from "@tanstack/react-router";
import { useLanguage } from "@/i18n";
import { Reveal } from "@/components/site/reveal";

const faq = [
  {
    en: "What information should I include in a commission inquiry?",
    ko: "커미션 문의에는 어떤 정보를 포함해야 하나요?",
    answerEn:
      "A useful brief includes the purpose of the build, approximate scale, visual references, budget range and preferred deadline. You do not need to have every detail decided before contacting me.",
    answerKo:
      "건축의 용도, 대략적인 규모, 시각적 레퍼런스, 예산 범위와 희망 마감일을 알려주시면 가장 좋습니다. 문의 전에 모든 세부 사항이 정해져 있을 필요는 없습니다.",
  },
  {
    en: "What can be commissioned?",
    ko: "어떤 작업을 의뢰할 수 있나요?",
    answerEn:
      "Server spawns and hubs, cities, fantasy architecture, terrain and environments, streamer server worlds, organic builds and other custom Minecraft worldbuilding can be discussed.",
    answerKo:
      "서버 스폰과 허브, 도시, 판타지 건축, 지형과 환경, 스트리머 서버 월드, 오가닉 빌드 등 다양한 마인크래프트 월드빌딩 작업을 협의할 수 있습니다.",
  },
  {
    en: "How are files delivered?",
    ko: "완성된 작업은 어떤 형식으로 전달되나요?",
    answerEn:
      "Delivery is normally arranged as a schematic or world file depending on the project. The exact format is confirmed before work begins.",
    answerKo:
      "프로젝트에 따라 일반적으로 스키매틱 또는 월드 파일로 전달합니다. 정확한 전달 형식은 작업 시작 전에 확정합니다.",
  },
  {
    en: "How do payment and revisions work?",
    ko: "결제와 수정은 어떻게 진행되나요?",
    answerEn:
      "Payment terms, milestones and the revision scope are agreed before the build starts. The commission terms on this page explain the standard arrangement in more detail.",
    answerKo:
      "결제 조건, 진행 단계와 수정 범위는 작업 시작 전에 합의합니다. 이 페이지의 커미션 약관에서 기본 진행 방식을 더 자세히 확인할 수 있습니다.",
  },
  {
    en: "Can a commission remain private?",
    ko: "커미션을 비공개로 진행할 수 있나요?",
    answerEn:
      "Yes. If the project should not appear in the portfolio, mention that before the commission begins so privacy can be agreed in advance.",
    answerKo:
      "가능합니다. 포트폴리오에 공개되지 않아야 하는 프로젝트라면 커미션 시작 전에 말씀해 주세요. 사전에 비공개 조건을 협의할 수 있습니다.",
  },
];

export function SiteExtras() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { lang } = useLanguage();

  if (pathname === "/") return <Recognition lang={lang} />;
  if (pathname === "/contact") return <Faq lang={lang} />;
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

function Faq({ lang }: { lang: "en" | "ko" }) {
  return (
    <section className="border-t border-border bg-surface/20">
      <div className="mx-auto max-w-[1600px] px-5 py-20 md:px-10 md:py-28">
        <div className="grid gap-10 md:grid-cols-12 md:gap-16">
          <Reveal className="md:col-span-4">
            <p className="label-mono text-foreground">FAQ</p>
            <h2 className="display-md mt-6">
              {lang === "ko" ? "의뢰 전 자주 묻는 질문" : "BEFORE YOU INQUIRE"}
            </h2>
          </Reveal>
          <div className="md:col-span-8">
            {faq.map((item) => (
              <Reveal key={item.en} className="border-t border-border py-7 md:py-9">
                <h3 className="text-sm font-medium text-foreground">
                  {lang === "ko" ? item.ko : item.en}
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {lang === "ko" ? item.answerKo : item.answerEn}
                </p>
              </Reveal>
            ))}
            <div className="border-t border-border pt-7">
              <Link to="/payment" className="label-mono text-foreground underline underline-offset-4">
                {lang === "ko" ? "결제 안내 보기" : "VIEW PAYMENT INFORMATION"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
