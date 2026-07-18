import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, Flame, Heart, Printer, Share2, ShoppingCart, Star, Trash2, Users, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/Layouts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PLACEHOLDER_IMG, totalTime, NUTRITION_LABELS, type NutritionKey } from "@/lib/types";
import { addToShoppingList } from "@/lib/shopping-list";
import { parseIngredientLine, sumNutrition, round } from "@/lib/ingredients";
import { IngredientBreakdownList } from "@/components/NutritionBreakdown";
import { formatDistanceToNow } from "date-fns";


export const Route = createFileRoute("/recipes/$id")({
  component: RecipeDetails,
});

function RecipeDetails() {
  const { id } = Route.useParams();
  const { user, profile } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState("");
  const [servingsOverride, setServingsOverride] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["recipe", id, user?.id ?? "anon"],
    queryFn: async () => {
      // Fetch the recipe alone — no FK-embed (no explicit FK constraints exist)
      const { data: recipe, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!recipe) return null;

      // Fetch related bits in parallel — none of them can 'not found' the recipe
      const [
        { data: author },
        { data: category },
        { data: comments },
        { count: likeCount },
        likedRes,
        { data: ratings },
        myRatingRes,
      ] = await Promise.all([
        supabase.from("profiles").select("display_name, username, avatar_url").eq("id", recipe.author_id).maybeSingle(),
        recipe.category_id
          ? supabase.from("categories").select("name, slug").eq("id", recipe.category_id).maybeSingle()
          : Promise.resolve({ data: null }),
        supabase.from("comments").select("id, body, created_at, user_id").eq("recipe_id", id).order("created_at", { ascending: false }),
        supabase.from("likes").select("*", { count: "exact", head: true }).eq("recipe_id", id),
        user
          ? supabase.from("likes").select("recipe_id").eq("recipe_id", id).eq("user_id", user.id).maybeSingle()
          : Promise.resolve({ data: null }),
        supabase.from("ratings").select("stars").eq("recipe_id", id),
        user
          ? supabase.from("ratings").select("stars").eq("recipe_id", id).eq("user_id", user.id).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      // Resolve commenter profiles in one query
      const commenterIds = Array.from(new Set((comments ?? []).map((c: any) => c.user_id)));
      const { data: commenterProfiles } = commenterIds.length
        ? await supabase.from("profiles").select("id, display_name, avatar_url").in("id", commenterIds)
        : { data: [] as any[] };
      const profileById = new Map((commenterProfiles ?? []).map((p: any) => [p.id, p]));
      const enrichedComments = (comments ?? []).map((c: any) => ({ ...c, profile: profileById.get(c.user_id) ?? null }));

      const avgRating = ratings && ratings.length
        ? ratings.reduce((s: number, r: any) => s + r.stars, 0) / ratings.length
        : 0;

      return {
        recipe,
        author: author ?? null,
        category: category ?? null,
        comments: enrichedComments,
        likeCount: likeCount ?? 0,
        liked: !!likedRes.data,
        avgRating,
        ratingCount: ratings?.length ?? 0,
        myRating: (myRatingRes.data as any)?.stars ?? 0,
      };
    },
  });

  const toggleLike = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in to like recipes");
      if (data?.liked) {
        await supabase.from("likes").delete().eq("recipe_id", id).eq("user_id", user.id);
      } else {
        await supabase.from("likes").insert({ recipe_id: id, user_id: user.id });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recipe", id] }),
    onError: (e: Error) => {
      toast.error(e.message);
      if (!user) navigate({ to: "/auth", search: { mode: "signin" } });
    },
  });

  const setRating = useMutation({
    mutationFn: async (stars: number) => {
      if (!user) throw new Error("Sign in to rate");
      const { error } = await supabase
        .from("ratings")
        .upsert({ recipe_id: id, user_id: user.id, stars }, { onConflict: "recipe_id,user_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Thanks for rating!");
      qc.invalidateQueries({ queryKey: ["recipe", id] });
    },
    onError: (e: Error) => {
      toast.error(e.message);
      if (!user) navigate({ to: "/auth", search: { mode: "signin" } });
    },
  });

  const addComment = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in to comment");
      if (!commentText.trim()) throw new Error("Comment cannot be empty");
      const { error } = await supabase
        .from("comments")
        .insert({ recipe_id: id, user_id: user.id, body: commentText.trim() });
      if (error) throw error;
    },
    onSuccess: () => {
      setCommentText("");
      qc.invalidateQueries({ queryKey: ["recipe", id] });
      toast.success("Comment posted!");
    },
    onError: (e: Error) => {
      toast.error(e.message);
      if (!user) navigate({ to: "/auth", search: { mode: "signin" } });
    },
  });

  const deleteComment = useMutation({
    mutationFn: async (cid: string) => {
      const { error } = await supabase.from("comments").delete().eq("id", cid);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recipe", id] }),
  });

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-4xl px-4 py-24 text-center text-muted-foreground">Loading…</div>
      </SiteLayout>
    );
  }
  if (!data) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
          <h1 className="font-display text-3xl">Recipe not found</h1>
          <Link to="/recipes" className="mt-6 inline-block">
            <Button className="rounded-full">Browse recipes</Button>
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const { recipe, author, category, comments, likeCount, liked, avgRating, ratingCount, myRating } = data;
  const ingredients: string[] = Array.isArray(recipe.ingredients)
    ? (recipe.ingredients as unknown[]).filter((x): x is string => typeof x === "string")
    : [];
  const steps: string[] = Array.isArray(recipe.steps)
    ? (recipe.steps as unknown[]).filter((x): x is string => typeof x === "string")
    : [];
  const baseServings = recipe.servings ?? 2;
  const servings = servingsOverride ?? baseServings;
  const scale = servings / baseServings;

  const nutritionRows: NutritionKey[] = ["calories", "protein_g", "carbs_g", "fat_g", "fiber_g", "sugar_g", "sodium_mg"];
  const parsedIngredients = ingredients.map((i) => parseIngredientLine(i)).filter((p) => p.raw.trim().length > 0);
  const computedTotal = sumNutrition(parsedIngredients.map((p) => p.nutrition));
  const hasComputed = parsedIngredients.some((p) => !!p.match);
  const hasAnyNutrition = nutritionRows.some((k) => (recipe as any)[k] != null) || hasComputed;


  const handleAddToList = () => {
    const n = addToShoppingList(ingredients, { recipe_id: recipe.id, recipe_title: recipe.title });
    if (n === 0) toast.info("All ingredients are already on your list");
    else toast.success(`${n} item${n === 1 ? "" : "s"} added to shopping list`);
  };

  return (
    <SiteLayout>
      <section className="relative">
        <div className="relative h-[52vh] w-full overflow-hidden print:h-64">
          <img src={recipe.image_url || PLACEHOLDER_IMG} alt={recipe.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
        </div>

        <div className="mx-auto -mt-40 max-w-4xl px-4 sm:px-6 print:mt-0">
          <div className="glass-strong rounded-3xl p-8 shadow-warm">
            <div className="flex flex-wrap items-center gap-2">
              {category && <Badge className="rounded-full">{category.name}</Badge>}
              {recipe.meal_type && (
                <Link to="/meals/$meal" params={{ meal: recipe.meal_type }}>
                  <Badge variant="outline" className="rounded-full capitalize">{recipe.meal_type}</Badge>
                </Link>
              )}
              {(recipe.tags ?? []).map((t: string) => (
                <Badge key={t} variant="outline" className="rounded-full">#{t}</Badge>
              ))}
            </div>
            <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">{recipe.title}</h1>
            <p className="mt-3 text-lg text-muted-foreground">{recipe.description}</p>

            <div className="mt-4 flex items-center gap-3">
              <StarRow value={avgRating} />
              <span className="text-sm text-muted-foreground">
                {avgRating.toFixed(1)} · {ratingCount} rating{ratingCount === 1 ? "" : "s"}
              </span>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={author?.avatar_url ?? undefined} />
                  <AvatarFallback>{(author?.display_name ?? "U").slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{author?.display_name ?? "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(recipe.created_at))} ago
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 print:hidden">
                <Button variant="outline" size="icon" title="Share" onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Link copied!");
                }}>
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" title="Print" onClick={() => window.print()}>
                  <Printer className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={handleAddToList} className="rounded-full">
                  <ShoppingCart className="mr-2 h-4 w-4" /> Add to list
                </Button>
                <Button
                  onClick={() => toggleLike.mutate()}
                  variant={liked ? "default" : "outline"}
                  className="rounded-full"
                >
                  <Heart className={`mr-2 h-4 w-4 ${liked ? "fill-current" : ""}`} />
                  {likeCount} {liked ? "Liked" : "Like"}
                </Button>
              </div>
            </div>

            <dl className="mt-8 grid grid-cols-2 gap-4 border-t pt-6 sm:grid-cols-4">
              <Stat icon={<Clock className="h-4 w-4" />} label="Time" value={totalTime(recipe)} />
              <Stat icon={<Users className="h-4 w-4" />} label="Servings" value={String(baseServings)} />
              <Stat icon={<Flame className="h-4 w-4" />} label="Calories" value={recipe.calories ? `${recipe.calories}` : "—"} />
              <Stat icon={<Heart className="h-4 w-4" />} label="Likes" value={String(likeCount)} />
            </dl>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-16 grid max-w-6xl gap-10 px-4 pb-20 sm:px-6 lg:grid-cols-[1fr_360px]">
        <div>
          <Tabs defaultValue="instructions">
            <TabsList className="rounded-full print:hidden">
              <TabsTrigger value="instructions" className="rounded-full">Instructions</TabsTrigger>
              <TabsTrigger value="nutrition" className="rounded-full">Nutrition</TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-full">Reviews</TabsTrigger>
              <TabsTrigger value="comments" className="rounded-full">
                Comments ({comments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="instructions" className="mt-6">
              <ol className="space-y-4">
                {steps.length === 0 && (
                  <li className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground">
                    No steps provided.
                  </li>
                )}
                {steps.map((step, i) => (
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
              <div className="rounded-2xl border bg-card p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl font-semibold">Nutrition</h3>
                    <p className="text-xs text-muted-foreground">
                      Auto-scaled by servings. Values are approximate.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border p-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full"
                      onClick={() => setServingsOverride(Math.max(1, servings - 1))}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="min-w-16 text-center text-sm font-medium">
                      {servings} serving{servings === 1 ? "" : "s"}
                    </span>
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full"
                      onClick={() => setServingsOverride(servings + 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {!hasAnyNutrition ? (
                  <p className="mt-6 text-sm text-muted-foreground">
                    No nutrition data available for this recipe yet.
                  </p>
                ) : (
                  <>
                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {nutritionRows.map((k) => {
                        const stored = (recipe as any)[k] as number | null;
                        const perServing = stored != null
                          ? stored
                          : (recipe.servings ? (computedTotal[k] / recipe.servings) : computedTotal[k]);
                        if (!perServing && perServing !== 0) return null;
                        const scaled = round(perServing * scale);
                        const total = round(perServing * servings);
                        const source = stored != null ? "stored" : "computed";
                        return (
                          <div key={k} className="rounded-xl bg-muted/60 p-4">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                              {NUTRITION_LABELS[k].label}
                            </p>
                            <p className="mt-1 font-display text-2xl font-semibold">
                              {scaled}
                              <span className="ml-1 text-xs font-normal text-muted-foreground">
                                {NUTRITION_LABELS[k].unit}
                              </span>
                            </p>
                            <p className="text-[10px] text-muted-foreground">per serving · {total} total · {source}</p>
                          </div>
                        );
                      })}

                    </div>

                    <div className="mt-6 rounded-xl border border-dashed p-4 text-xs text-muted-foreground">
                      Percent of daily value (2,000 kcal reference):
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        {nutritionRows.map((k) => {
                          const dv: Partial<Record<NutritionKey, number>> = {
                            calories: 2000, protein_g: 50, carbs_g: 275, fat_g: 78, fiber_g: 28, sugar_g: 50, sodium_mg: 2300,
                          };
                          const target = dv[k];
                          const raw = (recipe as any)[k] as number | null;
                          if (!target || raw == null) return null;
                          const pct = Math.min(100, Math.round((raw * scale / target) * 100));
                          return (
                            <div key={k}>
                              <div className="flex justify-between text-[11px]">
                                <span>{NUTRITION_LABELS[k].label}</span>
                                <span>{pct}%</span>
                              </div>
                              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                                <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="rounded-2xl border bg-card p-6">
                <h3 className="font-display text-xl font-semibold">Rate this recipe</h3>
                {user ? (
                  <>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {myRating > 0 ? `Your rating: ${myRating} star${myRating === 1 ? "" : "s"}` : "Tap a star to rate."}
                    </p>
                    <StarInput value={myRating} onChange={(n) => setRating.mutate(n)} />
                  </>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">
                    <Link to="/auth" search={{ mode: "signin" }} className="text-primary underline">Sign in</Link> to rate.
                  </p>
                )}

                <div className="mt-6 border-t pt-6">
                  <p className="text-sm text-muted-foreground">Community average</p>
                  <div className="mt-2 flex items-center gap-3">
                    <StarRow value={avgRating} large />
                    <span className="font-display text-3xl font-semibold">{avgRating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">/ 5 · {ratingCount} rating{ratingCount === 1 ? "" : "s"}</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="comments" className="mt-6 space-y-4">
              {user ? (
                <div className="rounded-2xl border bg-card p-5">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={profile?.avatar_url ?? undefined} />
                      <AvatarFallback>{(profile?.display_name ?? "U").slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Share your thoughts on this recipe..."
                        rows={3}
                        maxLength={1000}
                      />
                      <div className="mt-2 flex justify-end">
                        <Button size="sm" onClick={() => addComment.mutate()} disabled={addComment.isPending}>
                          {addComment.isPending ? "Posting..." : "Post comment"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed bg-card p-5 text-center">
                  <p className="text-sm text-muted-foreground">
                    <Link to="/auth" search={{ mode: "signin" }} className="text-primary underline">Sign in</Link> to leave a comment.
                  </p>
                </div>
              )}

              {comments.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">No comments yet.</p>
              )}
              {comments.map((c: any) => (
                <div key={c.id} className="rounded-2xl border bg-card p-5">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={c.profile?.avatar_url ?? undefined} />
                      <AvatarFallback>{(c.profile?.display_name ?? "U").slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{c.profile?.display_name ?? "User"}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(c.created_at))} ago
                      </p>
                    </div>
                    {user?.id === c.user_id && (
                      <Button variant="ghost" size="icon" onClick={() => deleteComment.mutate(c.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm">{c.body}</p>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        <aside className="rounded-3xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-xl font-semibold">Ingredients</h3>
              <p className="text-xs text-muted-foreground">for {servings} serving{servings === 1 ? "" : "s"}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleAddToList} className="print:hidden">
              <ShoppingCart className="mr-1 h-3 w-3" /> Add all
            </Button>
          </div>
          <ul className="mt-4 space-y-3">
            {ingredients.length === 0 && (
              <li className="text-sm text-muted-foreground">No ingredients listed.</li>
            )}
            {ingredients.map((ing, i) => (
              <li key={i} className="flex items-center gap-3">
                <Checkbox id={`ing-${i}`} />
                <label htmlFor={`ing-${i}`} className="text-sm">{ing}</label>
              </li>
            ))}
          </ul>
        </aside>
      </section>
    </SiteLayout>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

function StarRow({ value, large = false }: { value: number; large?: boolean }) {
  const size = large ? "h-6 w-6" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${size} ${n <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`}
        />
      ))}
    </div>
  );
}

function StarInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="mt-3 flex items-center gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n)}
          className="rounded p-1 transition-transform hover:scale-110"
          aria-label={`Rate ${n} star${n === 1 ? "" : "s"}`}
        >
          <Star className={`h-7 w-7 ${n <= shown ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`} />
        </button>
      ))}
    </div>
  );
}
