import { Info } from "lucide-react";
import type { Nutrition, ParsedIngredient } from "@/lib/ingredients";
import { round, sumNutrition, EMPTY_NUTRITION } from "@/lib/ingredients";

const LABELS: { key: keyof Nutrition; label: string; unit: string }[] = [
  { key: "calories", label: "Calories", unit: "kcal" },
  { key: "protein_g", label: "Protein", unit: "g" },
  { key: "carbs_g", label: "Carbs", unit: "g" },
  { key: "fat_g", label: "Fat", unit: "g" },
  { key: "fiber_g", label: "Fiber", unit: "g" },
  { key: "sugar_g", label: "Sugar", unit: "g" },
  { key: "sodium_mg", label: "Sodium", unit: "mg" },
];

export function NutritionCard({
  total, servings, title = "Nutrition (from ingredients)",
}: { total: Nutrition; servings?: number; title?: string }) {
  const per = servings && servings > 0 ? servings : 1;
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-lg font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">
            {servings ? `Per serving · ${servings} serving${servings === 1 ? "" : "s"} total` : "Total"}
          </p>
        </div>
      </div>
      <ul className="mt-3 divide-y">
        {LABELS.map(({ key, label, unit }) => {
          const totalV = (total as any)[key] as number;
          const perV = totalV / per;
          return (
            <li key={key} className="flex items-center justify-between py-1.5 text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium">
                {round(perV)} <span className="text-xs text-muted-foreground">{unit}</span>
                {servings ? (
                  <span className="ml-2 text-[11px] text-muted-foreground">
                    ({round(totalV)} total)
                  </span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function IngredientBreakdownList({ parsed }: { parsed: ParsedIngredient[] }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center gap-2">
        <Info className="h-4 w-4 text-primary" />
        <h3 className="font-display text-lg font-semibold">How we calculate it</h3>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Each line is parsed for quantity + unit, matched to our ingredient database
        (USDA-style per-100 g values), and summed. Volume units use a per-ingredient
        weight (e.g. 1 cup flour ≈ 125 g). Unrecognised lines are skipped.
      </p>
      <ul className="mt-4 space-y-2 text-sm">
        {parsed.length === 0 && (
          <li className="text-muted-foreground">Add ingredients to see the breakdown.</li>
        )}
        {parsed.map((p, i) => (
          <li key={i} className="rounded-lg bg-muted/40 p-2.5">
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm">{p.raw || <span className="italic text-muted-foreground">empty</span>}</span>
              {p.match ? (
                <span className="shrink-0 text-xs text-muted-foreground">
                  {p.grams ? `${round(p.grams)} g` : "—"}
                </span>
              ) : (
                <span className="shrink-0 text-xs text-amber-600 dark:text-amber-400">unknown</span>
              )}
            </div>
            {p.nutrition && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                {round(p.nutrition.calories)} kcal · P {round(p.nutrition.protein_g)}g · C {round(p.nutrition.carbs_g)}g · F {round(p.nutrition.fat_g)}g
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export { sumNutrition, EMPTY_NUTRITION };
