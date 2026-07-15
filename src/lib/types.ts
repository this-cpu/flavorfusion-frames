export type AppRole = "admin" | "chef" | "homecook";

export type DbRecipe = {
  id: string;
  author_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  category_id: number | null;
  prep_time_min: number | null;
  cook_time_min: number | null;
  servings: number | null;
  difficulty: string | null;
  calories: number | null;
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
