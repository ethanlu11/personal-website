# Ethan Lu — personal website

My personal site: **[ethanlu.vercel.app](https://ethanlu.vercel.app)**

I'm a junior at NYU studying Business Technology Management, from Cebu, Philippines, and building in New York. The site is themed around that trip: a globe with a plane flying Cebu ↔ New York, portraits seen through airplane windows, and projects shown as boarding passes.

## Highlights

- **Interactive globe**: drawn on a canvas with no libraries. A plane flies the loop over Europe and the Pacific, the globe pauses on each landing, and you can drag it, hold to speed it up, or pick a speed.
- **Boarding-pass projects**: each project is a ticket with a route, the project's logo on the tail fin, and a tear-off stub.
- **Pull-cord theme switch**: pull the lamp cord (or press <kbd>D</kbd>) to switch between light and dark, with a click sound.
- **Chart-paper background**: a faint navigation grid that lights up under the cursor.
- **Details**: the name turns blue only when the cursor is on a letter, the nav shows where you are on the page, and Experience has Professional / Campus tabs.

## Built with

[Next.js](https://nextjs.org) 16 (App Router) · React 19 · TypeScript · [Tailwind CSS](https://tailwindcss.com) 4 · deployed on [Vercel](https://vercel.com)

## Editing the content

All of the site's text and links live in **[`content.ts`](content.ts)**: the hero photos, About, projects, experience, Currently, and contact links. Change that file and the page updates; the components shouldn't need touching.

| To change | Edit |
| --- | --- |
| Words, roles, projects, links | `content.ts` |
| Photos, logos, cover images | `public/photos`, `public/logos`, `public/covers` |
| Resume | replace `public/resume.pdf` |
| Globe pins | `globePins` in `content.ts` |
| Colors and fonts | the tokens at the top of `app/globals.css` |

## Project structure

```
app/
  page.tsx               the page: hero, sections, and footer
  layout.tsx             fonts, metadata, and the no-flash theme script
  globals.css            color tokens and the hand-built visual pieces
  opengraph-image.tsx    the link-preview image
  icon.svg               favicon
components/
  InteractiveGlobe.tsx   the canvas globe and flight
  HeroPhoto.tsx          portraits as airplane windows
  BoardingPass.tsx       project tickets
  ThemeCord.tsx          the pull cord
  ThemeToggle.tsx        footer System / Light / Dark switch and the D shortcut
  SiteNav.tsx            top bar with section links and breadcrumb
  ChartBackground.tsx    the grid background
  FitName.tsx            the edge-to-edge name
  Tabs.tsx, OrgLogo.tsx, SocialIcon.tsx, Mark.tsx, ExternalLink.tsx
lib/
  geo.ts                 simplified country outlines (Natural Earth)
  theme.ts, theme-client.ts   theme preference and switching
  click.ts               the synthesized switch click
content.ts               all site copy and links
public/                  photos, logos, covers, and the resume
```

`AGENTS.md` and `CLAUDE.md` are notes for AI coding tools; `next dev` keeps `AGENTS.md` up to date.

## Running locally

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build   # production build
```

## Deploying

The site is hosted on Vercel as the `personal-website` project, at `ethanlu.vercel.app`. Deploy the current code with:

```bash
vercel deploy --prod
```

## Credits

Country outlines are from [Natural Earth](https://www.naturalearthdata.com) (public domain). The pull cord and theme switch were inspired by [newa.sh](https://www.newa.sh).
