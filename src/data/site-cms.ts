import { supabase } from "@/integrations/supabase/client";

export type BilingualText = { en: string; ko: string };
export type DisciplineContent = { id: string; label: BilingualText; note: BilingualText; image_url: string; image_urls?: string[] };
export type FaqContentItem = { question: BilingualText; answer: BilingualText };

export type SiteContent = {
  homepage: {
    hero_title: BilingualText;
    hero_tagline: BilingualText;
    hero_image_url: string;
    selected_work_slugs: string[];
    intro_title_1: BilingualText;
    intro_title_2: BilingualText;
    intro_body: BilingualText;
    disciplines: DisciplineContent[];
    featured_video: {
      enabled: boolean;
      youtube_url: string;
      title: BilingualText;
      body: BilingualText;
    };
    about_title_1: BilingualText;
    about_title_2: BilingualText;
    about_body: BilingualText;
    about_image_url: string;
    final_title_1: BilingualText;
    final_title_2: BilingualText;
    final_body: BilingualText;
    final_image_url: string;
  };
  faq: {
    eyebrow: BilingualText;
    title: BilingualText;
    intro: BilingualText;
    side_note: BilingualText;
    items: FaqContentItem[];
  };
  payment: {
    provider: BilingualText;
    title: BilingualText;
    heading: BilingualText;
    body_1: BilingualText;
    body_2: BilingualText;
    body_3: BilingualText;
  };
  contact: {
    eyebrow: BilingualText;
    title: BilingualText;
    intro: BilingualText;
  };
  site: {
    brand: string;
    discord: string;
    email: string;
  };
};

const bi = (en: string, ko: string): BilingualText => ({ en, ko });

export const defaultSiteContent: SiteContent = {
  homepage: {
    hero_title: bi("One of the best", "One of the best"),
    hero_tagline: bi("Minecraft Builds · Worlds · Commissions", "Minecraft 건축 · 월드 · 커미션"),
    hero_image_url: "",
    selected_work_slugs: ["imperial-capital", "celestial-palace", "grand-central"],
    intro_title_1: bi("you just found", "방금 발견한"),
    intro_title_2: bi("the hidden gem", "숨겨진 보석"),
    intro_body: bi(
      "I build custom Minecraft architecture, environments and complete worlds on commission — for servers, creators and individuals that need a place, not a pile of blocks.",
      "서버, 크리에이터, 개인을 위해 커스텀 Minecraft 건축과 환경, 완성된 월드를 제작합니다. 단순한 블록 더미가 아니라 실제 장소처럼 느껴지는 공간을 만듭니다.",
    ),
    disciplines: [
      { id: "spawns", label: bi("Server Spawns & Hubs", "서버 스폰 & 허브"), note: bi("Arrival, wayfinding, first impression.", "도착, 동선, 첫인상."), image_url: "", image_urls: [] },
      { id: "special-effects", label: bi("Special Effects", "특수 효과"), note: bi("Large-scale visual effects and set pieces.", "대규모 시각 효과와 연출."), image_url: "", image_urls: [] },
      { id: "fantasy", label: bi("Fantasy Worlds", "판타지 월드"), note: bi("Monuments, kingdoms, invented cultures.", "기념비, 왕국, 창작 문화."), image_url: "", image_urls: [] },
      { id: "terrain", label: bi("Terrain & Environments", "지형 & 환경"), note: bi("Built like nothing you've seen before.", "전에 본 적 없는 방식으로 구축합니다."), image_url: "", image_urls: [] },
      { id: "streamer", label: bi("Streamer Servers", "스트리머 서버"), note: bi("Complete worlds made for creators and communities.", "크리에이터와 커뮤니티를 위한 완성형 월드."), image_url: "", image_urls: [] },
    ],
    featured_video: {
      enabled: false,
      youtube_url: "",
      title: bi("Featured Film", "대표 영상"),
      body: bi("A closer look at the worlds, environments and details behind the work.", "건축과 월드, 디테일을 영상으로 더 가까이 살펴보세요."),
    },
    about_title_1: bi("Not just blocks.", "단순한 블록이 아닙니다."),
    about_title_2: bi("Places with identity.", "정체성을 가진 장소."),
    about_body: bi(
      "Every commission starts with the same questions: where does the player stand, what do they see first, and what does this place tell them about the world it belongs to. Environment, silhouette and storytelling are handled as one problem — which is why the builds hold up in screenshots and in play.",
      "모든 커미션은 플레이어가 어디에 서고, 무엇을 먼저 보며, 이 장소가 세계에 대해 무엇을 말하는지부터 시작합니다. 환경, 실루엣, 스토리텔링을 하나의 문제로 다루기 때문에 스크린샷뿐 아니라 실제 플레이에서도 설득력 있는 공간이 됩니다.",
    ),
    about_image_url: "",
    final_title_1: bi("Have a world in mind?", "머릿속에 그리고 있는 세계가 있나요?"),
    final_title_2: bi("Let's build it.", "함께 만들어봅시다."),
    final_body: bi("I work comfortably at every scale — from focused builds to massive, fully realized openworlds.", "집중된 단일 건축부터 거대한 완성형 오픈월드까지 모든 규모의 작업을 진행합니다."),
    final_image_url: "",
  },
  faq: {
    eyebrow: bi("FAQ / COMMISSIONS", "FAQ / 커미션"),
    title: bi("BEFORE YOU INQUIRE", "자주 묻는 질문"),
    intro: bi("Common questions to review before starting a commission. If something is not covered here, contact me directly.", "의뢰 전에 자주 확인하는 내용을 정리했습니다. 아래에 없는 내용은 CONTACT에서 직접 문의해 주세요."),
    side_note: bi("Scope and terms can vary by project. Final commission conditions are confirmed individually before work begins.", "프로젝트 범위와 조건은 작업마다 다를 수 있으며, 실제 의뢰 조건은 시작 전에 개별적으로 확정합니다."),
    items: [
      { question: bi("What information should I include in a commission inquiry?", "커미션 문의에는 어떤 정보를 포함해야 하나요?"), answer: bi("A useful brief includes the purpose of the build, approximate scale, visual references, budget range and preferred deadline. You do not need to have every detail decided before contacting me.", "건축의 용도, 대략적인 규모, 시각적 레퍼런스, 예산 범위와 희망 마감일을 알려주시면 가장 좋습니다. 문의 전에 모든 세부 사항이 정해져 있을 필요는 없습니다.") },
      { question: bi("What can be commissioned?", "어떤 작업을 의뢰할 수 있나요?"), answer: bi("Server spawns and hubs, cities, fantasy architecture, terrain and environments, streamer server worlds, organic builds and other custom Minecraft worldbuilding can be discussed.", "서버 스폰과 허브, 도시, 판타지 건축, 지형과 환경, 스트리머 서버 월드, 오가닉 빌드 등 다양한 마인크래프트 월드빌딩 작업을 협의할 수 있습니다.") },
      { question: bi("How are files delivered?", "완성된 작업은 어떤 형식으로 전달되나요?"), answer: bi("Delivery is normally arranged as a schematic or world file depending on the project. The exact format is confirmed before work begins.", "프로젝트에 따라 일반적으로 스키매틱 또는 월드 파일로 전달합니다. 정확한 전달 형식은 작업 시작 전에 확정합니다.") },
      { question: bi("How do payment and revisions work?", "결제와 수정은 어떻게 진행되나요?"), answer: bi("Payment terms, milestones and the revision scope are agreed before the build starts. The payment page explains the standard arrangement in more detail.", "결제 조건, 진행 단계와 수정 범위는 작업 시작 전에 합의합니다. 결제 안내 페이지에서 기본 진행 방식을 더 자세히 확인할 수 있습니다.") },
      { question: bi("Can a commission remain private?", "커미션을 비공개로 진행할 수 있나요?"), answer: bi("Yes. If the project should not appear in the portfolio, mention that before the commission begins so privacy can be agreed in advance.", "가능합니다. 포트폴리오에 공개되지 않아야 하는 프로젝트라면 커미션 시작 전에 말씀해 주세요. 사전에 비공개 조건을 협의할 수 있습니다.") },
    ],
  },
  payment: {
    provider: bi("PAYPAL", "PayPal"),
    title: bi("PAYMENT", "결제 안내"),
    heading: bi("PAYMENT INFORMATION", "결제 정보"),
    body_1: bi("Commission payments are handled through PayPal.", "커미션 결제는 PayPal을 통해 진행합니다."),
    body_2: bi("This website does not process payments directly.", "이 웹사이트에서는 결제를 직접 처리하지 않습니다."),
    body_3: bi("Payment details are provided after the project scope and terms are agreed.", "프로젝트 범위와 조건이 합의된 후 결제 세부 정보를 안내합니다."),
  },
  contact: {
    eyebrow: bi("START A PROJECT", "프로젝트 문의"),
    title: bi("TELL ME ABOUT YOUR WORLD", "만들고 싶은 세계를 알려주세요"),
    intro: bi("Send the project brief, references and practical constraints. I’ll reply with the next steps.", "프로젝트 개요, 레퍼런스, 필요한 조건을 보내주세요. 확인 후 다음 진행 방법을 안내합니다."),
  },
  site: {
    brand: "ILLEGAL CAFFEINE - DESIGNER -",
    discord: "illcaffeine",
    email: "illegalcaffeine@gmail.com",
  },
};

