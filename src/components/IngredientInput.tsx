import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { suggestIngredients, parseIngredientLine } from "@/lib/ingredients";

/** A single ingredient input line with type-ahead suggestions. */
export function IngredientInput({
  value, onChange, placeholder,
}: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [focused, setFocused] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);

  const parsed = parseIngredientLine(value);
  // Suggest based on the "name" portion (what came after qty/unit)
  const queryPart = value.replace(/^\s*[\d\.\/⅓⅔¼½¾⅛⅜⅝⅞]+\s*/, "")
    .replace(/^(g|kg|mg|oz|lb|lbs|ml|l|cup|cups|tbsp|tsp|tablespoon|teaspoon|clove|cloves|slice|slices|piece|pieces|whole|small|medium|large|pound|pounds|ounce|ounces)s?\s*/i, "");
  const suggestions = focused ? suggestIngredients(queryPart || value, 6) : [];

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setFocused(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const applySuggestion = (name: string) => {
    // Keep any qty/unit the user typed; only replace the name-ish portion
    const m = value.match(/^(\s*[\d\.\/⅓⅔¼½¾⅛⅜⅝⅞]+\s*(?:[a-z]+\s+)?)/i);
    const prefix = m ? m[1] : "";
    onChange((prefix + name).trim());
    setFocused(false);
  };

  return (
    <div ref={ref} className="relative flex-1">
      <Input
        value={value}
        onChange={(e) => { onChange(e.target.value); setHighlight(0); }}
        onFocus={() => setFocused(true)}
        onKeyDown={(e) => {
          if (!suggestions.length) return;
          if (e.key === "ArrowDown") { e.preventDefault(); setHighlight((h) => (h + 1) % suggestions.length); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setHighlight((h) => (h - 1 + suggestions.length) % suggestions.length); }
          else if (e.key === "Enter" && focused) { e.preventDefault(); applySuggestion(suggestions[highlight].name); }
          else if (e.key === "Escape") setFocused(false);
        }}
        placeholder={placeholder ?? 'e.g. "2 cups flour" or "1 onion"'}
      />
      {parsed.match && parsed.grams != null && (
        <p className="mt-1 pl-1 text-[11px] text-muted-foreground">
          ≈ {Math.round(parsed.grams)} g {parsed.match.name} · {Math.round(parsed.nutrition?.calories ?? 0)} kcal
        </p>
      )}
      {focused && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-auto rounded-lg border bg-popover shadow-lg">
          {suggestions.map((s, i) => (
            <li
              key={s.name}
              onMouseDown={(e) => { e.preventDefault(); applySuggestion(s.name); }}
              onMouseEnter={() => setHighlight(i)}
              className={`cursor-pointer px-3 py-2 text-sm ${i === highlight ? "bg-accent" : ""}`}
            >
              <div className="font-medium capitalize">{s.name}</div>
              <div className="text-[11px] text-muted-foreground">
                {s.per100g.calories} kcal · P {s.per100g.protein_g}g · C {s.per100g.carbs_g}g · F {s.per100g.fat_g}g <span className="opacity-60">/ 100g</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
