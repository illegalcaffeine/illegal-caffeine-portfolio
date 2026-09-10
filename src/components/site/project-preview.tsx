import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/data/projects";
import { Reveal } from "@/components/site/reveal";
import { Parallax } from "@/components/site/parallax";
import { cn } from "@/lib/utils";
import { useLanguage, useT } from "@/i18n";

export function ProjectPreview({
  project,
  layout = "full",
  eager = false,
  imageOverride,
}: {
  project: Project;
  layout?: "full" | "offset-left" | "offset-right" | "wide";
  eager?: boolean;
  imageOverride?: string;
}) {
  const t = useT();
  const { lang } = useLanguage();
  const isOrganicBuilds = project.slug === "celestial-palace";
  const organicDescriptionKo =
    "순수미술과 입체 조형을 기반으로, 생물부터 복잡한 자연 구조까지 유기적이고 조각적인 형태를 마인크래프트로 옮기는 작업을 전문으로 합니다.";
  const description =
    isOrganicBuilds && lang === "ko"
      ? organicDescriptionKo
      : t(project.description[0] ?? "");
  const awardLabel = lang === "ko" ? "2025 KIBO COMPETITION 수상작" : "AWARDED — 2025 KIBO COMPETITION";

  const image = (
    <div
      className={cn(
        "zoom-frame relative h-full w-full border border-border bg-surface",
        layout === "full" && "aspect-4/3 md:aspect-21/9",
        layout === "wide" && "aspect-4/3 md:aspect-[2.6/1]",
        (layout === "offset-left" || layout === "offset-right") && "aspect-4/3 md:aspect-4/5",
        layout === "offset-right" && "md:ml-auto md:w-[90%]",
      )}
    >
      <img
        src={imageOverride ?? project.cover}
        alt={`${project.title} built in Minecraft`}
        loading="eager"
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );

  const award = isOrganicBuilds ? (
    <p className="mt-3 text-right text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase sm:text-xs">
      {awardLabel}
    </p>
  ) : null;

  const meta = (
    <div
      className={cn(
        "flex flex-col",
        layout === "offset-left" || layout === "offset-right"
          ? "justify-end gap-5 sm:gap-6"
          : "gap-5 pt-5 sm:gap-6 sm:pt-6 md:flex-row md:items-end md:justify-between",
      )}
    >
      <div className="min-w-0">
        {project.category && <p className="label-mono">{t(project.category)}</p>}
        <h3 className="display-lg mt-3 flex max-w-full items-start gap-2 break-words !text-[clamp(2rem,10vw,4rem)] md:gap-3 md:!text-[clamp(2rem,5.6vw,5rem)]">
          {project.title}
          <ArrowUpRight
            className="mt-1 h-5 w-5 shrink-0 opacity-70 transition-all duration-500 md:mt-2 md:h-7 md:w-7 md:-translate-x-2 md:opacity-0 md:group-hover:translate-x-0 md:group-hover:opacity-100"
            aria-hidden
          />
        </h3>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );

  if (layout === "offset-left" || layout === "offset-right") {
    return (
      <Link
        to="/work/$slug"
        params={{ slug: project.slug }}
        className="group grid items-stretch gap-6 sm:gap-8 md:grid-cols-12 md:gap-12"
      >
        <Reveal
          variant="mask"
          className={cn(
            "min-w-0 md:col-span-7",
            layout === "offset-right" && "md:order-2 md:col-start-6",
          )}
        >
          <Parallax strength={26}>{image}</Parallax>
          {award}
        </Reveal>
        <Reveal className={cn("min-w-0 md:col-span-4", layout === "offset-right" && "md:order-1")}>
          {meta}
        </Reveal>
      </Link>
    );
  }

  return (
    <Link to="/work/$slug" params={{ slug: project.slug }} className="group block min-w-0">
      <Reveal variant="mask">
        {image}
        {award}
      </Reveal>
      <Reveal delay={120}>{meta}</Reveal>
    </Link>
  );
}
