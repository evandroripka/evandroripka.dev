# Evandro Ripka Portfolio

React/Vite rebuild of the current portfolio home, transcribed from the legacy PHP, CSS and JavaScript source in `_legacy-source`.

## Stack

- React
- Vite
- GSAP
- Bulma
- PowerGlitch
- Node API base
- MySQL base with `admin_users`
- Dedicated MySQL project content base

## Current Scope

Only the existing home experience has been migrated so far:

- Cinematic hero with video background
- Fixed glass header and responsive menu
- About teaser
- Journey cinema slider
- Highlighted projects section

Future pages such as `/about`, `/projects`, Why me and Contact are intentionally not built yet.

## React Structure

```bash
src/
  components/
    layout/
    ui/
  data/
  hooks/
  pages/
  sections/
```

General home content lives in `src/data/siteContent.js`. Project cards are loaded from `/api/public/projects`, with the legacy project data kept as a frontend fallback. Reusable UI and animation behavior live in components/hooks rather than global DOM scripts.

## Commands

```bash
npm install
npm run dev
npm run api
npm run build
npm run lint
npm run import:legacy-projects
```

## Database

The staging auth database remains preserved as `evandroripka_staging_cms` with the reusable `admin_users` table.

Project content lives in `evandroripka_projects_cms`, accessed by its own limited MySQL user. The schema is in `database/mysql/projects.sql`, and legacy portfolio project data can be reimported with:

```bash
npm run import:legacy-projects
```

The Node API lives in `api/`, reads local secrets from ignored `api/config.local.json`, and is served in staging by `staging-api.service` behind the `/api/` Nginx proxy.
