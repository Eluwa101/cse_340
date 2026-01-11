<!-- .github/copilot-instructions.md -->
# Copilot / AI Agent Instructions — cse_340

Purpose: concise, actionable guidance to help an AI coding agent be productive in this repo.

- Quick start:
  - Install deps: `pnpm install` (project expects PNPM; see README.md).
  - Dev server: `pnpm run dev` (runs `nodemon server.js`).
  - Prod start: `pnpm start` (runs `node server.js`).

- Big-picture architecture:
  - Single Express app entry: `server.js` — it requires `./routes/static` and mounts it with `app.use(static)`.
  - Static assets served from `public/` (subfolders: `css`, `js`, `images`, `site`, `upgrades`, `vehicles`).
  - Placeholder folders for layered code: `routes/`, `controllers/`, `models/`, `database/`, `views/` — expect add-ons to follow MVC-ish separation: routes -> controllers -> models -> database.
  - DB: `pg` is listed in `package.json`. Look for/implement a connection helper in `database/` and import it into `models/`.

- Project-specific conventions & patterns (explicit):
  - PNPM is the canonical package manager (README instructs `pnpm install`). Use it in examples and scripts.
  - Environment config: `dotenv` is used; `server.js` reads `process.env.PORT` and `process.env.HOST` from a `.env` file — do not hardcode these values.
  - Static routing pattern: `routes/static.js` registers express static middleware and maps `/css`, `/js`, `/images` to `public/*` subfolders. When adding static paths follow that same pattern.
  - Router modules: create routers in `routes/` and `module.exports = router`. Mount routers from `server.js` using `app.use('/prefix', require('./routes/yourRoute'))`.
  - File placement: put frontend assets under `public/`; server-side code goes under `controllers/`, `models/`, and DB helpers in `database/`.

- Examples (from this repo):
  - server boot: `app.use(require('./routes/static'))` then `app.listen(process.env.PORT)` (see `server.js`).
  - static routes: `router.use(express.static("public"))` and `router.use("/css", express.static(__dirname + "public/css"))` (see `routes/static.js`).

- Development & debugging notes:
  - Use `pnpm run dev` to run with `nodemon` for auto-restarts.
  - Check `.env` for `PORT`/`HOST` values; console logs in `server.js` print `app listening on HOST:PORT`.
  - Database work: no migrations or seeders present — when adding DB code, include a `database/connection.js` (or similar) that exports a `Pool` or client from `pg` and import it into `models/`.

- What to look for / merge guidance (if updating these instructions):
  - Preserve README's PNPM guidance and the `dev` script usage.
  - If adding route or DB scaffolding, reference the exact files: `server.js`, `routes/static.js`, `package.json`, and `database/`.

- Quick edit checklist for common tasks:
  - Add a new route: create `routes/foo.js` -> export router -> `app.use('/foo', require('./routes/foo'))` in `server.js`.
  - Add a controller: create `controllers/fooController.js` -> export functions -> require from `routes/foo.js`.
  - Add a model/db helper: create `database/connection.js` -> export `pg` Pool -> require from `models/fooModel.js`.

If any of these project conventions are incomplete or you want different conventions (for example different static paths or a DB migration strategy), ask the maintainers — I can adjust the instructions.
