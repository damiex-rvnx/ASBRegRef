# ASBRegRef — Asbestos Threshold & Disposal Guide

A field reference for California asbestos thresholds, air-district notification
(SCAQMD / AVAQMD / VCAPCD), and disposal routing, used by project managers and
superintendents at **Kustom Ventura Division**.

**Live:** https://asbregulationref.vercel.app/

## What it is

A single self-contained **`index.html`** — no framework, no build step, no
bundler, no runtime dependencies. Supporting static files only:

- `sw.js` — offline service worker (cache-first)
- `manifest.webmanifest` — installable PWA
- `fonts/` — self-hosted Inter + JetBrains Mono (latin, woff2)
- `icons/`, `og.png` — app icons and share image

It installs as a PWA and works fully offline once loaded.

## Who it's for

PMs and superintendents in the field. It gets opened in crawlspaces, in
Kettleman City, and on the drive out — so it is built to work with no signal.

## Preview locally

The service worker and manifest need to be served over HTTP (not `file://`):

```
python3 -m http.server 8099
# then open http://localhost:8099/
```

Any static server works. Opening `index.html` directly mostly renders, but the
service worker and add-to-home-screen won't register.

## Deploy

Deployed on **Vercel** as a static site (no build command — Vercel serves the
repo root as-is). Pushing to the production branch triggers a deploy. GitHub
Pages is no longer used, so `.nojekyll` was removed; if a Pages mirror is ever
re-enabled, re-add an empty `.nojekyll` at the root.

When you change cached assets, bump `CACHE_VERSION` in `sw.js` so installed
clients pick up the update.

## Editing the regulatory content — read this first

The thresholds, fees, deadlines, and citations on this page are what people act
on. **Verify every regulatory figure against its primary source before changing
it — do not write a number from memory.** Primary sources:

- SCAQMD / AVAQMD **Rule 1403**; VCAPCD **Rule 62.7** and fee **Rule 45.2**
- Federal **Asbestos NESHAP** — 40 CFR 61 Subpart M (definitions §61.141,
  thresholds §61.145, disposal §61.150)
- Cal/OSHA — **8 CCR 1529** (construction) and **341.6–341.14** (registration)

Notes for editors:

- The **10-day disposal window is a Kustom SOP / facility practice, not a
  district rule** — it is labeled as such on the page; keep it that way unless
  the Kettleman Hills acceptance criteria are confirmed (see the `TODO` in the
  markup).
- **Fees change annually.** Confirm current amounts before editing them.
- Update **`Last verified:`** in the footer whenever you re-check the figures.

## Code structure

Everything lives in `index.html`: content, styles, and one small script. The JS
is intentionally a single `state` object with `render()` and `updateRoadmap()` —
keep that pattern; don't introduce modules, classes, a framework, or a build step.

## Planned (not built yet)

- **Protocol path.** A second view, reached from a top-level menu that toggles
  between a **Disposal path** (the current route map) and a **Protocol path**.
  The protocol view would map the work-practice requirements for a job —
  decontamination, plastic layering, equipment, and the asbestos work classes —
  with the map keyed to job type and friability. This is a future project; the
  current release ships the disposal path only.
