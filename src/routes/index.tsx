import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ChefHat, Sparkles, Timer, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/Layouts";
import { RecipeCard, RecipeCardSkeleton } from "@/components/RecipeCard";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";


export const Route = createFileRoute("/")({
  component: Home,
});

function useHomeData() {
  return useQuery({
    queryKey: ["home"],
    queryFn: async () => {
      const [recipesRes, categoriesRes, likesRes] = await Promise.all([
        supabase
          .from("recipes")
          .select("id, title, description, image_url, difficulty, prep_time_min, cook_time_min, category_id, created_at, categories(name)")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(6),
        supabase.from("categories").select("*").order("id"),
        supabase.from("likes").select("recipe_id"),
      ]);
      const likeCounts = new Map<string, number>();
      (likesRes.data ?? []).forEach((l: any) => {
        likeCounts.set(l.recipe_id, (likeCounts.get(l.recipe_id) ?? 0) + 1);
      });
      const recipes = (recipesRes.data ?? []).map((r: any) => ({
        ...r,
        category_name: r.categories?.name ?? null,
        like_count: likeCounts.get(r.id) ?? 0,
      }));
      return { recipes, categories: categoriesRes.data ?? [] };
    },
  });
}

function Home() {
  const { data, isLoading } = useHomeData();
  const recipes = data?.recipes ?? [];
  const categories = data?.categories ?? [];
  const slides = recipes.slice(0, 5).map((r: any) => ({

    id: r.id, title: r.title, description: r.description, image_url: r.image_url,
  }));

  return (
    <SiteLayout>
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
              Saveur is an interactive recipe book — discover, save, and share
              beautiful recipes with a real community of home cooks and chefs.
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
          </div>

          <div className="relative">
            <HeroSlideshow slides={slides} />
            <div className="glass absolute -bottom-6 -left-6 hidden rounded-2xl px-4 py-3 shadow-soft sm:block">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                  <Timer className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Community</p>
                  <p className="font-display text-lg font-semibold">{recipes.length} fresh recipes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


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
              key={c.id}
              to="/recipes"
              search={{ category: c.slug } as never}
              className="group flex flex-col items-center rounded-2xl border bg-card p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-warm"
            >
              <span className="text-3xl transition-transform group-hover:scale-110">{c.emoji}</span>
              <span className="mt-2 text-sm font-medium">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold">Latest recipes</h2>
            <p className="mt-1 text-muted-foreground">Fresh from the community.</p>
          </div>
          <Link to="/recipes" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <RecipeCardSkeleton key={i} />)
            : recipes.length === 0
              ? (
                <div className="col-span-full rounded-2xl border border-dashed p-12 text-center">
                  <p className="text-muted-foreground">No recipes yet — be the first!</p>
                  <Link to="/recipes/add" className="mt-4 inline-block">
                    <Button className="rounded-full">Add a recipe</Button>
                  </Link>
                </div>
              )
              : recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-7xl px-4 pb-16 sm:px-6">
        <div className="grid gap-6 rounded-3xl border bg-card p-8 md:grid-cols-3 md:p-12">
          <Feature icon={<ChefHat className="h-5 w-5" />} title="Chef-tested">
            Every recipe is tested and rated by real home cooks like you.
          </Feature>
          <Feature icon={<Utensils className="h-5 w-5" />} title="Smart shopping">
            Turn any recipe into a tidy shopping list in one tap.
          </Feature>
          <Feature icon={<Sparkles className="h-5 w-5" />} title="Community-powered">
            Comment, like, and follow the cooks whose food you love.
          </Feature>
        </div>
      </section>
    </SiteLayout>
  );
}

function Feature({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">{icon}</div>
      <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
