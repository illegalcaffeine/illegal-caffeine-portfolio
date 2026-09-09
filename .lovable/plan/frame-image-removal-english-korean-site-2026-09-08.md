# Frame image removal + English/Korean site

## 1. Previous Works — remove the framed black picture

The framed black picture is currently attached to the AUTUMN CANYON entry. Its original
canyon screenshot is still available, so:

- Point Autumn Canyon back to the original canyon image (cover and gallery, plus the
  place it appears alongside White Range).
- The framed image asset is no longer referenced anywhere and gets deleted.
- Everything else in Previous Works stays exactly as it is — same order, same sizes.

## 2. Language choice on first visit

- A full-screen overlay appears on the first visit to any page with two choices:
  ENGLISH and 한국어.
- The choice is remembered, so it is never asked again on later visits or page loads.
- The overlay only renders after the page loads in the browser, so nothing flashes or
  shifts and no page is blocked for search engines.
- A small EN / KO switch is added to the header (desktop and mobile menu), keeping the
  current header spacing and style.

## 3. Korean version of the site

- One site, one layout, same pages and links — only the wording changes.
- A single translation dictionary holds every visible English string with its Korean
  counterpart: navigation, buttons, headings, section text, About, Build Cycle,
  Payment, Contact form labels/placeholders/validation messages, the commission
  agreement sections, filter labels, footer, 404 text.
- Kept in English in both languages: all project titles (IMPERIAL CAPITAL, ORGANIC
  BUILDS, SPECIAL EFFECTS, NAGA, WATER ARCANA, KRAKEN HARBOR, etc.), the studio name,
  the email address, the Discord ID, and links.
- Project descriptions and image captions: Korean translations are added for these too
  so the Korean site reads naturally, while the titles stay English.
- Page titles and share descriptions follow the chosen language; the page's language
  attribute updates as well.

## Technical notes

- `src/i18n/` holds a `LanguageProvider` (context + `localStorage` key, default `en`),
  a `useT()` hook, and `en`/`ko` dictionaries typed off the English keys so a missing
  Korean string is a build error.
- Provider is mounted in `src/routes/__root.tsx` around the header/outlet; the
  first-visit overlay is a client-only component rendered there.
- `src/data/projects.ts` stays the single source of project data; localized copy is
  added as optional `description_ko` / caption fields on the same objects, keeping
  titles, slugs, filters, images and helpers untouched.
- Filter labels become dictionary keys resolved at render time; filter ids unchanged.
- No routing, styling, sizing, or responsive changes; Autumn Canyon's slug and route
  stay as they are.

## Verification

- Build passes; `/`, `/work`, a project page, `/contact`, `/payment` all load.
- Framed image gone from Previous Works; Autumn Canyon shows the canyon photo.
- Switching to Korean translates every visible section while project titles stay
  English; refresh keeps the language and does not re-ask.
