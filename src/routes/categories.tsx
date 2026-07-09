import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/Layouts";
import { categories, recipes } from "@/lib/dummy-data";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const Route = createFileRoute("/categories")({
  component: Categories,
});

function Categories() {
  return (
    <SiteLayout>
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">Categories</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Explore recipes by cuisine, meal, and mood.
          </p>
          <div className="relative mt-6 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search categories..." className="h-11 pl-10" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((c, i) => {
            const cover = recipes[i % recipes.length].image;
            return (
              <Link
                key={c.name}
                to="/recipes"
                className="group relative overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-warm"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={cover}
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
            );
          })}
        </div>
      </section>
    </SiteLayout>
  );
}
