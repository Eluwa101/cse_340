# Copilot Instructions for CSE 340 Project

## Project Overview
This is a **CSE Motors automotive inventory management system** - an Express.js + EJS + PostgreSQL full-stack web application for displaying vehicles, reviews, and upgrades. It's a starter template for CSE 340 coursework that demonstrates backend-driven web applications with database integration.

**Tech Stack:**
- **Runtime:** Node.js with Express 4.x
- **View Engine:** EJS with express-ejs-layouts for template inheritance
- **Database:** PostgreSQL (Render hosted)
- **Package Manager:** PNPM (not npm)
- **Dev Tool:** Nodemon (auto-restart on file changes)

## Architecture & Key Components

### Server Structure (`server.js`)
- **Entry point** - Requires all dependencies (express, dotenv, express-ejs-layouts)
- **View engine setup:** EJS with layouts at `views/layouts/layout.ejs` (NOT in views root)
- **Routes:** Centralized route registration via `./routes/static`
- **Environment:** Uses `.env` file for PORT (5500), HOST (localhost), DATABASE_URL

### Routing Pattern (`routes/static.js`)
- **Static file serving** - Serves `public/` folder with explicit route handlers for `/css`, `/js`, `/images`
- **No dynamic routes yet** - Only static files; controllers/models folders are empty (awaiting implementation)

### View Structure (`views/`)
- **Layout inheritance:** `layouts/layout.ejs` wraps all pages with `<%- body %>` placeholder
- **Partials:** `layouts/partials/` contains reusable components:
  - `head.ejs` - Meta tags, stylesheets
  - `header.ejs` - Top section
  - `navigation.ejs` - Nav menu
  - `footer.ejs` - Footer
- **Pages:** `index.ejs` - Home page showing DMC Delorean vehicle, reviews, and upgrade gallery
- **EJS Syntax:** Use `<%- include() %>` for partials, `<%- body %>` for page content, `<%= title %>` for variable interpolation

### Database (`database/`)
- **Schema:** `db_rebuild_code.sql` - PostgreSQL DDL with:
  - `account_type` ENUM (client, employee, admin)
  - `classification` table - Vehicle categories
  - `inventory` table - Vehicle details (make, model, year, price, image paths, etc.)
- **Data file:** `inventory-data.txt` - Sample vehicle inventory for bulk inserts
- **Connection:** Uses `pg` package; DATABASE_URL stored in `.env` for Render PostgreSQL instance

## Developer Workflows

### Starting Development
```bash
pnpm install      # First time: install dependencies from pnpm-lock.yaml
pnpm run dev      # Start server with auto-restart (nodemon watches server.js and triggers reload)
```
Visit `http://localhost:5500` in browser. Serves `/public` static files; home route renders `index.ejs`.

### Adding Routes
1. Create route handler in `routes/static.js` (or new route file)
2. Register with `app.use(routePath)`
3. Return `res.render('viewName', { data })` to render EJS templates
4. Restart server (nodemon handles this automatically)

### Adding Views
1. Create `.ejs` file in `views/` (or subdirectory)
2. Views automatically inherit `layout.ejs` wrapper (via express-ejs-layouts configuration)
3. Use `<%- include('partials/componentName') %>` to include partials
4. Access route data via `<%= variableName %>`

### Database Queries
- Models folder is empty (not yet implemented) - will contain database query functions using `pg` package
- When implemented, models should use connection pooling and prepared statements
- Database queries will feed data to controllers, which render EJS views with data

## Project Conventions & Patterns

### File Organization
- **`public/`** - All static assets (CSS, JS, images) served directly; never require authentication
- **`views/`** - EJS templates; always follow `layouts/` hierarchy with partials
- **`database/`** - SQL DDL and seed data; schema uses snake_case (inv_id, classification_name)
- **`controllers/`** - Will contain route handler functions (currently empty)
- **`models/`** - Will contain database query functions (currently empty)
- **`routes/`** - Route definitions and middleware

### Naming Conventions
- **Database:** snake_case (inv_id, inv_make, classification_id, account_type)
- **File routes:** lowercase with hyphens (`static.js`, routes should match directory structure)
- **EJS files:** descriptive names in lowercase (index.ejs, layout.ejs, header.ejs)
- **JavaScript variables:** camelCase (port, host, DATABASE_URL from env)

### Environment Management
- `.env` file stores PORT, HOST, DATABASE_URL
- **Never commit `.env`** - only commit `.env.example` template if needed
- Uses `dotenv` package (`require('dotenv').config()`) to load variables into `process.env`
- Render.com PostgreSQL connection string included in `.env`

### Image Paths
- Vehicle images: `public/images/vehicles/` (e.g., delorean.jpg)
- Upgrade images: `public/images/upgrades/` (e.g., flux-cap.png)
- Site UI images: `public/images/site/` (e.g., own_today.png)
- Reference in views as `/images/vehicles/delorean.jpg` (absolute paths from public root)

### EJS Template Patterns
```ejs
<!-- Include partials -->
<%- include('partials/header') %>

<!-- Loop through data -->
<% vehicles.forEach(v => { %>
  <h2><%= v.inv_make %> <%= v.inv_model %></h2>
<% }) %>

<!-- Conditional rendering -->
<% if (user.account_type === 'admin') { %>
  <button>Edit Vehicle</button>
<% } %>
```

## Critical Dependencies & Integration Points

### Express Middleware Order (in `server.js`)
1. Load environment variables: `require('dotenv').config()`
2. Initialize Express app
3. Set view engine: `app.set('view engine', 'ejs')`
4. Use layout middleware: `app.use(expressLayouts)`
5. Set layout path: `app.set('layout', './layouts/layout')`
6. Register routes: `app.use(static)` and inline routes

### Database Connection (Future Implementation)
- Will use `pg` package (already in dependencies)
- Render PostgreSQL connection string: `postgresql://user:password@host/dbname`
- Recommend connection pooling with retry logic for production

### Static File Serving
- Routes in `static.js` explicitly define `/css`, `/js`, `/images` handlers
- `express.static()` serves files without compression; consider adding gzip for production

## Common Tasks & Patterns

### Add a New Page
1. Create `views/newpage.ejs` with EJS content
2. Create route in `routes/static.js`: `app.get('/newpage', (req, res) => res.render('newpage', {}))`
3. Reference in navigation via `header.ejs` or `navigation.ejs`

### Add Database Query
1. Create function in `models/VehicleModel.js` using `pg` package
2. Call from controller in `controllers/VehicleController.js`
3. Pass data to view: `res.render('inventory', { vehicles: data })`

### Style Updates
- Edit `public/css/styles.css`
- No build process; changes live-reload with nodemon server restart

### Add Environment Variable
1. Add to `.env` file (e.g., `API_KEY=value`)
2. Access in code: `process.env.API_KEY`
3. Restart server for changes to take effect

## Known Limitations & Future Work

- **Controllers & Models folders are empty** - Route handlers and database query functions need implementation
- **No authentication system yet** - Account types defined in DB schema but not implemented
- **No form handling** - No POST route middleware for vehicle updates or purchases
- **No error handling** - Add try-catch and error middleware to Express app
- **Static routes only** - Dynamic inventory retrieval from DB pending

---

**Last Updated:** January 18, 2026
**Status:** Starter template with core setup complete; controllers and models awaiting implementation
