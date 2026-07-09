import { Link } from "@tanstack/react-router";
import { Clock, Flame, Heart, Star } from "lucide-react";
import type { Recipe } from "@/lib/dummy-data";
import { Badge } from "@/components/ui/badge";

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link
      to="/recipes/$id"
      params={{ id: recipe.id }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-warm"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={recipe.image}
          alt={recipe.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/60 to-transparent" />
        <div className="absolute left-3 top-3">
          <Badge className="glass border-0 text-foreground">
            {recipe.category}
          </Badge>
        </div>
        <button
          type="button"
          onClick={(e) => e.preventDefault()}
          aria-label="Save recipe"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full glass text-foreground transition-colors hover:text-primary"
        >
          <Heart className="h-4 w-4" />
        </button>
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between text-xs text-white">
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-current" /> {recipe.rating}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {recipe.time}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-lg font-semibold leading-tight">
          {recipe.title}
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {recipe.description}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <img
              src={recipe.authorAvatar}
              alt={recipe.author}
              className="h-6 w-6 rounded-full object-cover"
            />
            <span className="text-xs text-muted-foreground">{recipe.author}</span>
          </div>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Flame className="h-3.5 w-3.5" /> {recipe.calories} kcal
          </span>
        </div>
      </div>
    </Link>
  );
}

export function RecipeCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="aspect-[4/3] animate-pulse bg-muted" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
          <div className="h-3 w-12 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
