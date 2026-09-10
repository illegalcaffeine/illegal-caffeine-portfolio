import { createFileRoute, Link } from "@tanstack/react-router";
import {
  cloneElement,
  type ImgHTMLAttributes,
  type ReactElement,
  type SyntheticEvent,
  useState,
} from "react";

import { workFilters, type ProjectFilter } from "@/data/projects";
import { fetchPublishedPortfolioProjects, type DisplayProject } from "@/data/portfolio-cms";
import { Reveal } from "@/components/site/reveal";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";

export const Route = createFileRoute("/work/")({
  loader: () => fetchPublishedPortfolioProjects(),
  head: () => ({
    meta: [
      { title: "Previous Works — Illegal Caffeine - Designer -" },
      {
        name: "description",
        content:
          "Previous Minecraft commissions: server spawns, cities, fantasy worlds and custom terrain built by Illegal Caffeine - Designer -.",
      },
      { property: "og:title", content: "Previous Works — Illegal Caffeine - Designer -" },
      {
        property: "og:description",
        content: "Previous Minecraft commissions: spawns, cities, fantasy worlds and terrain.",
      },
    ],
  }),
  component: WorkPage,
});

type ActiveFilter = "all" | ProjectFilter;

type ArchiveTileProps = {
  project: DisplayProject;
  weight?: number;
  eager?: boolean;
  children: ReactElement<ImgHTMLAttributes<HTMLImageElement>>;
};

const archiveWeights: Record<string, number> = {
  "blossom-cathedral": 1.9,
  "grand-central": 0.78,
  "imperial-capital": 1.5,
  "raven-colossus": 0.78,
  "glass-arcana": 1.5,
  "gothic-massif": 0.78,
  "white-range": 1.5,
  "autumn-canyon": 0.78,
  "streamer-servers": 1.9,
};

function ArchiveTile({ project, weight = 1, children }: ArchiveTileProps) {
  const [ratio, setRatio] = useState(3 / 2);
  const basis = ratio * weight * 240;

  const image = cloneElement(children, {
    alt: children.props.alt || `${project.title} built in Minecraft`,
    loading: "eager",
    onLoad: (event: SyntheticEvent<HTMLImageElement>) => {
      children.props.onLoad?.(event);
      const el = event.currentTarget;
      if (el.naturalHeight) setRatio(el.naturalWidth / el.naturalHeight);
    },
    className: cn(
      "block h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]",
      children.props.className,
    ),
  });

  return (
    <Link
      to="/work/$slug"
      params={{ slug: project.slug }}
      aria-label={project.title}
      style={{ flexGrow: ratio * weight, flexBasis: `${basis}px` }}
      className="group animate-fade-in relative block min-h-[220px] w-full min-w-0 overflow-hidden bg-surface sm:min-w-[45%] md:min-w-[220px]"
    >
      {image}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-background/85 to-transparent p-3 opacity-100 transition-opacity duration-500 md:opacity-0 md:group-hover:opacity-100">
        <span className="label-mono text-foreground">{project.title}</span>
      </span>
    </Link>
  );
}

function WorkPage() {
  const t = useT();
  const projects = Route.useLoaderData();
  const [filter, setFilter] = useState<ActiveFilter>("all");
  const visibleProjects = filter === "all" ? projects : projects.filter((project) => project.filter === filter);

  return (
    <>
      <section className="border-b border-border px-5 pt-28 pb-9 sm:pt-32 sm:pb-10 md:px-10 md:pt-48 md:pb-14">
        <div className="mx-auto max-w-[1600px]">
          <p className="label-mono">{t("\u00a0previous works")}</p>
          <h1 className="display-xl mt-5 !text-[clamp(2.5rem,12vw,3.75rem)] md:mt-6 md:!text-[60px]">{t("archive")}</h1>
        </div>
      </section>

      <section className="sticky top-16 z-40 border-b border-border bg-background/92 backdrop-blur-sm lg:top-20">
        <div className="mx-auto max-w-[1600px] px-5 md:px-10">
          <div
            className="-mx-5 flex gap-1 overflow-x-auto px-5 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:px-0"
            role="group"
            aria-label={t("Filter projects")}
          >
            {workFilters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-pressed={filter === f.id}
                className={cn(
                  "label-mono min-h-11 shrink-0 border px-4 transition-colors",
                  filter === f.id
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {t(f.label)}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 py-5 sm:px-6 md:px-10 md:py-8">
        {visibleProjects.length > 0 ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-1">
            {visibleProjects.map((project, index) => (
              <ArchiveTile
                key={project.slug}
                project={project}
                weight={archiveWeights[project.slug] ?? 1}
                eager={index < 3}
              >
                <img src={project.cover} />
              </ArchiveTile>
            ))}
          </div>
        ) : (
          <Reveal className="border border-border p-10 text-center">
            <p className="label-mono">{t("NO PROJECTS IN THIS CATEGORY YET")}</p>
          </Reveal>
        )}
      </section>
    </>
  );
}
