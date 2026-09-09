/**
 * CENTRAL PROJECT DATA
 * ---------------------------------------------------------------------------
 * Everything the site shows about work lives here. To add or replace a
 * project: drop new images in src/assets, import them below, and edit or add
 * an entry in the `projects` array. No layout changes are ever needed.
 *
 * Only real, uploaded Minecraft imagery is referenced here.
 * `filter` must be one of the categories in `workFilters`.
 */

import imperialCapital from "@/assets/local/imperial-capital.png";
import celestialEffigy from "@/assets/local/celestial-effigy.jpg";
import voidTerrain from "@/assets/local/void-terrain.png";

import ravenColossus from "@/assets/local/raven-colossus.png";
import creatureMaw from "@/assets/local/creature-maw.png";
import glassArcana from "@/assets/local/glass-arcana.png";
import cloudPavilion from "@/assets/local/cloud-pavilion.png";
import gothicMassif from "@/assets/local/gothic-massif.png";
import leviathanHarbour from "@/assets/local/leviathan-harbour.png";
import whiteRange from "@/assets/local/white-range.png";
import autumnCanyon from "@/assets/local/autumn-canyon.png";
import blossomCathedral from "@/assets/local/blossom-cathedral.png";
import streamerServers from "@/assets/local/streamer-servers.png";

export type ProjectFilter =
  | "spawns"
  | "cities"
  | "fantasy"
  | "terrain"
  | "commissions";

export type Project = {
  slug: string;
  title: string;
  /** Optional small category label. */
  category?: string;
  filter: ProjectFilter;
  description: string[];
  cover: string;
  gallery: { src: string; caption: string }[];
};

export const workFilters: { id: "all" | ProjectFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "spawns", label: "Spawns" },
  { id: "cities", label: "Cities" },
  { id: "fantasy", label: "Fantasy" },
  { id: "terrain", label: "Terrain" },
  { id: "commissions", label: "Streamer Servers" },
];

