import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

import { featuredProjects } from "@/data/projects";
import { ProjectPreview } from "@/components/site/project-preview";
import { Reveal, RevealLines } from "@/components/site/reveal";
import { Parallax } from "@/components/site/parallax";
import { SectionNav, type SectionNavItem } from "@/components/site/section-nav";

import { cn } from "@/lib/utils";
import { useLanguage, useT } from "@/i18n";

import heroImage from "@/assets/local/imperial-capital.png";
import disciplineSpawn from "@/assets/local/blossom-cathedral.png";
import disciplineCity from "@/assets/local/autumn-canyon.png";
import disciplineFantasy from "@/assets/local/imperial-capital.png";
import disciplineTerrain from "@/assets/local/white-range.png";
import disciplineCustom from "@/assets/local/celestial-effigy.jpg";
import streamerServers from "@/assets/local/streamer-servers.png";
import profileImage from "@/assets/local/profile.png";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Illegal Caffeine - Designer - — Minecraft Building & Worldbuilding" },
      {
        name: "description",
        content:
          "Independent Minecraft building and worldbuilding studio. Custom server spawns, cities, fantasy worlds, terrain and environments, built on commission.",
      },
      {
        property: "og:title",
        content: "Illegal Caffeine - Designer - — Minecraft Building & Worldbuilding",
      },
      {
        property: "og:description",
        content:
          "Custom Minecraft architecture, environments and complete worlds for servers, creators and studios.",
      },
    ],
  }),
  component: HomePage,
});

const disciplines: { label: string; note: string; image?: string }[] = [
  {
    label: "Server Spawns & Hubs",
    note: "Arrival, wayfinding, first impression.",
    image: disciplineSpawn,
  },
  {
    label: "Cities & Towns",
    note: "Street grids, districts, density.",
    image: disciplineCity,
  },
  {
    label: "Fantasy Worlds",
    note: "Monuments, kingdoms, invented cultures.",
    image: disciplineFantasy,
  },
  {
    label: "Terrain & Environments",
    note: "BUILT LIKE NOTHING YOU'VE SEEN BEFORE.",
    image: disciplineTerrain,
  },
  
  {
    label: "Streamer Servers",
    note: "BUILT LIKE NOTHING YOU'VE SEEN BEFORE.",
    image: streamerServers,
  },
];


const cycle = [
  {
    title: "Brief",
    body: "We agree on purpose, references, scale and constraints before a block is placed.",
  },
  {
    title: "Concept / Blockout",
    body: "Massing, silhouettes and circulation.",
  },
  {
    title: "Build",
    body: "Palette locked, structure detailed, the world built out region by region.",
  },
  {
    title: "Detail & Revision",
    body: "Planting, lighting, interiors and the small passes that make it feel inhabited.",
  },
  {
    title: "Delivery",
    body: "Schematics or world files handed over.",
  },
];

const sectionNavItems: SectionNavItem[] = [
  { id: "hero", label: "Intro" },
  { id: "studio", label: "Studio" },
  { id: "selected-work", label: "Selected work" },
  { id: "what-we-build", label: "What we build" },
  { id: "build-cycle", label: "Build cycle" },
  { id: "about", label: "About" },
  { id: "start-a-project", label: "Start a project" },
];

function HomePage() {
  const t = useT();
  const navItems = sectionNavItems.map((item) => ({ ...item, label: t(item.label) }));
  return (
    <>
      <SectionNav items={navItems} />
      <Hero />
      <Intro />
      <SelectedWork />
      <WhatWeBuild />
      <BuildCycle />
      <About />
      <FinalCta />
    </>
  );
}

