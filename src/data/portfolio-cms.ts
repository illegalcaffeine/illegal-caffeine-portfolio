import { projects as staticProjects, type Project, type ProjectFilter } from "@/data/projects";
import { ko } from "@/i18n/ko";
import { supabase } from "@/integrations/supabase/client";

export type CmsGalleryItem = {
  url: string;
  caption_en: string;
  caption_ko: string;
};

export type CmsProjectRow = {
  id: string;
  slug: string;
  title: string;
  category_en: string;
  category_ko: string;
  filter: ProjectFilter;
  description_en: string[];
  description_ko: string[];
  cover_url: string;
  gallery: CmsGalleryItem[];
  award_en: string;
  award_ko: string;
  published: boolean;
  sort_order: number;
};

export type DisplayProject = Project & {
  categoryKo?: string;
  descriptionKo?: string[];
  gallery: Array<{ src: string; caption: string; captionKo?: string }>;
  awardEn?: string;
  awardKo?: string;
};

const coverPaths: Record<string, string> = {
  "imperial-capital": "/work/imperial-capital.png",
  "celestial-palace": "/work/celestial-effigy.jpg",
  "grand-central": "/work/void-terrain.png",
  "blossom-cathedral": "/work/blossom-cathedral.png",
  "raven-colossus": "/work/raven-colossus.png",
  "creature-maw": "/work/creature-maw.png",
  "glass-arcana": "/work/glass-arcana.png",
  "streamer-servers": "/work/streamer-servers.png",
  "goblin-village": "/work/cloud-pavilion.png",
  "gothic-massif": "/work/gothic-massif.png",
  "craken-harbor": "/work/leviathan-harbour.png",
  "white-range": "/work/white-range.png",
  "autumn-canyon": "/work/autumn-canyon.png",
};

const galleryPaths: Record<string, string[]> = {
  "imperial-capital": ["/work/imperial-capital.png", "/work/celestial-effigy.jpg"],
  "celestial-palace": ["/work/celestial-effigy.jpg", "/work/raven-colossus.png"],
  "grand-central": ["/work/void-terrain.png", "/work/glass-arcana.png"],
  "blossom-cathedral": ["/work/blossom-cathedral.png", "/work/gothic-massif.png"],
  "raven-colossus": ["/work/raven-colossus.png", "/work/creature-maw.png"],
  "creature-maw": ["/work/creature-maw.png", "/work/raven-colossus.png"],
  "glass-arcana": ["/work/glass-arcana.png", "/work/void-terrain.png"],
  "streamer-servers": ["/work/streamer-servers.png"],
  "goblin-village": ["/work/cloud-pavilion.png", "/work/gothic-massif.png"],
  "gothic-massif": ["/work/gothic-massif.png", "/work/cloud-pavilion.png"],
  "craken-harbor": ["/work/leviathan-harbour.png", "/work/gothic-massif.png"],
  "white-range": ["/work/white-range.png", "/work/autumn-canyon.png"],
  "autumn-canyon": ["/work/autumn-canyon.png", "/work/white-range.png"],
};

const organicDescriptionKo =
  "순수미술과 입체 조형을 기반으로, 생물부터 복잡한 자연 구조까지 유기적이고 조각적인 형태를 마인크래프트로 옮기는 작업을 전문으로 합니다.";

function translate(text: string | undefined) {
  if (!text) return "";
  return ko[text] ?? text;
}

export const portfolioSeedRows: Omit<CmsProjectRow, "id">[] = staticProjects.map((project, index) => ({
  slug: project.slug,
  title: project.title,
  category_en: project.category ?? "",
  category_ko: translate(project.category),
  filter: project.filter,
  description_en: project.description,
  description_ko: project.description.map((paragraph, paragraphIndex) =>
    project.slug === "celestial-palace" && paragraphIndex === 0 ? organicDescriptionKo : translate(paragraph),
  ),
  cover_url: coverPaths[project.slug] ?? project.cover,
  gallery: project.gallery.map((item, galleryIndex) => ({
    url: galleryPaths[project.slug]?.[galleryIndex] ?? item.src,
    caption_en: item.caption,
    caption_ko: translate(item.caption),
  })),
  award_en: project.slug === "celestial-palace" ? "AWARDED — 2025 KIBO COMPETITION" : "",
  award_ko: project.slug === "celestial-palace" ? "2025 KIBO COMPETITION 수상작" : "",
  published: true,
  sort_order: index,
}));

function normalizeRow(row: Record<string, unknown>): CmsProjectRow {
  const gallery = Array.isArray(row.gallery) ? row.gallery : [];
  return {
    id: String(row.id ?? ""),
    slug: String(row.slug ?? ""),
    title: String(row.title ?? ""),
    category_en: String(row.category_en ?? ""),
    category_ko: String(row.category_ko ?? ""),
    filter: (row.filter as ProjectFilter) ?? "fantasy",
    description_en: Array.isArray(row.description_en) ? row.description_en.map(String) : [],
    description_ko: Array.isArray(row.description_ko) ? row.description_ko.map(String) : [],
    cover_url: String(row.cover_url ?? ""),
    gallery: gallery
      .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
      .map((item) => ({
        url: String(item.url ?? ""),
        caption_en: String(item.caption_en ?? ""),
        caption_ko: String(item.caption_ko ?? ""),
      })),
    award_en: String(row.award_en ?? ""),
    award_ko: String(row.award_ko ?? ""),
    published: Boolean(row.published),
    sort_order: Number(row.sort_order ?? 0),
  };
}

export function rowToDisplayProject(row: CmsProjectRow): DisplayProject {
  const gallery = row.gallery.map((item) => ({
    src: item.url,
    caption: item.caption_en,
    ...(item.caption_ko ? { captionKo: item.caption_ko } : {}),
  }));

  return {
    slug: row.slug,
    title: row.title,
    filter: row.filter,
    description: row.description_en,
    cover: row.cover_url,
    gallery,
    ...(row.category_en ? { category: row.category_en } : {}),
    ...(row.category_ko ? { categoryKo: row.category_ko } : {}),
    ...(row.description_ko.length ? { descriptionKo: row.description_ko } : {}),
    ...(row.award_en ? { awardEn: row.award_en } : {}),
    ...(row.award_ko ? { awardKo: row.award_ko } : {}),
  };
}

function staticFallback(): DisplayProject[] {
  return staticProjects.map((_, index) => rowToDisplayProject({ id: `static-${index}`, ...portfolioSeedRows[index]! }));
}

export async function fetchPublishedPortfolioProjects(): Promise<DisplayProject[]> {
  try {
    const db = supabase as any;
    const { data, error } = await db
      .from("portfolio_projects")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true });
    if (error || !Array.isArray(data) || data.length === 0) return staticFallback();
    return data.map((row: Record<string, unknown>) => rowToDisplayProject(normalizeRow(row)));
  } catch {
    return staticFallback();
  }
}

export async function fetchPublishedPortfolioProject(slug: string): Promise<DisplayProject | undefined> {
  const projects = await fetchPublishedPortfolioProjects();
  return projects.find((project) => project.slug === slug);
}

export async function fetchPublishedPortfolioProjectSet(slug: string) {
  const projects = await fetchPublishedPortfolioProjects();
  const index = projects.findIndex((project) => project.slug === slug);
  if (index === -1) return { project: undefined, prev: undefined, next: undefined };
  return {
    project: projects[index],
    prev: projects[(index - 1 + projects.length) % projects.length],
    next: projects[(index + 1) % projects.length],
  };
}
