import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/Layouts";
import { supabase } from "@/integrations/supabase/client";
import { MEAL_TYPES, PLACEHOLDER_IMG } from "@/lib/types";

export const Route = createFileRoute("/categories")({
  component: Categories,
});

function Categories() {
  const { data, isLoading } = useQuery({
    queryKey: ["categories-with-counts"],
    queryFn: async () => {
      const [{ data: cats }, { data: recipes }] = await Promise.all([
        supabase.from("categories").select("*").order("id"),
        supabase.from("recipes").select("category_id, meal_type, image_url").eq("is_published", true),
      ]);

      const catCounts = new Map<number, number>();
      const catCovers = new Map<number, string>();
      const mealCounts = new Map<string, number>();
      const mealCovers = new Map<string, string>();

      (recipes ?? []).forEach((r: any) => {
        if (r.category_id) {
          catCounts.set(r.category_id, (catCounts.get(r.category_id) ?? 0) + 1);
          if (r.image_url && !catCovers.has(r.category_id)) catCovers.set(r.category_id, r.image_url);
        }
        if (r.meal_type) {
          mealCounts.set(r.meal_type, (mealCounts.get(r.meal_type) ?? 0) + 1);
          if (r.image_url && !mealCovers.has(r.meal_type)) mealCovers.set(r.meal_type, r.image_url);
        }
      });

      return {
        cuisines: (cats ?? []).map((c) => ({
          ...c,
          count: catCounts.get(c.id) ?? 0,
          cover: catCovers.get(c.id) ?? PLACEHOLDER_IMG,
        })),
        meals: MEAL_TYPES.map((m) => ({
          ...m,
          count: mealCounts.get(m.slug) ?? 0,
          cover: mealCovers.get(m.slug) ?? PLACEHOLDER_IMG,
        })),
      };
    },
  });

  return (
    <SiteLayout>
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">Browse recipes</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Two ways to find your next meal — by cuisine, or by when you'll eat it.
          </p>
        </div>
      </section>

      {/* MEALS */}
      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">By meal</h2>
            <p className="text-sm text-muted-foreground">Breakfast, lunch, dinner, dessert & more.</p>
          </div>
        </div>
        {isLoading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data?.meals.map((m) => (
              <Link
                key={m.slug}
                to="/meals/$meal"
                params={{ meal: m.slug }}
                className="group relative overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-warm"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={m.cover}
                    alt={m.label}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white">
                    <div>
                      <p className="text-3xl">{m.emoji}</p>
                      <h3 className="font-display text-2xl font-semibold">{m.label}</h3>
                      <p className="text-xs opacity-80">{m.desc}</p>
                    </div>
                    <span className="text-xs opacity-80">{m.count} recipes</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CUISINES */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-6 mt-4 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">By cuisine</h2>
            <p className="text-sm text-muted-foreground">Italian, Mexican, Thai and more.</p>
          </div>
        </div>
        {isLoading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data?.cuisines.map((c) => (
              <Link
                key={c.id}
                to="/recipes"
                search={{ category: c.slug }}
                className="group relative overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-warm"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={c.cover}
                    alt={c.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white">
                    <div>
                      <p className="text-2xl">{c.emoji}</p>
                      <h3 className="font-display text-xl font-semibold">{c.name}</h3>
                    </div>
                    <span className="text-xs opacity-80">{c.count} recipes</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
