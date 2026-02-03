# Copilot Instructions for CSE 340 Project

## Project Overview
This is a **CSE Motors automotive inventory management system** - an Express.js + EJS + PostgreSQL full-stack web application for displaying vehicles, reviews, and upgrades. It's a starter template for CSE 340 coursework that demonstrates backend-driven web applications with database integration.

**Tech Stack:**
- **Runtime:** Node.js with Express 4.x
- **View Engine:** EJS with express-ejs-layouts for template inheritance
- **Database:** PostgreSQL (Render hosted)
- **Package Manager:** PNPM (not npm)
- **Dev Tool:** Nodemon (auto-restart on file changes)
- **Session Management:** express-session with connect-pg-simple (stores sessions in PostgreSQL)
- **Flash Messages:** connect-flash for one-time notifications
- **Form Handling:** body-parser for POST request parsing
- **Password Hashing:** bcryptjs for secure password storage
- **Form Validation:** express-validator for server-side input validation

## Architecture & Key Components

### Server Structure (`server.js`)
- **Entry point** - Requires utilities, routes, and controllers
- **Middleware order:** Session → Body Parser → Messages → Static files → Routes → 404 handler → Error middleware
- **View engine:** EJS with layouts at `views/layouts/layout.ejs` (NOT in views root)
- **Routes:** 
  - Home route wrapped in `utilities.handleErrors()`: `app.get("/", utilities.handleErrors(baseController.buildHome))`
  - Inventory routes mounted at `/inv`: `app.use("/inv", inventoryRoute)`
  - Account routes mounted at `/account`: `app.use("/account", accountRoute)`
- **Error handling:** 404 middleware → Express error handler (must be last route)
- **Session management:** PostgreSQL session store with express-session; SESSION_SECRET in .env
- **Environment:** Uses `.env` file for PORT (5500), HOST (localhost), DATABASE_URL, NODE_ENV, SESSION_SECRET

### Database Connection (`database/index.js`)
- **Pool-based connection** using `pg` package with environment-based configuration
- **Development mode:** SSL with rejectUnauthorized false; logs all queries for debugging
- **Production mode:** SSL disabled (same-server communication); silent query execution
- **Connection string:** Uses `process.env.DATABASE_URL` from `.env`
- **Export pattern:** Wrapped query function in development, raw Pool in production

### Models (`models/`)
- **inventory-model.js** - Database query functions using prepared statements ($1, $2 parameters)
  - `getClassifications()` - Fetches all vehicle classifications
  - `getInventoryByClassificationId(id)` - Joins inventory and classification tables
  - `getInventoryItemById(id)` - Fetches single vehicle by ID
  - `addClassification(classificationName)` - Inserts new classification into database
  - `getClassificationByName(classificationName)` - Queries classification by name
  - `addInventory(inventoryData)` - Inserts new vehicle with all details (make, model, year, etc.)
- **accountModel.js** - Account management database functions
  - `registerAccount(firstname, lastname, email, password)` - Inserts new account into database
  - `checkExistingEmail(email)` - Checks if email already exists in database
- **Pattern:** Async functions that query pool and return `.rows` or single row
- **Error handling:** Try-catch with console.error logging

### Controllers (`controllers/`)
- **baseController.js** - Handles home route; calls utilities.getNav() for navigation data
- **invController.js** - Handles inventory display and management routes
  - `buildByClassificationId()` - Gets vehicles by classification, builds grid, renders classification view
  - `buildByVehicleId()` - Gets single vehicle details, builds detail HTML, renders detail view
  - `buildManagementView()` - Delivers inventory management dashboard
  - `buildAddClassificationView()` - Delivers form to add new classification
  - `addClassification()` - Processes classification form submission with validation
  - `buildAddInventory()` - Delivers form to add new inventory item with classification dropdown
  - `addInventory()` - Processes inventory form submission with validation (10 fields)
  - `triggerError()` - Intentional error handler for testing error middleware
  - Pattern: Extract route params → Query model → Build view HTML via utilities → res.render()
