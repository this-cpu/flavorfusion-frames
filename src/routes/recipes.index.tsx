import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Filter, Search } from "lucide-react";
import { SiteLayout } from "@/components/Layouts";
import { RecipeCard, RecipeCardSkeleton } from "@/components/RecipeCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

import { MEAL_TYPES, type MealType } from "@/lib/types";

type Search = { q?: string; category?: string; meal?: MealType };

export const Route = createFileRoute("/recipes/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" ? s.q : undefined,
    category: typeof s.category === "string" ? s.category : undefined,
    meal: MEAL_TYPES.some((m) => m.slug === s.meal) ? (s.meal as MealType) : undefined,
  }),
  component: RecipeListing,
});

function RecipeListing() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState(search.q ?? "");
  const activeSlug = search.category ?? "all";
  const activeMeal = search.meal ?? "all";

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await supabase.from("categories").select("*").order("id")).data ?? [],
  });

  const { data, isLoading } = useQuery({
    queryKey: ["recipes-list", search.q, search.category, search.meal],
    queryFn: async () => {
      let query = supabase
        .from("recipes")
        .select("id, title, description, image_url, difficulty, prep_time_min, cook_time_min, category_id, meal_type, categories(name, slug)")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (search.q) query = query.ilike("title", `%${search.q}%`);
      if (search.meal) query = query.eq("meal_type", search.meal);
      if (search.category && search.category !== "all") {
        const cat = (await supabase.from("categories").select("id").eq("slug", search.category).maybeSingle()).data;
        if (cat) query = query.eq("category_id", cat.id);
      }
      const { data: recipes } = await query;
      const { data: likes } = await supabase.from("likes").select("recipe_id");
      const counts = new Map<string, number>();
      (likes ?? []).forEach((l: any) => counts.set(l.recipe_id, (counts.get(l.recipe_id) ?? 0) + 1));
      return (recipes ?? []).map((r: any) => ({
        ...r,
        category_name: r.categories?.name ?? null,
        like_count: counts.get(r.id) ?? 0,
      }));
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ search: (s: Search) => ({ ...s, q: q || undefined }) });
  };

  const setCategory = (slug: string) => {
    navigate({ search: (s: Search) => ({ ...s, category: slug === "all" ? undefined : slug }) });
  };
  const setMeal = (slug: string) => {
    navigate({ search: (s: Search) => ({ ...s, meal: slug === "all" ? undefined : (slug as MealType) }) });
  };

  return (
    <SiteLayout>
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">All recipes</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Handpicked recipes from our community of home cooks and chefs.
          </p>

          <form onSubmit={submit} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search recipes..."
                className="h-11 pl-10"
              />
            </div>
            <Button type="submit" className="h-11">Search</Button>
          </form>

          <div className="mt-5 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase text-muted-foreground">Meal</span>
              {[{ slug: "all", label: "All" }, ...MEAL_TYPES.map((m) => ({ slug: m.slug, label: m.label }))].map((m) => (
                <Badge
                  key={m.slug}
                  onClick={() => setMeal(m.slug)}
                  className={`cursor-pointer rounded-full border px-3 py-1 text-sm transition-colors ${
                    activeMeal === m.slug
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-accent"
                  }`}
                >
                  {m.label}
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase text-muted-foreground">Cuisine</span>
              {[{ slug: "all", name: "All" }, ...categories].map((c) => (
                <Badge
                  key={c.slug}
                  onClick={() => setCategory(c.slug)}
                  className={`cursor-pointer rounded-full border px-3 py-1 text-sm transition-colors ${
                    activeSlug === c.slug
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-accent"
                  }`}
                >
                  {c.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <p className="mb-6 text-sm text-muted-foreground">
          <Filter className="mr-1 inline h-4 w-4" />
          Showing <span className="font-medium text-foreground">{data?.length ?? 0}</span> recipes
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => <RecipeCardSkeleton key={i} />)
          ) : (data?.length ?? 0) === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed p-12 text-center">
              <p className="text-muted-foreground">No recipes match your filters.</p>
              <Link to="/recipes/add" className="mt-4 inline-block">
                <Button className="rounded-full">Add the first recipe</Button>
              </Link>
            </div>
          ) : (
            data!.map((r) => <RecipeCard key={r.id} recipe={r} />)
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
