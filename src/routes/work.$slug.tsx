import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Expand } from "lucide-react";

import { getProject, getProjectNeighbours } from "@/data/projects";
import { Reveal, RevealLines } from "@/components/site/reveal";
import { Parallax } from "@/components/site/parallax";
import { Lightbox } from "@/components/site/lightbox";
import { useT } from "@/i18n";

export const Route = createFileRoute("/work/$slug")({
  loader: ({ params }) => {
    const project = getProject(params.slug);
    if (!project) throw notFound();
    return { project, ...getProjectNeighbours(params.slug) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Project not found — Illegal Caffeine - Designer -" },
          { name: "robots", content: "noindex" }],
      };
    }
    const { project } = loaderData;
    const title = `${project.title} — Illegal Caffeine - Designer -`;
    const description = project.description[0] ?? project.title;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ProjectPage,
});

function ProjectPage() {
  const t = useT();
  const { project, prev, next } = Route.useLoaderData();
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <>
      <section className="relative flex min-h-[80svh] items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={project.cover}
            alt={`${project.title} built in Minecraft`}
            loading="eager"
            className="hero-scale h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-background/20" />
        <div className="relative mx-auto w-full max-w-[1600px] px-5 pb-14 md:px-10 md:pb-20">
          <Link to="/work" className="label-mono inline-flex items-center gap-2 hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> {t("All work")}
          </Link>
          {project.category && (
            <p className="label-mono mt-8 text-foreground">{t(project.category)}</p>
          )}
          <RevealLines immediate className="display-xl mt-4" lines={[project.title]} />
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 py-16 md:px-10 md:py-24">
        <div className="grid gap-10 md:grid-cols-12 md:gap-16">
          <Reveal className="md:col-span-7 md:col-start-6 space-y-5">
            {project.description.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="body-lg">
                {t(paragraph)}
              </p>
            ))}
          </Reveal>
        </div>
      </section>


      <section className="border-t border-border">
        <div className="mx-auto max-w-[1600px] px-5 py-14 md:px-10 md:py-20">
          <div className="flex items-end justify-between gap-6">
            <h2 className="label-mono text-foreground">{t("GALLERY")}</h2>
            <p className="label-mono">
              {String(project.gallery.length).padStart(2, "0")} {t("IMAGES")}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-6 md:gap-10">
            {project.gallery.map((image, i) => (
              <Reveal
                variant="mask"
                key={image.src + i}
                className={i % 3 === 1 ? "md:w-[72%] md:self-end" : ""}
              >
                <Parallax strength={i % 2 === 0 ? 20 : 32}>
                  <button
                    type="button"
                    onClick={() => setLightbox(i)}
                    className="zoom-frame group relative block w-full border border-border"
                    aria-label={`${t("Open image")}: ${t(image.caption)}`}
                  >
                    <img
                      src={image.src}
                      alt={t(image.caption)}
                      loading={i === 0 ? "eager" : "lazy"}
                      className="mx-auto block max-h-[80vh] w-full object-contain"
                    />

                    <span className="absolute right-3 bottom-3 flex h-11 w-11 items-center justify-center border border-border bg-background/70 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                      <Expand className="h-4 w-4" aria-hidden />
                    </span>
                  </button>
                </Parallax>
                <p className="label-mono mt-3">
                  {String(i + 1).padStart(2, "0")} / {t(image.caption)}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto grid max-w-[1600px] gap-px md:grid-cols-2">
          {prev && (
            <Link
              to="/work/$slug"
              params={{ slug: prev.slug }}
              className="group flex flex-col justify-between gap-6 border-b border-border p-5 py-10 md:border-r md:border-b-0 md:p-10"
            >
              <p className="label-mono inline-flex items-center gap-2">
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> {t("Previous")}
              </p>
              <h3 className="display-md text-muted-foreground transition-colors group-hover:text-foreground">
                {prev.title}
              </h3>
            </Link>
          )}
          {next && (
            <Link
              to="/work/$slug"
              params={{ slug: next.slug }}
              className="group flex flex-col items-end justify-between gap-6 p-5 py-10 md:p-10"
            >
              <p className="label-mono inline-flex items-center gap-2">
                {t("Next")} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </p>
              <h3 className="display-md text-right text-muted-foreground transition-colors group-hover:text-foreground">
                {next.title}
              </h3>
            </Link>
          )}
        </div>
      </section>

      <section className="border-t border-border bg-surface/40">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-8 px-5 py-20 md:flex-row md:items-end md:justify-between md:px-10 md:py-28">
          <RevealLines className="display-lg max-w-[18ch]" lines={[t("Want something like this?")]} />
          <Link
            to="/contact"
            className="label-mono inline-flex min-h-13 shrink-0 items-center gap-4 bg-foreground px-8 text-background transition-opacity hover:opacity-85"
          >
            {t("Start a Project")} <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>

      <Lightbox
        images={project.gallery}
        index={lightbox}
        onClose={() => setLightbox(null)}
        onIndexChange={setLightbox}
      />
    </>
  );
}