function deepMerge<T>(base: T, override: unknown): T {
  if (!override || typeof override !== "object" || Array.isArray(override)) return base;
  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(override as Record<string, unknown>)) {
    const baseValue = result[key];
    if (Array.isArray(value)) result[key] = value;
    else if (value && typeof value === "object" && baseValue && typeof baseValue === "object" && !Array.isArray(baseValue)) result[key] = deepMerge(baseValue, value);
    else result[key] = value;
  }
  return result as T;
}

function normalizeGenreImages(content: SiteContent): SiteContent {
  return {
    ...content,
    homepage: {
      ...content.homepage,
      disciplines: content.homepage.disciplines.map((item) => {
        const imageUrls = Array.isArray(item.image_urls) && item.image_urls.length > 0
          ? item.image_urls.filter(Boolean)
          : item.image_url ? [item.image_url] : [];
        return { ...item, image_urls: imageUrls, image_url: imageUrls[0] ?? "" };
      }),
    },
  };
}

export async function fetchSiteContent(): Promise<SiteContent> {
  try {
    const db = supabase as any;
    const { data, error } = await db.from("site_content").select("key,value");
    if (error || !Array.isArray(data)) return defaultSiteContent;
    let content = defaultSiteContent;
    for (const row of data as Array<{ key: keyof SiteContent; value: unknown }>) {
      if (row.key in content) content = { ...content, [row.key]: deepMerge(content[row.key], row.value) };
    }
    return normalizeGenreImages(content);
  } catch {
    return defaultSiteContent;
  }
}

export async function saveSiteSection<K extends keyof SiteContent>(key: K, value: SiteContent[K]) {
  const db = supabase as any;
  return db.from("site_content").upsert({ key, value }, { onConflict: "key" });
}
