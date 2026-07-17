export type AppRole = "admin" | "chef" | "homecook" | "user";
export type MealType = "breakfast" | "lunch" | "dinner" | "dessert" | "snack" | "drink";

export const MEAL_TYPES: { slug: MealType; label: string; emoji: string; desc: string }[] = [
  { slug: "breakfast", label: "Breakfast", emoji: "🥐", desc: "Rise & shine" },
  { slug: "lunch", label: "Lunch", emoji: "🥗", desc: "Midday meals" },
  { slug: "dinner", label: "Dinner", emoji: "🍽️", desc: "Evening comfort" },
  { slug: "dessert", label: "Dessert", emoji: "🍰", desc: "Sweet endings" },
  { slug: "snack", label: "Snack", emoji: "🥨", desc: "Small bites" },
  { slug: "drink", label: "Drink", emoji: "🥤", desc: "Sips & pours" },
];

export type DbRecipe = {
  id: string;
  author_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  category_id: number | null;
  meal_type: MealType | null;
  prep_time_min: number | null;
  cook_time_min: number | null;
  servings: number | null;
  difficulty: string | null;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  fiber_g: number | null;
  sugar_g: number | null;
  sodium_mg: number | null;
  ingredients: string[];
  steps: string[];
  tags: string[] | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type DbCategory = {
  id: number;
  slug: string;
  name: string;
  emoji: string | null;
  description: string | null;
};

export type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
};

export const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=70";

export function totalTime(r: Pick<DbRecipe, "prep_time_min" | "cook_time_min">) {
  const t = (r.prep_time_min ?? 0) + (r.cook_time_min ?? 0);
  return t > 0 ? `${t} min` : "—";
}

export type NutritionKey = "calories" | "protein_g" | "carbs_g" | "fat_g" | "fiber_g" | "sugar_g" | "sodium_mg";
export const NUTRITION_LABELS: Record<NutritionKey, { label: string; unit: string }> = {
  calories: { label: "Calories", unit: "kcal" },
  protein_g: { label: "Protein", unit: "g" },
  carbs_g: { label: "Carbs", unit: "g" },
  fat_g: { label: "Fat", unit: "g" },
  fiber_g: { label: "Fiber", unit: "g" },
  sugar_g: { label: "Sugar", unit: "g" },
  sodium_mg: { label: "Sodium", unit: "mg" },
};
