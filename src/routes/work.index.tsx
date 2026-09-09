import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { projects, workFilters, type ProjectFilter } from "@/data/projects";
import { Reveal } from "@/components/site/reveal";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";

export const Route = createFileRoute("/work/")({
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
        content:
          "Previous Minecraft commissions: spawns, cities, fantasy worlds and terrain.",
      },
    ],
  }),
  component: WorkPage,
});

/**
 * Tiles are derived one-per-project so an image can never be paired with
 * another project's title or link: title, category and slug all come from the
 * same project object, and each tile is keyed by that project's slug.
 */
function WorkPage() {
  const t = useT();
  const [filter, setFilter] = useState<"all" | ProjectFilter>("all");
  /** Natural aspect ratios, measured on load, so nothing is cropped. */
  const [ratios, setRatios] = useState<Record<string, number>>({});

  const visible = useMemo(
    () => (filter === "all" ? projects : projects.filter((p) => p.filter === filter)),
    [filter],
  );

  return (
    <>
      <section className="border-b border-border px-5 pt-32 pb-10 md:px-10 md:pt-48 md:pb-14">
        <div className="mx-auto max-w-[1600px]">
          <p className="label-mono">{t("ARCHIVE")}</p>
          <h1 className="display-xl mt-6">{t("Previous Works")}</h1>
        </div>
      </section>

      <section className="sticky top-16 z-40 border-b border-border bg-background/92 backdrop-blur-sm md:top-20">
        <div className="mx-auto max-w-[1600px] px-5 md:px-10">
          <div
            className="-mx-5 flex gap-1 overflow-x-auto px-5 py-3 md:mx-0 md:px-0"
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

      <section className="mx-auto max-w-[1600px] px-10 py-6 md:py-8">
        <div className="flex flex-wrap gap-1">
          {visible.map((project, i) => {
            const ratio = ratios[project.slug] ?? 3 / 2;
            /** Weight breaks the equal-size rhythm: feature, wide, standard, small. */
            const weight = i % 7 === 0 ? 1.9 : i % 5 === 0 ? 1.5 : i % 3 === 1 ? 0.78 : 1;
            const basis = ratio * weight * 240;

            return (
              <Link
                key={project.slug}
                to="/work/$slug"
                params={{ slug: project.slug }}
                aria-label={project.title}
                style={{ flexGrow: ratio * weight, flexBasis: `${basis}px` }}
                className="group animate-fade-in relative block min-w-[45%] overflow-hidden bg-surface md:min-w-[220px]"
              >
                <img
                  src={project.cover}
                  alt={`${project.title} built in Minecraft`}
                  loading={i < 4 ? "eager" : "lazy"}
                  onLoad={(event) => {
                    const el = event.currentTarget;
                    if (!el.naturalHeight) return;
                    const next = el.naturalWidth / el.naturalHeight;
                    setRatios((prev) =>
                      prev[project.slug] === next ? prev : { ...prev, [project.slug]: next },
                    );
                  }}
                  className="block h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-background/85 to-transparent p-3 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <span className="label-mono text-foreground">{project.title}</span>
                  {project.category && (
                    <span className="label-mono mt-1 block">{t(project.category)}</span>
                  )}
                </span>
              </Link>
            );
          })}
        </div>

        {visible.length === 0 && (
          <Reveal className="border border-border p-10 text-center">
            <p className="label-mono">{t("NO PROJECTS IN THIS CATEGORY YET")}</p>
          </Reveal>
        )}
      </section>
    </>
  );
}