function Hero() {
  const t = useT();
  const { lang } = useLanguage();
  return (
    <div className="relative">
      <section id="hero" className="relative flex min-h-[100svh] items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Monumental fantasy city built in Minecraft, terraced around a colossal seated figure"
            className="hero-scale h-full w-full object-cover"
            width={1920}
            height={1200}
          />
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/55 to-background/25" />
        </div>

        <div className="relative mx-auto w-full max-w-[1600px] px-5 pb-16 md:px-10 md:pb-20">

          {lang === "en" && (
            <RevealLines
              immediate
              className="display-md max-w-[22ch] !translate-y-[350px] text-foreground/70"
              lineTextClassName="!translate-y-[40px]"
              lines={["One of the best builders"]}
              stagger={180}
            />
          )}

          <p className={cn("body-lg max-w-md !translate-y-[255px]", lang === "en" ? "mt-6" : "mt-0")}>
            {t("Minecraft Builds · Worlds · Commissions")}
          </p>

          <div className="mt-10 flex flex-col !translate-y-[115px] gap-3 sm:flex-row">
            <a
              href="#selected-work"
              className="label-mono inline-flex min-h-12 items-center justify-center gap-3 bg-foreground px-7 text-background transition-opacity hover:opacity-85"
            >
              {t("View Work")} <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
            <Link
              to="/contact"
              className="label-mono inline-flex min-h-12 items-center justify-center border border-border-strong px-7 text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              {t("Start a Project")}
            </Link>
          </div>

          <div className="mt-12 flex !-translate-y-[40px] flex-col items-center text-center sm:mt-16">
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border border-border-strong bg-surface md:h-28 md:w-28">
              <img
                src={profileImage}
                alt="Illegal Caffeine — builder portrait"
                className="h-full w-full object-cover [object-position:center] [image-rendering:pixelated] scale-[1.6] origin-center"
                width={320}
                height={320}
              />
            </div>
            <div className="mt-4 space-y-1">
              <p className="label-mono text-foreground">ILLEGAL CAFFEINE - DESIGNER -</p>
              <p className="label-mono">
                DISCORD <span className="text-foreground">illcaffeine</span>
              </p>
              <a
                href="mailto:illegalcaffeine@gmail.com"
                className="label-mono block transition-colors hover:text-foreground"
              >
                EMAIL <span className="text-foreground">illegalcaffeine@gmail.com</span>
              </a>
            </div>
          </div>
        </div>

        <div className="absolute right-5 bottom-16 hidden flex-col items-center gap-3 md:right-10 md:flex">
          <span className="label-mono [writing-mode:vertical-rl]">scroll</span>
          <span className="h-16 w-px bg-border-strong" />
        </div>
      </section>
    </div>
  );
}

function Intro() {
  const t = useT();
  return (
    <section id="studio" className="scroll-mt-20 mx-auto max-w-[1600px] px-5 py-20 md:px-10 md:py-32">
      <div className="grid gap-10 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-7">
          <RevealLines
            className="display-lg"
            lines={[t("you just found"), t("the hidden gem")]}
          />
        </div>
        <Reveal className="md:col-span-5 md:pt-4" delay={200}>
          <p className="body-lg">
            {t(
              "I build custom Minecraft architecture, environments and complete worlds on commission — for servers, creators and individuals that need a place, not a pile of blocks.",
            )}
          </p>
          <dl className="mt-10 grid grid-cols-2 gap-y-4 border-t border-border pt-6">
            <dt className="label-mono">{t("Edition")}</dt>
            <dd className="label-mono text-foreground">{t("JAVA")}</dd>
            <dt className="label-mono">{t("Commissions")}</dt>
            <dd className="label-mono text-foreground">{t("OPEN")}</dd>
          </dl>
        </Reveal>
      </div>
    </section>
  );
}

