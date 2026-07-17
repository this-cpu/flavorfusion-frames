## 1. Fix "Recipe not found"

The detail query in `src/routes/recipes.$id.tsx` joins on `profiles!recipes_author_id_fkey` and `categories(...)`. If either FK name or a null category makes the join fail, `.maybeSingle()` returns null and we show "not found". I'll:
- Split the query: fetch the recipe first, then fetch author profile and category separately (no fragile FK-name hint).
- Only show "not found" when the recipe row itself is missing.

## 2. Categories restructure

Two browsing axes instead of one flat list:
- **Cuisine** (Italian, Mexican, Thai, Indian, etc.)
- **Meal type** (Breakfast, Lunch, Dinner, Dessert, Snack, Drink)

Changes:
- Add a `meal_type` enum column on `recipes` (nullable, backfilled for seeded recipes via migration).
- Keep existing `categories` table for cuisines; rename UI label to "Cuisines".
- `/categories` page: two sections — "Browse by cuisine" (existing grid) and "Browse by meal" (new grid with icons).
- New route `/meals/$meal` listing recipes filtered by meal_type.
- Recipe listing filter bar gains a meal-type dropdown; each recipe appears in both its cuisine and its meal.

## 3. Recipe detail page polish

Audit and confirm working: Print, Share, Add to shopping list, Like, servings +/-, nutrition scaler + %DV, comments (post/delete). Add a **star rating (1–5)** control tied to a new `ratings` table (one per user per recipe) shown next to Likes, plus average rating in the header.

## 4. Chef / Home-cook application portal

Replace auto-role assignment. New signups default to `user` (viewer). To become a chef or home cook they apply:

- Migration:
  - Add `'user'` to `app_role` enum; change signup trigger to assign `'user'`.
  - New table `role_applications` (user_id, requested_role, evidence_url, note, status pending/approved/rejected, reviewer_id, reviewed_at).
  - Storage bucket `role-evidence` (private; RLS: user uploads own, admins read all).
  - RLS: user sees own applications; admin sees/updates all.
- User flow: `/apply` page with two cards
  - **Become a Chef** → upload certificate image/PDF + short bio.
  - **Become a Home Cook** → submit a full recipe (title, ingredients, steps, photo) as proof.
- Admin flow: new "Applications" tab in `/admin` — approve/reject. Approving inserts the role into `user_roles` and (for home-cook applications) publishes the submitted recipe under the applicant.
- Sidebar: show "Apply for chef/home cook" to plain users; existing chef/homecook dashboards unchanged.

## 5. How to prompt Lovable efficiently (save credits)

Short answer: **one concrete goal per message, name the exact file/page, and describe the finished behavior — not the steps.**

Do:
- "On the recipe detail page, the Print button should open the browser print dialog with the sidebar hidden." (specific page + specific outcome)
- Batch related asks: "On /auth: add password visibility toggle AND remember-me checkbox."
- When something breaks, quote the exact error/URL: "Clicking any recipe card goes to /recipes/<id> and shows 'Recipe not found', but the recipe exists."

Avoid:
- Vague scope creep ("fix any other issues you find") — this makes the agent touch unrelated files and burn credits.
- Re-describing the whole app each turn — the agent already has context.
- Mixing unrelated features in one message (auth + nutrition + colors + hosting) — each area needs verification, so one message becomes many tool calls.
- Asking for "make it a full real app" without listing which pages/features matter — leads to broad rewrites.

Rule of thumb: **if you can't picture the exact screen and button after the change, the prompt is too broad.**

## Technical notes

- Files touched: `src/routes/recipes.$id.tsx`, `src/routes/categories.tsx`, `src/routes/recipes.index.tsx`, new `src/routes/meals.$meal.tsx`, new `src/routes/_authenticated/apply.tsx`, `src/routes/_authenticated/admin.tsx`, `src/routes/auth.tsx` (remove role selector), `src/components/Sidebar.tsx`, `src/hooks/useAuth.tsx` (add `isPending` role state).
- Migrations: add `meal_type` enum + column, add `'user'` to `app_role`, update `handle_new_user()`, create `role_applications` + policies + grants, create `ratings` table + policies + grants, create private storage bucket `role-evidence`.
- No changes to auth-attacher, generated Supabase files, or `_authenticated/route.tsx`.