- **accountController.js** - Handles user authentication and account management
  - `buildLogin()` - Delivers login form view
  - `buildRegister()` - Delivers registration form view
  - `registerAccount()` - Processes registration form, validates input, hashes password with bcryptjs, inserts into database
  - Uses flash messages for user feedback
- **Wrapping pattern:** All controller functions wrapped in `utilities.handleErrors()` in routes

### Routing Pattern (`routes/`)
- **static.js** - Serves `public/` folder with explicit route handlers (`/css`, `/js`, `/images`)
- **inventoryRoutes.js** - Dynamic inventory routes for classification and detail views, plus add/manage functions
  - Uses Express router pattern with `.get()` and `.post()` methods
  - **Inventory management routes:**
    - `GET /` - Deliver inventory management dashboard
    - `GET /add-classification` - Show add classification form
    - `POST /add-classification` - Process classification submission with validation
    - `GET /add-inventory` - Show add inventory form with classification dropdown
    - `POST /add-inventory` - Process inventory submission with 10-field validation
  - **Display routes:**
    - `GET /type/:classificationId` - Show vehicles by classification
    - `GET /detail/:invId` - Show single vehicle details
    - `GET /error` - Intentional error route for testing
  - **Validation middleware:** Uses `validateClassification`, `handleValidationErrors`, `validateInventory`, `handleInventoryValidationErrors`
- **accountRoute.js** - User authentication and account management routes
  - `GET /login` - Delivers login form
  - `GET /register` - Delivers registration form
  - `POST /register` - Processes registration with validation rules and error checking
  - `POST /login` - Processes login attempt (temporary route; full implementation pending)

### Utilities (`utilities/index.js`)
- **getNav()** - Builds navigation HTML list from all classifications; used by every rendered page
- **buildClassificationGrid()** - Builds vehicle grid HTML from inventory data array
  - Generates `<ul id="inv-display">` with vehicle links, thumbnails, and prices (formatted with Intl.NumberFormat)
- **buildVehicleDetailView()** - Builds detailed vehicle HTML with all specs (year, make, model, price, miles, color, description)
- **buildClassificationList()** - Creates `<select>` dropdown of all classifications for forms (with optional selected value)
- **handleErrors()** - Middleware wrapper that catches promise rejections and passes to error handler
- **Pattern:** All utility functions return HTML strings or call next with error object

### View Structure (`views/`)
- **Layout inheritance:** `layouts/layout.ejs` wraps all pages with `<%- body %>` placeholder
- **Partials:** `layouts/partials/` contains reusable components:
  - `head.ejs` - Meta tags, stylesheets
  - `header.ejs` - Top section
  - `navigation.ejs` - Nav menu
  - `footer.ejs` - Footer with error test link
- **Pages:**
  - `index.ejs` - Home page showing DMC Delorean vehicle
  - `inventory/classification.ejs` - Vehicle list grid for each classification
  - `inventory/detail.ejs` - Single vehicle detail view
  - `account/login.ejs` - User login form
  - `account/register.ejs` - New account registration form
  - `errors/error.ejs` - Error page with title and message
- **EJS Syntax:** Use `<%- include() %>` for partials, `<%- body %>` for page content, `<%= var %>` for interpolation

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
1. Create route handler in `routes/static.js` (or new route file like `inventoryRoutes.js`)
2. Wrap handler in `utilities.handleErrors()` for error catching: `router.get("/path/:id", utilities.handleErrors(controller.handler))`
3. Register route in `server.js`: `app.use("/path", routerVariable)`
4. Restart server (nodemon handles this automatically)

### Adding Controller Functions
1. Create async function that:
   - Extracts params from `req.params` or `req.query`
   - Calls model function to fetch data
   - Calls utility function to build HTML (e.g., `buildClassificationGrid()`)
   - Calls `utilities.getNav()` for navigation
   - Uses `res.render('viewName', { data, nav })` to return view
2. Wrap in routes file with `utilities.handleErrors()`

