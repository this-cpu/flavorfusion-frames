import { Link } from "@tanstack/react-router";
import { Clock, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { DbRecipe } from "@/lib/types";
import { PLACEHOLDER_IMG, totalTime } from "@/lib/types";

export type RecipeCardData = Pick<
  DbRecipe,
  "id" | "title" | "description" | "image_url" | "difficulty" | "prep_time_min" | "cook_time_min"
> & {
  like_count?: number;
  category_name?: string | null;
  author_name?: string | null;
};

export function RecipeCard({ recipe }: { recipe: RecipeCardData }) {
  return (
    <Link
      to="/recipes/$id"
      params={{ id: recipe.id }}
      className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-warm"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={recipe.image_url || PLACEHOLDER_IMG}
          alt={recipe.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {recipe.category_name && (
          <Badge className="absolute left-3 top-3 rounded-full">{recipe.category_name}</Badge>
        )}
        {typeof recipe.like_count === "number" && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs text-white backdrop-blur">
            <Heart className="h-3 w-3 fill-current" />
            {recipe.like_count}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 font-display text-lg font-semibold">{recipe.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {recipe.description ?? "A delicious recipe from our community."}
        </p>
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {totalTime(recipe)}
          </span>
          <span>{recipe.difficulty ?? "Easy"}</span>
        </div>
      </div>
    </Link>
  );
}

export function RecipeCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}
