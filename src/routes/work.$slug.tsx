import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Expand } from "lucide-react";

import { fetchPublishedPortfolioProjectSet } from "@/data/portfolio-cms";
import { Reveal, RevealLines } from "@/components/site/reveal";
import { Parallax } from "@/components/site/parallax";
import { Lightbox } from "@/components/site/lightbox";
import { useLanguage, useT } from "@/i18n";

export const Route = createFileRoute("/work/$slug")({
  loader: async ({ params }) => {
    const result = await fetchPublishedPortfolioProjectSet(params.slug);
    if (!result.project) throw notFound();
    return result;
  },
  head: ({ loaderData }) => {
    if (!loaderData?.project) {
      return {
        meta: [
          { title: "Project not found — Illegal Caffeine - Designer -" },
          { name: "robots", content: "noindex" },
        ],
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
  const { lang } = useLanguage();
  const { project, prev, next } = Route.useLoaderData();
  const [lightbox, setLightbox] = useState<number | null>(null);

  const category =
    lang === "ko"
      ? project.categoryKo || (project.category ? t(project.category) : "")
      : project.category || "";
  const descriptions =
    lang === "ko" && project.descriptionKo?.length ? project.descriptionKo : project.description;
  const gallery = project.gallery.map((image) => ({
    src: image.src,
    caption: lang === "ko" ? image.captionKo || t(image.caption) : image.caption,
  }));
  const award = lang === "ko" ? project.awardKo : project.awardEn;

  return (
    <>
      <section className="relative flex min-h-[62svh] items-end overflow-hidden sm:min-h-[70svh] md:min-h-[80svh]">
        <div className="absolute inset-0">
          <img
            src={project.cover}
            alt={`${project.title} built in Minecraft`}
            loading="eager"
            className="hero-scale h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-background/20" />
        <div className="relative mx-auto w-full max-w-[1600px] px-5 pb-10 sm:pb-12 md:px-10 md:pb-20">
          <Link to="/work" className="label-mono inline-flex min-h-11 items-center gap-2 hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> {t("All work")}
          </Link>
          {category && project.category !== "Streamer Server" && (
            <p className="label-mono mt-5 text-foreground sm:mt-7 md:mt-8">{category}</p>
          )}
          <RevealLines
            immediate
            className="display-xl mt-3 max-w-[18ch] break-words !text-[clamp(2.4rem,12vw,5.5rem)] md:mt-4 md:!text-[clamp(3.5rem,8.4vw,8.5rem)]"
            lines={[project.title]}
          />
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 py-12 sm:py-14 md:px-10 md:py-24">
        <div className="grid gap-8 md:grid-cols-12 md:gap-16">
          <Reveal className="space-y-5 md:col-span-7 md:col-start-6">
            {descriptions.map((paragraph) => (
              <p key={paragraph.slice(0, 32)} className="body-lg">{paragraph}</p>
            ))}
            {award && (
              <p className="label-mono border-t border-border pt-5 text-foreground">{award}</p>
            )}
          </Reveal>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-[1600px] px-5 py-12 sm:py-14 md:px-10 md:py-20">
          <div className="flex items-end justify-between gap-6">
            <h2 className="label-mono text-foreground">{t("GALLERY")}</h2>
            <p className="label-mono">
              {String(gallery.length).padStart(2, "0")} {t("IMAGES")}
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-7 sm:mt-8 sm:gap-8 md:gap-10">
            {gallery.map((image, i) => (
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
                    aria-label={`${t("Open image")}: ${image.caption}`}
                  >
                    <img
                      src={image.src}
                      alt={image.caption}
                      loading="eager"
                      className="mx-auto block max-h-[80vh] w-full object-contain"
                    />
                    <span className="absolute right-2 bottom-2 flex h-10 w-10 items-center justify-center border border-border bg-background/70 opacity-100 transition-opacity duration-500 sm:right-3 sm:bottom-3 sm:h-11 sm:w-11 md:opacity-0 md:group-hover:opacity-100">
                      <Expand className="h-4 w-4" aria-hidden />
                    </span>
                  </button>
                </Parallax>
                <p className="label-mono mt-3 break-words">
                  {String(i + 1).padStart(2, "0")} / {image.caption}
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
              className="group flex min-w-0 flex-col justify-between gap-5 border-b border-border p-5 py-8 sm:py-10 md:border-r md:border-b-0 md:p-10"
            >
              <p className="label-mono inline-flex items-center gap-2">
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> {t("Previous")}
              </p>
              <h3 className="display-md break-words !text-[clamp(1.5rem,8vw,2.75rem)] text-muted-foreground transition-colors group-hover:text-foreground">
                {prev.title}
              </h3>
            </Link>
          )}
          {next && (
            <Link
              to="/work/$slug"
              params={{ slug: next.slug }}
              className="group flex min-w-0 flex-col items-end justify-between gap-5 p-5 py-8 sm:py-10 md:p-10"
            >
              <p className="label-mono inline-flex items-center gap-2">
                {t("Next")} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </p>
              <h3 className="display-md break-words !text-[clamp(1.5rem,8vw,2.75rem)] text-right text-muted-foreground transition-colors group-hover:text-foreground">
                {next.title}
              </h3>
            </Link>
          )}
        </div>
      </section>

      <section className="border-t border-border bg-surface/40">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-7 px-5 py-16 sm:py-20 md:flex-row md:items-end md:justify-between md:px-10 md:py-28">
          <RevealLines
            className="display-lg max-w-[18ch] !text-[clamp(2rem,10vw,4.25rem)] md:!text-[clamp(2rem,5.6vw,5rem)]"
            lines={[t("Want something like this?")]}
          />
          <Link
            to="/contact"
            className="label-mono inline-flex min-h-13 w-full shrink-0 items-center justify-center gap-4 bg-foreground px-8 text-background transition-opacity hover:opacity-85 sm:w-auto"
          >
            {t("Start a Project")} <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>

      <Lightbox
        images={gallery}
        index={lightbox}
        onClose={() => setLightbox(null)}
        onIndexChange={setLightbox}
      />
    </>
  );
}
