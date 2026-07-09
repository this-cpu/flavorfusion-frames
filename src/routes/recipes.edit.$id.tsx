import { createFileRoute, notFound } from "@tanstack/react-router";
import { RecipeForm } from "./recipes.add";
import { recipes } from "@/lib/dummy-data";

export const Route = createFileRoute("/recipes/edit/$id")({
  loader: ({ params }) => {
    const recipe = recipes.find((r) => r.id === params.id);
    if (!recipe) throw notFound();
    return { recipe };
  },
  component: EditRecipe,
});

function EditRecipe() {
  const { recipe } = Route.useLoaderData() as { recipe: import("@/lib/dummy-data").Recipe };
  return (
    <RecipeForm
      mode="edit"
      defaults={{
        title: recipe.title,
        description: recipe.description,
        category: recipe.category,
        time: recipe.time,
        servings: String(recipe.servings),
        ingredients: recipe.ingredients,
        steps: recipe.steps,
      }}
    />
  );
}
