import { createFileRoute } from "@tanstack/react-router";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { SiteLayout } from "@/components/Layouts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RecipeCard, RecipeCardSkeleton } from "@/components/RecipeCard";
import { recipes } from "@/lib/dummy-data";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/search")({
  component: SearchResults,
});

function SearchResults() {
  const [q, setQ] = useState("chicken");
  const [loading, setLoading] = useState(false);
  const results = recipes.filter((r) =>
    q ? r.title.toLowerCase().includes(q.toLowerCase()) || r.tags.some((t) => t.includes(q.toLowerCase())) : true
  );

  return (
    <SiteLayout>
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-14 rounded-full pl-12 text-base"
              placeholder="What are you cooking today?"
            />
            {q && (
              <button
                onClick={() => setQ("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {results.length} results {q && <>for "<span className="font-medium text-foreground">{q}</span>"</>}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Filters</h2>
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="mt-6">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Diet</p>
            <div className="space-y-2">
              {["Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "Keto"].map((d) => (
                <div key={d} className="flex items-center gap-2">
                  <Checkbox id={d} />
                  <Label htmlFor={d} className="text-sm font-normal">{d}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Max time</p>
            <Slider defaultValue={[45]} max={180} step={5} />
            <p className="mt-2 text-xs text-muted-foreground">Up to 45 min</p>
          </div>

          <div className="mt-6">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Difficulty</p>
            <div className="flex flex-wrap gap-2">
              {["Easy", "Medium", "Hard"].map((d) => (
                <Badge key={d} variant="outline" className="cursor-pointer rounded-full">{d}</Badge>
              ))}
            </div>
          </div>

          <Button className="mt-6 w-full rounded-full">Apply filters</Button>
        </aside>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Sorted by relevance</p>
            <Button variant="ghost" size="sm" onClick={() => setLoading((l) => !l)}>
              {loading ? "Show results" : "Show skeletons"}
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <RecipeCardSkeleton key={i} />)
              : results.map((r) => <RecipeCard key={r.id} recipe={r} />)}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
