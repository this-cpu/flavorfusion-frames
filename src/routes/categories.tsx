import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/Layouts";
import { supabase } from "@/integrations/supabase/client";
import { PLACEHOLDER_IMG } from "@/lib/types";

export const Route = createFileRoute("/categories")({
  component: Categories,
});

function Categories() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["categories-with-counts"],
    queryFn: async () => {
      const [{ data: cats }, { data: recipes }] = await Promise.all([
        supabase.from("categories").select("*").order("id"),
        supabase.from("recipes").select("category_id, image_url").eq("is_published", true),
      ]);
      const counts = new Map<number, number>();
      const covers = new Map<number, string>();
      (recipes ?? []).forEach((r) => {
        if (r.category_id) {
          counts.set(r.category_id, (counts.get(r.category_id) ?? 0) + 1);
          if (r.image_url && !covers.has(r.category_id)) covers.set(r.category_id, r.image_url);
        }
      });
      return (cats ?? []).map((c) => ({
        ...c,
        count: counts.get(c.id) ?? 0,
        cover: covers.get(c.id) ?? PLACEHOLDER_IMG,
      }));
    },
  });

  return (
    <SiteLayout>
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">Categories</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Explore recipes by cuisine, meal, and mood.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {isLoading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.map((c) => (
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