function SelectedWork() {
  const t = useT();
  const [first, second, third] = featuredProjects;

  return (
    <section id="selected-work" className="scroll-mt-20 border-t border-border">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <div className="flex items-end justify-between gap-6 py-10 md:py-14">
          <h2 className="label-mono text-foreground">{t("SELECTED WORK")}</h2>
        </div>


        <div className="flex flex-col gap-20 pb-20 md:gap-28 md:pb-28">
          {first && <ProjectPreview project={first} layout="full" eager />}
          {second && <ProjectPreview project={second} layout="offset-right" />}
          {third && <ProjectPreview project={third} layout="wide" />}
        </div>

        <div className="border-t border-border py-10 md:py-14">
          <Link
            to="/work"
            className="group inline-flex items-center gap-4 label-mono text-foreground"
          >
            {t("View all previous works")}
            <span className="h-px w-12 bg-border-strong transition-all duration-500 group-hover:w-20" />
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}

function WhatWeBuild() {
  const t = useT();
  const [active, setActive] = useState(0);
  const current = disciplines[active] ?? disciplines[0]!;

  return (
    <section id="what-we-build" className="scroll-mt-20 border-t border-border bg-surface/40">
      <div className="mx-auto max-w-[1600px] px-5 py-20 md:px-10 md:py-32">
        <h2 className="label-mono text-foreground">{t("WHAT WE BUILD")}</h2>

        <div className="mt-10 grid gap-10 md:grid-cols-12 md:gap-16">
          <Reveal variant="mask" className="md:col-span-6 md:order-2">
            {current.image ? (
              <div
                key={current.label}
                className="relative aspect-4/3 animate-fade-in border border-border bg-surface"
              >
                <img
                  src={current.image}
                  alt={`${current.label} built in Minecraft`}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-4/3 border border-border" />
            )}

          </Reveal>

          <div className="md:col-span-6 md:order-1">
            <ul className="border-t border-border">
              {disciplines.map((d, i) => (
                <li key={d.label} className="border-b border-border">
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={() => setActive(i)}
                    aria-pressed={i === active}
                    className="flex w-full items-baseline gap-5 py-6 text-left md:py-8"
                  >
                    <span className="label-mono w-8 shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={cn(
                        "display-md text-[25px] transition-colors duration-500",
                        i === active ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {t(d.label)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function BuildCycle() {
  const t = useT();
  return (
    <section id="build-cycle" className="scroll-mt-20 border-t border-border">
      <div className="mx-auto max-w-[1600px] px-5 py-20 md:px-10 md:py-32">
        <h2 className="label-mono text-foreground">{t("THE BUILD CYCLE")}</h2>

        <div className="mt-12 md:col-span-8 md:col-start-5">
          {cycle.map((c) => (
            <Reveal
              key={c.title}
              className="border-t border-border py-10 md:py-14"
            >
              <h3 className="display-md text-[30px]">{t(c.title)}</h3>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
                {t(c.body)}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  const t = useT();
  return (
    <section id="about" className="scroll-mt-20 border-t border-border">
      <div className="mx-auto max-w-[1600px] px-5 py-20 md:px-10 md:py-32">
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-6">
            <p className="label-mono leading-[16px]"></p>
            <RevealLines
              className="display-lg mt-6"
              lineTextClassName={(index) =>
                index === 0 ? "!text-[45px] !leading-[65px]" : "!text-[60px] !leading-[65px]"
              }
              lines={[t("Not just blocks."), t("Places with identity.")]}
            />
            <Reveal delay={160} className="mt-8 max-w-lg space-y-5">
              <p className="body-lg">
                {t(
                  "Every commission starts with the same questions: where does the player stand, what do they see first, and what does this place tell them about the world it belongs to. Environment, silhouette and storytelling are handled as one problem — which is why the builds hold up in screenshots and in play.",
                )}
              </p>
            </Reveal>
          </div>
          <Reveal variant="mask" className="md:col-span-6">
            <Parallax strength={30}>
              <div className="zoom-frame relative aspect-4/5 border border-border bg-surface">
                <img
                  src={disciplineCustom}
                  alt="Detailed ceremonial Minecraft sculpture study"
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            </Parallax>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  const t = useT();
  return (
    <section id="start-a-project" className="relative scroll-mt-20 overflow-hidden border-t border-border">
      <img
        src={disciplineTerrain}
        alt="Hand-sculpted Minecraft mountain range"
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-25"
      />
      <div className="absolute inset-0 bg-linear-to-b from-background/70 via-background/80 to-background" />
      <div className="relative mx-auto max-w-[1600px] px-5 py-28 md:px-10 md:py-48">
        <RevealLines
          className="display-xl max-w-[16ch] [&>span:first-child]:![transform:translateY(-10px)] [&>span:first-child]:!translate-y-[10px] [&>span:first-child>span]:![transform:translateY(8px)]"
          lineTextClassName={(index) =>
            index === 0 ? "!text-[60px] !leading-[65px]" : "!text-[60px] !leading-[80px]"
          }
          lines={[t("Have a world in mind?"), t("Let's build it.")]}
        />
        <Reveal delay={160} className="mt-6 max-w-2xl">
          <p className="body-lg">
            {t(
              "\u00a0I work comfortably at every scale — from focused builds to massive, fully realized openworlds.",
            )}
          </p>
        </Reveal>
        <Reveal delay={200} className="mt-12">
          <Link
            to="/contact"
            className="label-mono inline-flex min-h-13 items-center gap-4 bg-foreground px-8 text-background transition-opacity hover:opacity-85"
          >
            {t("Start a Project")} <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
