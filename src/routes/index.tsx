import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChefHat, Sparkles, Timer, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/Layouts";
import { RecipeCard } from "@/components/RecipeCard";
import { categories, recipes } from "@/lib/dummy-data";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const featured = recipes.slice(0, 6);
  const hero = recipes[0];

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="bg-hero relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <div className="flex flex-col justify-center">
            <Badge className="w-fit rounded-full bg-primary/10 text-primary hover:bg-primary/10">
              <Sparkles className="mr-1 h-3 w-3" /> New this week
            </Badge>
            <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05] sm:text-6xl md:text-7xl">
              Cook something <span className="text-gradient">worth savoring</span>.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Saveur is an interactive recipe book that helps you discover,
              organize, and share beautiful recipes with a community of home cooks.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/recipes">
                <Button size="lg" className="rounded-full">
                  Explore recipes <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/recipes/add">
                <Button size="lg" variant="outline" className="rounded-full">
                  Share your recipe
                </Button>
              </Link>
            </div>
            <dl className="mt-10 grid grid-cols-3 gap-6 border-t pt-6">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Recipes</dt>
                <dd className="font-display text-2xl font-semibold">1.2k+</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Cooks</dt>
                <dd className="font-display text-2xl font-semibold">8.4k</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Categories</dt>
                <dd className="font-display text-2xl font-semibold">32</dd>
              </div>
            </dl>
          </div>

          <div className="relative">
            <div className="absolute -right-8 -top-8 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
            <div className="glass-strong relative overflow-hidden rounded-3xl shadow-warm">
              <img
                src={hero.image}
                alt={hero.title}
                className="aspect-[4/5] w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-6 text-white">
                <Badge className="mb-2 border-0 bg-white/20 text-white">
                  Chef's pick
                </Badge>
                <h3 className="font-display text-2xl">{hero.title}</h3>
                <p className="mt-1 text-sm opacity-90">{hero.description}</p>
              </div>
            </div>
            <div className="glass absolute -bottom-6 -left-6 hidden rounded-2xl px-4 py-3 shadow-soft sm:block">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                  <Timer className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg prep time</p>
                  <p className="font-display text-lg font-semibold">28 min</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories strip */}
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold">Browse by mood</h2>
            <p className="mt-1 text-muted-foreground">Pick a category and start cooking.</p>
          </div>
          <Link to="/categories" className="text-sm font-medium text-primary hover:underline">
            See all
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {categories.slice(0, 6).map((c) => (
            <Link
              key={c.name}
              to="/categories"
              className="group flex flex-col items-center rounded-2xl border bg-card p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-warm"
            >
              <span className="text-3xl transition-transform group-hover:scale-110">{c.emoji}</span>
              <span className="mt-2 text-sm font-medium">{c.name}</span>
              <span className="text-xs text-muted-foreground">{c.count} recipes</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold">Trending this week</h2>
            <p className="mt-1 text-muted-foreground">Loved by our community.</p>
          </div>
          <Link to="/recipes" className="text-sm font-medium text-primary hover:underline">
            View all recipes
          </Link>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      </section>

      {/* Feature strip */}
      <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6">
        <div className="grid gap-6 rounded-3xl border bg-card p-8 md:grid-cols-3 md:p-12">
          <Feature icon={<ChefHat className="h-5 w-5" />} title="Chef-tested">
            Every recipe is tested and rated by real home cooks like you.
          </Feature>
          <Feature icon={<Utensils className="h-5 w-5" />} title="Smart shopping">
            Turn any recipe into a tidy shopping list in one tap.
          </Feature>
          <Feature icon={<Sparkles className="h-5 w-5" />} title="Personalized">
            Recommendations tuned to what you love (and what you don't).
          </Feature>
        </div>
      </section>
    </SiteLayout>
  );
}

function Feature({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
