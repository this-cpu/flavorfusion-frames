import { createFileRoute, Link } from "@tanstack/react-router";
import { ImagePlus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { DashboardLayout } from "@/components/Layouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories } from "@/lib/dummy-data";

export const Route = createFileRoute("/recipes/add")({
  component: AddRecipe,
});

function AddRecipe() {
  return <RecipeForm mode="create" />;
}

export function RecipeForm({
  mode,
  defaults,
}: {
  mode: "create" | "edit";
  defaults?: {
    title?: string;
    description?: string;
    category?: string;
    time?: string;
    servings?: string;
    ingredients?: string[];
    steps?: string[];
  };
}) {
  const [ingredients, setIngredients] = useState<string[]>(
    defaults?.ingredients ?? [""]
  );
  const [steps, setSteps] = useState<string[]>(defaults?.steps ?? [""]);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold">
              {mode === "create" ? "Share a new recipe" : "Edit recipe"}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Tell the story behind your dish. Nice photos help a lot.
            </p>
          </div>
        </div>

        <form className="mt-8 space-y-8" onSubmit={(e) => e.preventDefault()}>
          {/* Cover */}
          <section className="rounded-2xl border bg-card p-6">
            <h2 className="font-display text-lg font-semibold">Cover image</h2>
            <label className="mt-4 flex aspect-[16/7] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed bg-muted/30 text-center transition-colors hover:bg-muted/50">
              <div>
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                  <ImagePlus className="h-5 w-5" />
                </div>
                <p className="mt-3 text-sm font-medium">Click or drop an image</p>
                <p className="text-xs text-muted-foreground">JPG, PNG, up to 5MB</p>
              </div>
              <input type="file" className="hidden" />
            </label>
          </section>

          {/* Basics */}
          <section className="rounded-2xl border bg-card p-6">
            <h2 className="font-display text-lg font-semibold">Basics</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="title">Recipe title</Label>
                <Input id="title" defaultValue={defaults?.title} placeholder="Grandma's apple crumble" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="desc">Short description</Label>
                <Textarea id="desc" defaultValue={defaults?.description} placeholder="A few sentences about the dish." rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select defaultValue={defaults?.category}>
                  <SelectTrigger><SelectValue placeholder="Choose one" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select defaultValue="Easy">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Total time</Label>
                <Input id="time" defaultValue={defaults?.time} placeholder="30 min" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="servings">Servings</Label>
                <Input id="servings" type="number" defaultValue={defaults?.servings ?? "4"} />
              </div>
            </div>
          </section>

          {/* Ingredients */}
          <section className="rounded-2xl border bg-card p-6">
            <h2 className="font-display text-lg font-semibold">Ingredients</h2>
            <div className="mt-4 space-y-3">
              {ingredients.map((ing, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder={`Ingredient ${i + 1}`}
                    value={ing}
                    onChange={(e) => {
                      const next = [...ingredients];
                      next[i] = e.target.value;
                      setIngredients(next);
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setIngredients(ingredients.filter((_, k) => k !== i))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 rounded-full"
              onClick={() => setIngredients([...ingredients, ""])}
            >
              <Plus className="mr-1 h-4 w-4" /> Add ingredient
            </Button>
          </section>

          {/* Steps */}
          <section className="rounded-2xl border bg-card p-6">
            <h2 className="font-display text-lg font-semibold">Steps</h2>
            <div className="mt-4 space-y-3">
              {steps.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <div className="mt-2 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                    {i + 1}
                  </div>
                  <Textarea
                    placeholder="Describe this step..."
                    value={s}
                    rows={2}
                    onChange={(e) => {
                      const next = [...steps];
                      next[i] = e.target.value;
                      setSteps(next);
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setSteps(steps.filter((_, k) => k !== i))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 rounded-full"
              onClick={() => setSteps([...steps, ""])}
            >
              <Plus className="mr-1 h-4 w-4" /> Add step
            </Button>
          </section>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Link to="/dashboard">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
            <Button type="button" variant="secondary">Save draft</Button>
            <Button type="submit" className="rounded-full">
              {mode === "create" ? "Publish recipe" : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