export const projects: Project[] = [
  {
    slug: "imperial-capital",
    title: "Imperial Capital",
    category: "\u00a0Fantasy City",
    filter: "fantasy",
    description: [
      "Imperial Capital was built as the first thing a player sees and the last thing they forget. The city climbs a carved massif in tiers, so every street reveals a new silhouette instead of a flat skyline.",
      "The monument at the centre sets the scale for everything else: rooflines, stair widths and tree canopies were all sized against it so the city reads as inhabited rather than decorative.",
      "Palette work is deliberately narrow — oxidised copper, bone stone, and warm autumn canopy — so screenshots stay readable at any render distance.",
    ],
    cover: imperialCapital,
    gallery: [
      { src: imperialCapital, caption: "Upper terraces and the seated monument" },
      { src: celestialEffigy, caption: "Ceremonial effigy — district landmark" },
    ],
  },
  {
    slug: "celestial-palace",
    title: "ORGANIC BUILDS",
    category: "\u00a0professional",
    filter: "fantasy",
    description: [
      "Backed by a background in Fine Art and three-dimensional art, I specialize in translating organic, sculptural forms into Minecraft — from anatomy and creatures to complex natural structures.",
      "Featured work: award winner at the KIBO COMPETITION.",
    ],
    cover: celestialEffigy,
    gallery: [
      { src: celestialEffigy, caption: "kibo 2025 competition build" },
      { src: ravenColossus, caption: "Sculptural raid map" },
    ],
  },
  {
    slug: "grand-central",
    title: "SPECIAL EFFECTS",
    category: "\u00a0experimental,player-scaled",
    filter: "cities",
    description: [
      "Specialized in creating visual effects directly in Minecraft — transforming particles, motion, lighting, environmental effects and unconventional blockwork into cinematic scenes and immersive visual experiences.",
      "The goal is not decoration but atmosphere: each effect is tuned to support the story of the space around it.",
    ],
    cover: voidTerrain,
    gallery: [
      { src: voidTerrain, caption: "Effect study in open sky" },
      { src: glassArcana, caption: "Block-built effect composition" },
    ],
  },
  {
    slug: "blossom-cathedral",
    title: "Blossom Cathedral",
    category: "Server Spawn",
    filter: "spawns",
    description: [
      "An arrival space built to be recognisable in one screenshot: layered spires, gilded tracery and turquoise roofing under enormous purple canopies.",
      "The central axis and open forecourt give players an obvious place to stand and an obvious direction to walk, with the flanking wings reading as separate destinations.",
    ],
    cover: blossomCathedral,
    gallery: [
      { src: blossomCathedral, caption: "Full complex beneath the blossom canopies" },
      { src: gothicMassif, caption: "Related monumental architecture" },
    ],
  },
  {
    slug: "raven-colossus",
    title: "Raven Colossus",
    category: "Streamer Server",
    filter: "commissions",
    description: [
      "A colossal raven-like figure standing on a stepped plateau, wrapped in wide sweeping black arcs that read as wings, wind and motion at once.",
      "Built from anatomy outward — mass, weight and gesture first, surface detail last — so the silhouette holds from far render distance and still resolves up close.",
    ],
    cover: ravenColossus,
    gallery: [
      { src: ravenColossus, caption: "Full figure and sweeping arc forms" },
      { src: creatureMaw, caption: "Related creature study" },
    ],
  },
  {
    slug: "creature-maw",
    title: "Naga",
    category: "Streamer Server",
    filter: "commissions",
    description: [
      "The figure breaks the treeline: jaws open, body carved in mossed stone, canopy pushed up against it so scale registers immediately.",
      "Non-architectural forms like this are where blockwork is hardest — every curve is resolved by hand, and the planting frames the head rather than hiding the body.",
    ],
    cover: creatureMaw,
    gallery: [
      { src: creatureMaw, caption: "Head and upper body above the treeline" },
      { src: ravenColossus, caption: "Companion sculptural build" },
    ],
  },
  {
    slug: "glass-arcana",
    title: "Water Arcana",
    category: "Streamer Server",
    filter: "commissions",
    description: [
      "A visual-effects piece built entirely from blocks: translucent glass masses, blue currents and sharp yellow and pink accents spiralling out of a small central statue.",
      "The composition works as motion frozen mid-frame — density, transparency and colour are tuned so the eye returns to the figure holding the lantern.",
    ],
    cover: glassArcana,
    gallery: [
      { src: glassArcana, caption: "Full composition around the central figure" },
      { src: voidTerrain, caption: "Effect work from the same series" },
    ],
  },
  {
    slug: "streamer-servers",
    title: "Streamer Server World",
    category: "Streamer Server",
    filter: "commissions",
    description: [
      "A complete streamer world: a monumental golden tree at the centre, settlement architecture spreading across rocky terrain, surrounding forest, and a large dark structure suspended above it all.",
      "Built so the map reads on stream — clear landmarks, obvious routes between districts, and one silhouette that identifies the server instantly.",
    ],
    cover: streamerServers,
    gallery: [
      { src: streamerServers, caption: "Golden tree, settlement and floating structure" },
    ],
  },
  {
    slug: "goblin-village",
    title: "Goblin Village",
    category: "Fantasy Architecture",
    filter: "fantasy",
    description: [
      "Heavy timber framing, a deep sweeping roof and carved white cloud forms wrapping the structure, set into forested terrain with mountains behind.",
      "Building and landscape were designed together: the terrain carries the approach, the clouds carry the roofline, and lanterns mark the path through the lower colonnade.",
    ],
    cover: cloudPavilion,
    gallery: [
      { src: cloudPavilion, caption: "Front elevation with cloud forms" },
      { src: gothicMassif, caption: "Fantasy architecture from the same body of work" },
    ],
  },
  {
    slug: "gothic-massif",
    title: "Gothic Massif",
    category: "Fantasy Architecture",
    filter: "fantasy",
    description: [
      "Spires, buttresses and rose windows grow directly out of a carved pale massif, so the architecture reads as part of the mountain rather than placed on it.",
      "The scene is composed for distance: a dominant spire, a secondary complex on the far ridge, and a forest floor that keeps the eye travelling between them.",
    ],
    cover: gothicMassif,
    gallery: [
      { src: gothicMassif, caption: "Cathedral complex and carved massif" },
      { src: cloudPavilion, caption: "Goblin village elsewhere in the world" },
    ],
  },
  {
    slug: "craken-harbor",
    title: "Kraken Harbor",
    category: "Fantasy World",
    filter: "fantasy",
    description: [
      "A harbour caught mid-catastrophe: turquoise limbs arc across the frame while dark rigging, chains and shattered hulls hold the background.",
      "Creature and architecture are built as one composition — the tentacles set the diagonals, and the maritime structures were massed afterwards to sit inside them.",
    ],
    cover: leviathanHarbour,
    gallery: [
      { src: leviathanHarbour, caption: "Tentacles and wrecked maritime structures" },
      { src: gothicMassif, caption: "Monumental architecture from the same world" },
    ],
  },
  {
    slug: "white-range",
    title: "White Range",
    category: "Terrain / Environment",
    filter: "terrain",
    description: [
      "Ridge lines were shaped first to frame two viewpoints, then cliff striation, scree and moss were layered in to give the stone grain and altitude.",
      "Terraced shelves step down to the water so the range reads as inhabitable terrain rather than a wall of rock.",
    ],
    cover: whiteRange,
    gallery: [
      { src: whiteRange, caption: "Range and shoreline terraces" },
      { src: autumnCanyon, caption: "Canyon environment from the same terrain work" },
    ],
  },
  {
    slug: "autumn-canyon",
    title: "Autumn Canyon",
    category: "Terrain / Environment",
    filter: "terrain",
    description: [
      "The canyon walls do the framing: buildings are hung off the cliff faces and a windmill sits at the pinch point so the settlement is discovered rather than displayed.",
      "Planting is a single warm autumn band, which keeps the pale stone readable and gives the depth of the gorge somewhere to fade into.",
    ],
    cover: autumnCanyon,
    gallery: [
      { src: autumnCanyon, caption: "Canyon settlement and windmill" },
      { src: whiteRange, caption: "Sculpted range nearby" },
    ],
  },
];

/**
 * PAYMENT INFORMATION
 * ---------------------------------------------------------------------------
 * Informational only. The site does not process payments directly.
 */
export const paymentInfo = {
  title: "Payment",
  provider: "PayPal",
  heading: "PAYMENT VIA PAYPAL",
  description:
    "Payments for commissions are handled through PayPal. This website does not process payments directly.",
};

export const featuredProjects = projects.slice(0, 3);

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function getProjectNeighbours(slug: string) {
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) return { prev: undefined, next: undefined };
  return {
    prev: projects[(index - 1 + projects.length) % projects.length],
    next: projects[(index + 1) % projects.length],
  };
}
