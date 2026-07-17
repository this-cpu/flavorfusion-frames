import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/Layouts";
import { RecipeCard, RecipeCardSkeleton } from "@/components/RecipeCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { MEAL_TYPES, type MealType } from "@/lib/types";

export const Route = createFileRoute("/meals/$meal")({
  component: MealPage,
  errorComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl">Something went wrong.</h1>
      </div>
    </SiteLayout>
  ),
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl">Meal not found</h1>
        <Link to="/categories" className="mt-6 inline-block">
          <Button className="rounded-full">Browse categories</Button>
        </Link>
      </div>
    </SiteLayout>
  ),
});

function MealPage() {
  const { meal } = Route.useParams();
  const mealInfo = MEAL_TYPES.find((m) => m.slug === meal);
  if (!mealInfo) throw notFound();

  const { data, isLoading } = useQuery({
    queryKey: ["recipes-by-meal", meal],
    queryFn: async () => {
      const { data: recipes } = await supabase
        .from("recipes")
        .select("id, title, description, image_url, difficulty, prep_time_min, cook_time_min, category_id, categories(name, slug)")
        .eq("is_published", true)
        .eq("meal_type", meal as MealType)
        .order("created_at", { ascending: false });
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

  return (
    <SiteLayout>
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <p className="text-4xl">{mealInfo.emoji}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">{mealInfo.label}</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">{mealInfo.desc}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => <RecipeCardSkeleton key={i} />)
          ) : (data?.length ?? 0) === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed p-12 text-center">
              <p className="text-muted-foreground">No {mealInfo.label.toLowerCase()} recipes yet.</p>
              <Link to="/recipes" className="mt-4 inline-block">
                <Button className="rounded-full">Browse all recipes</Button>
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
