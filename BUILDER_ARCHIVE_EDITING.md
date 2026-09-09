# Builder archive image editing

The `/work` archive is intentionally written as explicit JSX cards instead of being generated from `projects.ts`.

Why: Builder Visual Editor can now target the literal `<img src="...">` belonging to each archive card. A visual image replacement is no longer fighting a `src={project.cover}` value supplied by a data map.

Each filter has an explicit `ArchiveCategory` block in `src/routes/work.index.tsx`:

- `spawns`
- `cities`
- `fantasy`
- `terrain`
- `commissions` = Streamer Servers

Streamer Servers currently has only `Streamer Server World`.

To add work later in Builder, duplicate an existing `ArchiveTile` inside the category you want, replace its image, and update its title/link. Because the image itself is literal JSX, image replacements can be applied back to source directly.

Local archive images are mirrored under `public/work/` so they can be referenced by simple URL strings such as `/work/example.png`. Builder-hosted CDN image URLs can also be written directly into the selected `<img>` element.

Project detail pages still use `src/data/projects.ts` for descriptions, hero images, galleries, and previous/next navigation. Add a matching project entry there when a newly added archive card should open a brand-new detail page.
