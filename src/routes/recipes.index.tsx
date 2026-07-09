import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Filter, Search, SlidersHorizontal } from "lucide-react";
import { SiteLayout } from "@/components/Layouts";
import { RecipeCard, RecipeCardSkeleton } from "@/components/RecipeCard";
import { categories, recipes } from "@/lib/dummy-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/recipes/")({
  component: RecipeListing,
});

function RecipeListing() {
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState<string>("All");

  const filtered =
    active === "All" ? recipes : recipes.filter((r) => r.category === active);

  return (
    <SiteLayout>
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">
            All recipes
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Handpicked recipes from our community of home cooks and chefs.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search recipes, ingredients, chefs..." className="h-11 pl-10" />
            </div>
            <Select defaultValue="popular">
              <SelectTrigger className="h-11 w-full sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most popular</SelectItem>
                <SelectItem value="new">Newest</SelectItem>
                <SelectItem value="quick">Quickest</SelectItem>
                <SelectItem value="rating">Top rated</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="h-11">
              <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
            </Button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {["All", ...categories.map((c) => c.name)].map((c) => (
              <Badge
                key={c}
                onClick={() => setActive(c)}
                className={`cursor-pointer rounded-full border px-3 py-1 text-sm transition-colors ${
                  active === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:bg-accent"
                }`}
              >
                {c}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <Filter className="mr-1 inline h-4 w-4" />
            Showing <span className="font-medium text-foreground">{filtered.length}</span> recipes
          </p>
          <Button variant="ghost" size="sm" onClick={() => setLoading((l) => !l)}>
            {loading ? "Show recipes" : "Show skeletons"}
          </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <RecipeCardSkeleton key={i} />)
            : filtered.map((r) => <RecipeCard key={r.id} recipe={r} />)}
        </div>

        <div className="mt-12 flex justify-center">
          <Button variant="outline" className="rounded-full">Load more</Button>
        </div>
      </section>
    </SiteLayout>
  );
}