### Adding Model Functions
1. Create async function that:
   - Requires pool from `../database`
   - Uses prepared statements: `pool.query("SELECT * FROM table WHERE id = $1", [paramValue])`
   - Returns `.rows` array or handles errors with try-catch
2. Export as named export: `module.exports = { functionName }`

### Adding Views
1. Create `.ejs` file in `views/` (or subdirectory like `views/inventory/`)
2. Views automatically inherit `layout.ejs` wrapper
3. Use `<%- include('partials/componentName') %>` to include partials
4. Access route data via `<%= variableName %>`
5. Loop through arrays: `<% items.forEach(item => { %> <%= item.name %> <% }) %>`

## Project Conventions & Patterns

## Project Conventions & Patterns

### File Organization
- **`public/`** - All static assets (CSS, JS, images) served directly; never require authentication
- **`views/`** - EJS templates; always follow `layouts/` hierarchy with partials
- **`database/`** - SQL DDL and seed data; schema uses snake_case (inv_id, classification_name)
- **`controllers/`** - Route handler functions: `baseController.js`, `invController.js`, `accountController.js`
- **`models/`** - Database query functions: `inventory-model.js`, `accountModel.js`
- **`routes/`** - Route definitions: `static.js`, `inventoryRoutes.js`, `accountRoute.js`
- **`utilities/`** - Shared utility functions: `getNav()`, `buildClassificationGrid()`, `buildVehicleDetailView()`, `buildClassificationList()`, `handleErrors()`
  - **Validation utilities:** `account-validation.js`, `classification-validation.js`, `inventory-validation.js`

### Naming Conventions
- **Database:** snake_case (inv_id, inv_make, classification_id, account_type)
- **File routes:** lowercase with hyphens (`static.js`, routes should match directory structure)
- **EJS files:** descriptive names in lowercase (index.ejs, layout.ejs, header.ejs)
- **JavaScript variables:** camelCase (port, host, DATABASE_URL from env)

### Environment Management
- `.env` file stores PORT, HOST, DATABASE_URL, NODE_ENV, SESSION_SECRET
- **Never commit `.env`** - only commit `.env.example` template if needed
- Uses `dotenv` package (`require('dotenv').config()`) to load variables into `process.env`
- Render.com PostgreSQL connection string included in `.env`
- SESSION_SECRET required for express-session (can be any string, used to sign session cookies)

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
3. **Session middleware:** `app.use(session({...}))` - Stores sessions in PostgreSQL
4. **Body parser middleware:** `app.use(bodyParser.urlencoded())` and `.json()` - Parses form/JSON data
5. **Flash messages middleware:** `app.use(require('connect-flash')())` - One-time notifications
6. Set view engine: `app.set('view engine', 'ejs')`
7. Use layout middleware: `app.use(expressLayouts)`
8. Set layout path: `app.set('layout', './layouts/layout')`
9. Register static routes: `app.use(static)`
10. Register home route: `app.get("/", utilities.handleErrors(baseController.buildHome))`
11. Register inventory routes: `app.use("/inv", inventoryRoute)`
12. Register account routes: `app.use("/account", accountRoute)`
13. 404 middleware: `app.use(async (req, res, next) => next({ status: 404, message: ... }))`
14. Error handler (MUST be last): `app.use(async (err, req, res, next) => { ... })`

### Error Handling Pattern
- **All async route handlers wrapped with `utilities.handleErrors()`** - Catches promise rejections and passes to Express error handler
- **404 handling:** Creates error object with status/message, passed to error middleware
- **Error view:** `views/errors/error.ejs` displays title and message; must receive `nav` prop
- **Error middleware:** Logs to console, determines message based on status, renders error view
- **Important:** Error middleware signature must have 4 params `(err, req, res, next)` for Express to recognize it

### Database Connection (`database/index.js`)
- **Development mode:** SSL required (rejectUnauthorized: false); wraps pool.query() with logging
- **Production mode:** No SSL (same-server security); exports raw Pool object
- **Node.env detection:** Checks `process.env.NODE_ENV === "development"` to determine mode
- **Query execution:** Both modes support prepared statements with parameter arrays

