import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/Layouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { DbCategory } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/recipes/add")({
  component: AddRecipe,
});

function AddRecipe() {
  return <RecipeForm />;
}

export function RecipeForm({ recipeId }: { recipeId?: string } = {}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEdit = !!recipeId;

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => ((await supabase.from("categories").select("*").order("id")).data ?? []) as DbCategory[],
  });

  const { data: existing } = useQuery({
    queryKey: ["recipe-edit", recipeId],
    enabled: !!recipeId,
    queryFn: async () => (await supabase.from("recipes").select("*").eq("id", recipeId!).maybeSingle()).data,
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [prep, setPrep] = useState(15);
  const [cook, setCook] = useState(30);
  const [servings, setServings] = useState(4);
  const [calories, setCalories] = useState<number | "">("");
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [steps, setSteps] = useState<string[]>([""]);
  const [tags, setTags] = useState("");
  const [loaded, setLoaded] = useState(false);

  if (existing && !loaded) {
    setTitle(existing.title);
    setDescription(existing.description ?? "");
    setImageUrl(existing.image_url ?? "");
    setCategoryId(existing.category_id ? String(existing.category_id) : "");
    setDifficulty(existing.difficulty ?? "Easy");
    setPrep(existing.prep_time_min ?? 0);
    setCook(existing.cook_time_min ?? 0);
    setServings(existing.servings ?? 2);
    setCalories(existing.calories ?? "");
    const ing = Array.isArray(existing.ingredients) ? (existing.ingredients as unknown[]).filter((x): x is string => typeof x === "string") : [];
    const stp = Array.isArray(existing.steps) ? (existing.steps as unknown[]).filter((x): x is string => typeof x === "string") : [];
    setIngredients(ing.length ? ing : [""]);
    setSteps(stp.length ? stp : [""]);
    setTags((existing.tags ?? []).join(", "));
    setLoaded(true);
  }

  const save = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      const payload = {
        author_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        image_url: imageUrl.trim() || null,
        category_id: categoryId ? Number(categoryId) : null,
        prep_time_min: prep,
        cook_time_min: cook,
        servings,
        difficulty,
        calories: calories === "" ? null : Number(calories),
        ingredients: ingredients.map((i) => i.trim()).filter(Boolean),
        steps: steps.map((s) => s.trim()).filter(Boolean),
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        is_published: true,
      };
      if (!payload.title) throw new Error("Title is required");
      if (isEdit) {
        const { error } = await supabase.from("recipes").update(payload).eq("id", recipeId!);
        if (error) throw error;
        return recipeId!;
      }
      const { data, error } = await supabase.from("recipes").insert(payload).select("id").single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: (id) => {
      toast.success(isEdit ? "Recipe updated" : "Recipe published!");
      navigate({ to: "/recipes/$id", params: { id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <DashboardLayout>
      <div>
        <h1 className="font-display text-3xl font-semibold">
          {isEdit ? "Edit recipe" : "New recipe"}
        </h1>
        <p className="mt-1 text-muted-foreground">Share what you cook — the community will love it.</p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="t">Title *</Label>
              <Input id="t" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Creamy Tuscan Chicken" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="d">Description</Label>
              <Textarea id="d" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="img">Cover image URL</Label>
              <Input id="img" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">Ingredients</h2>
              <Button size="sm" variant="outline" onClick={() => setIngredients([...ingredients, ""])}>
                <Plus className="mr-1 h-4 w-4" /> Add
              </Button>
            </div>
            <div className="mt-4 space-y-2">
              {ingredients.map((ing, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={ing} onChange={(e) => {
                    const copy = [...ingredients]; copy[i] = e.target.value; setIngredients(copy);
                  }} placeholder={`Ingredient ${i + 1}`} />
                  <Button variant="ghost" size="icon" onClick={() => setIngredients(ingredients.filter((_, k) => k !== i))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">Steps</h2>
              <Button size="sm" variant="outline" onClick={() => setSteps([...steps, ""])}>
                <Plus className="mr-1 h-4 w-4" /> Add
              </Button>
            </div>
            <div className="mt-4 space-y-2">
              {steps.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground text-sm">
                    {i + 1}
                  </div>
                  <Textarea rows={2} value={s} onChange={(e) => {
                    const copy = [...steps]; copy[i] = e.target.value; setSteps(copy);
                  }} placeholder={`Step ${i + 1}`} />
                  <Button variant="ghost" size="icon" onClick={() => setSteps(steps.filter((_, k) => k !== i))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border bg-card p-6 space-y-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue placeholder="Pick one" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.emoji} {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="prep">Prep (min)</Label>
                <Input id="prep" type="number" value={prep} onChange={(e) => setPrep(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cook">Cook (min)</Label>
                <Input id="cook" type="number" value={cook} onChange={(e) => setCook(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sv">Servings</Label>
                <Input id="sv" type="number" value={servings} onChange={(e) => setServings(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cal">Calories</Label>
                <Input id="cal" type="number" value={calories} onChange={(e) => setCalories(e.target.value === "" ? "" : Number(e.target.value))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tg">Tags (comma-separated)</Label>
              <Input id="tg" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="quick, dinner, spicy" />
            </div>
          </div>

          <Button className="w-full rounded-full" size="lg" onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? "Saving..." : isEdit ? "Update recipe" : "Publish recipe"}
          </Button>
        </aside>
      </div>
    </DashboardLayout>
  );
}
