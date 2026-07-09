import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  Bookmark,
  Clock,
  Flame,
  Heart,
  Printer,
  Share2,
  Star,
  Users,
} from "lucide-react";
import { SiteLayout } from "@/components/Layouts";
import type { Recipe } from "@/lib/dummy-data";
import { recipes } from "@/lib/dummy-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RecipeCard } from "@/components/RecipeCard";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/recipes/$id")({
  component: RecipeDetails,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl">Recipe not found</h1>
        <p className="mt-2 text-muted-foreground">
          The recipe you're looking for doesn't exist.
        </p>
        <Link to="/recipes" className="mt-6 inline-block">
          <Button className="rounded-full">Browse recipes</Button>
        </Link>
      </div>
    </SiteLayout>
  ),
  loader: ({ params }): { recipe: Recipe } => {
    const recipe = recipes.find((r) => r.id === params.id);
    if (!recipe) throw notFound();
    return { recipe };
  },
});

function RecipeDetails() {
  const { recipe } = Route.useLoaderData() as { recipe: Recipe };
  const related = recipes.filter((r) => r.id !== recipe.id).slice(0, 3);

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative">
        <div className="relative h-[52vh] w-full overflow-hidden">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
        </div>

        <div className="mx-auto -mt-40 max-w-4xl px-4 sm:px-6">
          <div className="glass-strong rounded-3xl p-8 shadow-warm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-full">{recipe.category}</Badge>
              {recipe.tags.map((t) => (
                <Badge key={t} variant="outline" className="rounded-full">#{t}</Badge>
              ))}
            </div>
            <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
              {recipe.title}
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">{recipe.description}</p>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={recipe.authorAvatar}
                  className="h-10 w-10 rounded-full object-cover"
                  alt={recipe.author}
                />
                <div>
                  <p className="text-sm font-medium">{recipe.author}</p>
                  <p className="text-xs text-muted-foreground">Home chef</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" aria-label="Save">
                  <Bookmark className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" aria-label="Print">
                  <Printer className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" aria-label="Share">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button className="rounded-full">
                  <Heart className="mr-2 h-4 w-4" /> Add to favorites
                </Button>
              </div>
            </div>

            <dl className="mt-8 grid grid-cols-2 gap-4 border-t pt-6 sm:grid-cols-4">
              <Stat icon={<Clock className="h-4 w-4" />} label="Time" value={recipe.time} />
              <Stat icon={<Users className="h-4 w-4" />} label="Servings" value={String(recipe.servings)} />
              <Stat icon={<Flame className="h-4 w-4" />} label="Calories" value={`${recipe.calories}`} />
              <Stat icon={<Star className="h-4 w-4" />} label="Rating" value={`${recipe.rating}/5`} />
            </dl>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto mt-16 grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_360px]">
        <div>
          <Tabs defaultValue="instructions">
            <TabsList className="rounded-full">
              <TabsTrigger value="instructions" className="rounded-full">Instructions</TabsTrigger>
              <TabsTrigger value="nutrition" className="rounded-full">Nutrition</TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-full">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="instructions" className="mt-6">
              <ol className="space-y-6">
                {recipe.steps.map((step, i) => (
                  <li key={i} className="flex gap-4 rounded-2xl border bg-card p-5">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground font-semibold">
                      {i + 1}
                    </div>
                    <p className="text-sm leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
            </TabsContent>

            <TabsContent value="nutrition" className="mt-6">
              <div className="grid gap-4 sm:grid-cols-4">
                {[
                  { l: "Calories", v: `${recipe.calories}` },
                  { l: "Protein", v: "32 g" },
                  { l: "Carbs", v: "24 g" },
                  { l: "Fat", v: "18 g" },
                ].map((n) => (
                  <div key={n.l} className="rounded-2xl border bg-card p-5 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{n.l}</p>
                    <p className="mt-1 font-display text-2xl font-semibold">{n.v}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl border bg-card p-5">
                  <div className="flex items-center gap-3">
                    <img src={`https://i.pravatar.cc/60?img=${i + 10}`} className="h-10 w-10 rounded-full" alt="" />
                    <div>
                      <p className="text-sm font-medium">Sam Cooper</p>
                      <div className="flex text-primary">
                        {Array.from({ length: 5 }).map((_, k) => (
                          <Star key={k} className="h-3 w-3 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Made this last night and it was incredible. Family loved it — will be adding to the weekly rotation.
                  </p>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        <aside className="rounded-3xl border bg-card p-6">
          <h3 className="font-display text-xl font-semibold">Ingredients</h3>
          <p className="text-xs text-muted-foreground">for {recipe.servings} servings</p>
          <ul className="mt-4 space-y-3">
            {recipe.ingredients.map((ing) => (
              <li key={ing} className="flex items-center gap-3">
                <Checkbox id={ing} />
                <label htmlFor={ing} className="text-sm">{ing}</label>
              </li>
            ))}
          </ul>
          <Button className="mt-6 w-full rounded-full">Add to shopping list</Button>
        </aside>
      </section>

      {/* Related */}
      <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6">
        <h2 className="font-display text-3xl font-semibold">You might also like</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}
