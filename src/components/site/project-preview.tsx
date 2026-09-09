import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/data/projects";
import { Reveal } from "@/components/site/reveal";
import { Parallax } from "@/components/site/parallax";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";

/**
 * Large editorial project preview. `layout` controls the composition so the
 * same data renders as a full-bleed, offset or split editorial block.
 * Project titles stay in English in every language.
 */
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
  const image = (
    <div
      className={cn(
        "zoom-frame relative border border-border bg-surface",
        layout === "full" && "aspect-4/3 md:aspect-21/9",
        layout === "wide" && "aspect-4/3 md:aspect-[2.6/1]",
        (layout === "offset-left" || layout === "offset-right") && "aspect-4/3 md:aspect-4/5",
        layout === "offset-right" ? "w-[90%] h-full ml-auto mr-0" : "w-full h-full",
      )}
    >
      <img
        src={imageOverride ?? project.cover}
        alt={`${project.title} built in Minecraft`}
        loading={eager ? "eager" : "lazy"}
        className="absolute inset-0 h-full object-cover w-full"
      />
    </div>
  );

  const meta = (
    <div
      className={cn(
        "flex flex-col",
        layout === "offset-left" || layout === "offset-right"
          ? "justify-end gap-6"
          : "gap-6 pt-6 md:flex-row md:items-end md:justify-between",
      )}
    >
      <div>
        {project.category && <p className="label-mono">{t(project.category)}</p>}
        <h3 className="display-lg mt-3 flex items-start gap-3">
          {project.title}
          <ArrowUpRight
            className="mt-2 h-5 w-5 shrink-0 -translate-x-2 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100 md:h-7 md:w-7"
            aria-hidden
          />
        </h3>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
          {t(project.description[0] ?? "")}
        </p>
      </div>
    </div>
  );

  if (layout === "offset-left" || layout === "offset-right") {
    return (
      <Link
        to="/work/$slug"
        params={{ slug: project.slug }}
        className="group grid items-stretch gap-8 md:grid-cols-12 md:gap-12"
      >
        <Reveal
          variant="mask"
          className={cn(
            "md:col-span-7",
            layout === "offset-right" && "md:order-2 md:col-start-6",
          )}
        >
          <Parallax strength={26}>{image}</Parallax>
        </Reveal>
        <Reveal className={cn("md:col-span-4", layout === "offset-right" && "md:order-1")}>
          {meta}
        </Reveal>
      </Link>
    );
  }

  return (
    <Link
      to="/work/$slug"
      params={{ slug: project.slug }}
      className="group block"
    >
      <Reveal variant="mask">{image}</Reveal>
      <Reveal delay={120}>{meta}</Reveal>
    </Link>
  );
}
