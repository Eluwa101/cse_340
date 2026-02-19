## FFo - For Food Only

FFo is a Node.js + Express + PostgreSQL web app for a Nigerian raw food shop. Customers can browse food items by category, view item details, and place delivery orders. The existing admin inventory management workflow from the template is preserved.

## Features
- Browse food categories and item listings.
- View item details.
- Place delivery orders from item detail pages.
- Admin/employee inventory management (add/edit/delete items and classifications).
- Account login, favorites, and session handling.

## Quick Start
1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Configure environment variables in `.env` (database credentials, session secret, host, port).

3. Rebuild database schema (includes food orders table):

   ```bash
   psql -f database/db_rebuild_code.sql
   ```

4. Start development server:

   ```bash
   pnpm run dev
   ```

5. Open `http://localhost:5500`.

## Create a new GitHub repo from this project
```bash
git init
git add .
git commit -m "Initial commit: FFo - For Food Only"
gh repo create ffo-for-food-only --public --source=. --remote=origin --push
```