### Static File Serving
- Routes in `static.js` explicitly define `/css`, `/js`, `/images` handlers
- `express.static()` serves files without compression; consider adding gzip for production

## Common Tasks & Patterns

### Add a New Page
1. Create `views/newpage.ejs` with EJS content
2. Create route handler in appropriate controller file
3. Create route in `routes/inventoryRoutes.js` (or new route file): `router.get('/path', utilities.handleErrors(controller.handler))`
4. Register route in `server.js`: `app.use('/path', routeVariable)` (if new file)
5. Reference in navigation via `header.ejs` or `navigation.ejs` if needed

### Add Database Query
1. Create async function in `models/inventory-model.js` using prepared statements
2. Export function as named export: `module.exports = { functionName, ...existing }`
3. Call from controller via: `const data = await invModel.functionName(params)`
4. Pass data to view with nav: `res.render('viewName', { data, nav, ...other })`
5. Handle errors in model with try-catch; let utilities.handleErrors catch exceptions

### Inventory Grid Pattern
- Use `utilities.buildClassificationGrid(data)` to generate HTML for vehicle lists
- Displays vehicle thumbnail, name, and price (Intl.NumberFormat formatted)
- Returns warning message if data array is empty
- Generates links to detail view: `/inv/detail/{inv_id}`

### Style Updates
- Edit `public/css/styles.css`
- No build process; changes live-reload with nodemon server restart

### Add Environment Variable
1. Add to `.env` file (e.g., `API_KEY=value`)
2. Access in code: `process.env.API_KEY`
3. Restart server for changes to take effect

## Important Implementation Details

### Data Flow Example: Vehicle Classification View
1. **Route** (`inventoryRoutes.js`): `router.get("/type/:classificationId", utilities.handleErrors(invCont.buildByClassificationId))`
2. **Controller** (`invController.js`): 
   - Extract `classification_id` from `req.params.classificationId`
   - Call model: `const data = await invModel.getInventoryByClassificationId(classification_id)`
   - Build HTML: `const grid = await utilities.buildClassificationGrid(data)`
   - Get nav: `let nav = await utilities.getNav()`
   - Render: `res.render("./inventory/classification", { title, nav, grid })`
3. **Model** (`inventory-model.js`):
   - Use prepared statement: `pool.query("SELECT ... WHERE classification_id = $1", [id])`
   - Return `data.rows` array with joined classification_name
4. **View** (`views/inventory/classification.ejs`):
   - Access passed data: `<%- grid %>` for HTML, `<%- nav %>` for navigation
   - Page title set via `<% title %>` in layout wrapper

### Navigation Building
- Called by all controllers: `const nav = await utilities.getNav()`
- Gets all classifications from `invModel.getClassifications()`
- Builds HTML list with home link + classification links to `/inv/type/{id}`
- Passed to every view render to populate `navigation.ejs` partial

### Session & Authentication Flow
- **Session creation:** Express-session stores session data in PostgreSQL via connect-pg-simple
- **Registration flow:** `POST /account/register` → `accountController.registerAccount()` → `accountModel.registerAccount()` → Database INSERT
- **Success:** Redirects to login with flash message; Failure: Re-renders register form with error message
- **Flash messages:** Set via `req.flash('notice', 'message')` and accessed in views via `messages()` helper

## Known Limitations & Future Work

- **Form Validation Complete** - Registration and inventory forms validated with express-validator; classification validation enforces alphanumeric only
- **Password Hashing Implemented** - bcryptjs hash enabled in registration process
- **Inventory Management Complete** - Add classification and add vehicle routes fully functional with validation
- **Authentication Pending** - Login form created but full authentication with session enforcement not yet implemented
- **No DELETE/UPDATE operations** - Only SELECT and INSERT queries in models
- **Limited routes:** Management and form views complete; account authentication not yet enforced on protected routes

---

**Last Updated:** February 2, 2026
**Status:** Core MVC architecture complete; inventory management (add classification/vehicle) fully implemented with validation; user registration with password hashing functional; login authentication logic pending
