import { createFileRoute } from "@tanstack/react-router";
import { RecipeForm } from "./recipes.add";

export const Route = createFileRoute("/_authenticated/recipes/edit/$id")({
  component: EditRecipe,
});

function EditRecipe() {
  const { id } = Route.useParams();
  return <RecipeForm recipeId={id} />;
}
