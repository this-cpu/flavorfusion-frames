// Ingredient nutrition database & parser.
// Values are per 100 g of edible portion (USDA-style averages, rounded).
// `g_per_cup` lets us convert volume units to weight for that ingredient;
// falls back to 240 (water) when unknown.

export type Nutrition = {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
};

export type IngredientDef = {
  name: string;            // canonical name
  aliases?: string[];      // extra match terms
  per100g: Nutrition;
  g_per_cup?: number;      // volume→weight
  g_per_piece?: number;    // "1 egg", "1 onion"…
};

const N = (
  calories: number, protein_g: number, carbs_g: number, fat_g: number,
  fiber_g = 0, sugar_g = 0, sodium_mg = 0,
): Nutrition => ({ calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg });

export const INGREDIENTS: IngredientDef[] = [
  // Grains & flours
  { name: "all-purpose flour", aliases: ["flour", "plain flour", "maida"], per100g: N(364, 10, 76, 1, 2.7, 0.3, 2), g_per_cup: 125 },
  { name: "whole wheat flour", aliases: ["wheat flour", "atta"], per100g: N(340, 13, 72, 2.5, 11, 0.4, 5), g_per_cup: 120 },
  { name: "bread", aliases: ["white bread", "toast"], per100g: N(265, 9, 49, 3.2, 2.7, 5, 491), g_per_piece: 30 },
  { name: "rice", aliases: ["white rice", "basmati", "jasmine rice"], per100g: N(365, 7, 80, 0.7, 1.3, 0.1, 5), g_per_cup: 185 },
  { name: "brown rice", per100g: N(370, 8, 77, 2.7, 3.5, 0.7, 7), g_per_cup: 190 },
  { name: "pasta", aliases: ["spaghetti", "penne", "fusilli", "macaroni", "noodles"], per100g: N(371, 13, 75, 1.5, 3.2, 2.7, 6), g_per_cup: 100 },
  { name: "oats", aliases: ["rolled oats", "oatmeal"], per100g: N(389, 17, 66, 7, 11, 0, 2), g_per_cup: 90 },
  { name: "quinoa", per100g: N(368, 14, 64, 6, 7, 0, 5), g_per_cup: 170 },
  { name: "tortilla", aliases: ["tortillas", "wrap"], per100g: N(310, 8, 50, 8, 3, 2, 590), g_per_piece: 45 },

  // Protein
  { name: "chicken breast", aliases: ["chicken"], per100g: N(165, 31, 0, 3.6, 0, 0, 74) },
  { name: "chicken thigh", per100g: N(209, 26, 0, 11, 0, 0, 84) },
  { name: "ground beef", aliases: ["beef", "mince", "minced beef"], per100g: N(250, 26, 0, 15, 0, 0, 75) },
  { name: "pork", aliases: ["pork loin"], per100g: N(242, 27, 0, 14, 0, 0, 62) },
  { name: "bacon", per100g: N(541, 37, 1.4, 42, 0, 0, 1717), g_per_piece: 10 },
  { name: "salmon", per100g: N(208, 20, 0, 13, 0, 0, 59) },
  { name: "tuna", per100g: N(132, 28, 0, 1, 0, 0, 47) },
  { name: "shrimp", aliases: ["prawn", "prawns"], per100g: N(99, 24, 0.2, 0.3, 0, 0, 111) },
  { name: "egg", aliases: ["eggs"], per100g: N(155, 13, 1.1, 11, 0, 1.1, 124), g_per_piece: 50 },
  { name: "tofu", per100g: N(76, 8, 1.9, 4.8, 0.3, 0.7, 7) },
  { name: "tempeh", per100g: N(192, 20, 8, 11, 0, 0, 15) },

  // Dairy
  { name: "milk", aliases: ["whole milk"], per100g: N(61, 3.2, 4.8, 3.3, 0, 5, 43), g_per_cup: 240 },
  { name: "butter", per100g: N(717, 0.9, 0.1, 81, 0, 0.1, 11), g_per_cup: 227 },
  { name: "cheese", aliases: ["cheddar"], per100g: N(402, 25, 1.3, 33, 0, 0.5, 621) },
  { name: "mozzarella", per100g: N(280, 28, 3.1, 17, 0, 1, 373) },
  { name: "parmesan", per100g: N(431, 38, 4.1, 29, 0, 0.9, 1804) },
  { name: "cream", aliases: ["heavy cream", "double cream"], per100g: N(340, 2.8, 2.8, 36, 0, 2.8, 27), g_per_cup: 240 },
  { name: "yogurt", aliases: ["greek yogurt", "yoghurt"], per100g: N(59, 10, 3.6, 0.4, 0, 3.2, 36), g_per_cup: 245 },
  { name: "sour cream", per100g: N(198, 2.4, 4.6, 19, 0, 3.5, 40), g_per_cup: 230 },

  // Vegetables
  { name: "onion", aliases: ["onions", "red onion", "yellow onion"], per100g: N(40, 1.1, 9.3, 0.1, 1.7, 4.2, 4), g_per_piece: 110, g_per_cup: 160 },
  { name: "garlic", aliases: ["garlic clove", "cloves"], per100g: N(149, 6.4, 33, 0.5, 2.1, 1, 17), g_per_piece: 3 },
  { name: "tomato", aliases: ["tomatoes"], per100g: N(18, 0.9, 3.9, 0.2, 1.2, 2.6, 5), g_per_piece: 123, g_per_cup: 180 },
  { name: "carrot", aliases: ["carrots"], per100g: N(41, 0.9, 10, 0.2, 2.8, 4.7, 69), g_per_piece: 60, g_per_cup: 128 },
  { name: "potato", aliases: ["potatoes"], per100g: N(77, 2, 17, 0.1, 2.2, 0.8, 6), g_per_piece: 170 },
  { name: "sweet potato", per100g: N(86, 1.6, 20, 0.1, 3, 4.2, 55), g_per_piece: 130 },
  { name: "bell pepper", aliases: ["capsicum", "peppers"], per100g: N(31, 1, 6, 0.3, 2.1, 4.2, 4), g_per_piece: 120, g_per_cup: 150 },
  { name: "spinach", per100g: N(23, 2.9, 3.6, 0.4, 2.2, 0.4, 79), g_per_cup: 30 },
  { name: "broccoli", per100g: N(34, 2.8, 7, 0.4, 2.6, 1.7, 33), g_per_cup: 91 },
  { name: "mushroom", aliases: ["mushrooms"], per100g: N(22, 3.1, 3.3, 0.3, 1, 2, 5), g_per_cup: 70 },
  { name: "cucumber", per100g: N(15, 0.7, 3.6, 0.1, 0.5, 1.7, 2), g_per_piece: 300 },
  { name: "lettuce", per100g: N(15, 1.4, 2.9, 0.2, 1.3, 0.8, 28), g_per_cup: 55 },
  { name: "zucchini", aliases: ["courgette"], per100g: N(17, 1.2, 3.1, 0.3, 1, 2.5, 8), g_per_piece: 200 },
  { name: "corn", per100g: N(86, 3.2, 19, 1.2, 2.7, 3.2, 15), g_per_cup: 165 },
  { name: "peas", per100g: N(81, 5.4, 14, 0.4, 5.7, 5.7, 5), g_per_cup: 145 },
  { name: "beans", aliases: ["black beans", "kidney beans", "pinto"], per100g: N(132, 8.9, 24, 0.5, 8.7, 0.3, 2), g_per_cup: 172 },
  { name: "chickpeas", aliases: ["garbanzo"], per100g: N(164, 9, 27, 2.6, 7.6, 4.8, 7), g_per_cup: 164 },
  { name: "lentils", aliases: ["dal", "daal"], per100g: N(116, 9, 20, 0.4, 7.9, 1.8, 2), g_per_cup: 198 },
  { name: "ginger", per100g: N(80, 1.8, 18, 0.8, 2, 1.7, 13) },
  { name: "chili", aliases: ["chilli", "chile", "chilies"], per100g: N(40, 1.9, 8.8, 0.4, 1.5, 5.3, 9), g_per_piece: 45 },

  // Fruits
  { name: "apple", aliases: ["apples"], per100g: N(52, 0.3, 14, 0.2, 2.4, 10, 1), g_per_piece: 180 },
  { name: "banana", aliases: ["bananas"], per100g: N(89, 1.1, 23, 0.3, 2.6, 12, 1), g_per_piece: 118 },
  { name: "lemon", aliases: ["lemons"], per100g: N(29, 1.1, 9, 0.3, 2.8, 2.5, 2), g_per_piece: 60 },
  { name: "lime", aliases: ["limes"], per100g: N(30, 0.7, 11, 0.2, 2.8, 1.7, 2), g_per_piece: 45 },
  { name: "orange", per100g: N(47, 0.9, 12, 0.1, 2.4, 9, 0), g_per_piece: 130 },
  { name: "strawberry", aliases: ["strawberries"], per100g: N(32, 0.7, 7.7, 0.3, 2, 4.9, 1), g_per_cup: 144 },
  { name: "blueberry", aliases: ["blueberries"], per100g: N(57, 0.7, 14, 0.3, 2.4, 10, 1), g_per_cup: 148 },
  { name: "avocado", per100g: N(160, 2, 9, 15, 6.7, 0.7, 7), g_per_piece: 200 },
  { name: "mango", per100g: N(60, 0.8, 15, 0.4, 1.6, 14, 1), g_per_piece: 200 },

  // Fats & oils
  { name: "olive oil", per100g: N(884, 0, 0, 100, 0, 0, 2), g_per_cup: 216 },
  { name: "vegetable oil", aliases: ["canola oil", "sunflower oil", "oil"], per100g: N(884, 0, 0, 100, 0, 0, 0), g_per_cup: 218 },
  { name: "coconut oil", per100g: N(892, 0, 0, 99, 0, 0, 0), g_per_cup: 218 },
  { name: "sesame oil", per100g: N(884, 0, 0, 100, 0, 0, 0), g_per_cup: 218 },

  // Sweeteners
  { name: "sugar", aliases: ["white sugar", "granulated sugar"], per100g: N(387, 0, 100, 0, 0, 100, 1), g_per_cup: 200 },
  { name: "brown sugar", per100g: N(380, 0, 98, 0, 0, 97, 28), g_per_cup: 213 },
  { name: "honey", per100g: N(304, 0.3, 82, 0, 0.2, 82, 4), g_per_cup: 340 },
  { name: "maple syrup", per100g: N(260, 0, 67, 0.2, 0, 60, 12), g_per_cup: 322 },

  // Baking / pantry
  { name: "cocoa powder", aliases: ["cocoa"], per100g: N(228, 20, 58, 14, 33, 1.8, 21), g_per_cup: 86 },
  { name: "chocolate", aliases: ["dark chocolate", "chocolate chips"], per100g: N(546, 4.9, 61, 31, 7, 48, 24), g_per_cup: 175 },
  { name: "baking powder", per100g: N(53, 0, 28, 0, 0.2, 0, 10600) },
  { name: "baking soda", per100g: N(0, 0, 0, 0, 0, 0, 27360) },
  { name: "salt", per100g: N(0, 0, 0, 0, 0, 0, 38758) },
  { name: "pepper", aliases: ["black pepper"], per100g: N(251, 10, 64, 3.3, 25, 0.6, 20) },
  { name: "soy sauce", per100g: N(53, 8, 4.9, 0.6, 0.8, 0.4, 5493), g_per_cup: 250 },
  { name: "vinegar", per100g: N(21, 0, 0.9, 0, 0, 0.4, 5), g_per_cup: 240 },
  { name: "tomato sauce", aliases: ["passata", "marinara"], per100g: N(29, 1.6, 6, 0.2, 1.5, 4.1, 431), g_per_cup: 245 },
  { name: "tomato paste", per100g: N(82, 4.3, 19, 0.5, 4.1, 12, 59), g_per_cup: 262 },
  { name: "coconut milk", per100g: N(230, 2.3, 6, 24, 0, 3.3, 15), g_per_cup: 226 },

  // Nuts & seeds
  { name: "almonds", aliases: ["almond"], per100g: N(579, 21, 22, 50, 12, 4.4, 1), g_per_cup: 143 },
  { name: "walnuts", aliases: ["walnut"], per100g: N(654, 15, 14, 65, 6.7, 2.6, 2), g_per_cup: 117 },
  { name: "peanut butter", per100g: N(588, 25, 20, 50, 6, 9, 476), g_per_cup: 258 },
  { name: "sesame seeds", per100g: N(573, 18, 23, 50, 12, 0.3, 11), g_per_cup: 144 },

  // Herbs (small qty)
  { name: "basil", per100g: N(23, 3.2, 2.7, 0.6, 1.6, 0.3, 4) },
  { name: "cilantro", aliases: ["coriander"], per100g: N(23, 2.1, 3.7, 0.5, 2.8, 0.9, 46) },
  { name: "parsley", per100g: N(36, 3, 6.3, 0.8, 3.3, 0.9, 56) },
  { name: "mint", per100g: N(70, 3.8, 15, 0.9, 8, 0, 31) },
];

// ---------- Parser ----------

const UNIT_G: Record<string, number> = {
  g: 1, gram: 1, grams: 1,
  kg: 1000, kilo: 1000, kilos: 1000, kilogram: 1000, kilograms: 1000,
  mg: 0.001,
  oz: 28.3495, ounce: 28.3495, ounces: 28.3495,
  lb: 453.592, lbs: 453.592, pound: 453.592, pounds: 453.592,
};
const UNIT_ML: Record<string, number> = {
  ml: 1, milliliter: 1, milliliters: 1, millilitre: 1, millilitres: 1,
  l: 1000, liter: 1000, liters: 1000, litre: 1000, litres: 1000,
  cup: 240, cups: 240,
  tbsp: 15, tablespoon: 15, tablespoons: 15,
  tsp: 5, teaspoon: 5, teaspoons: 5,
  "fl oz": 29.5735, "floz": 29.5735,
  pint: 473, pints: 473, quart: 946, quarts: 946,
};
const PIECE_UNITS = new Set([
  "", "piece", "pieces", "pc", "pcs", "whole", "clove", "cloves",
  "slice", "slices", "small", "medium", "large", "head", "bunch",
]);

const FRACTIONS: Record<string, number> = {
  "½": 0.5, "¼": 0.25, "¾": 0.75, "⅓": 1 / 3, "⅔": 2 / 3, "⅛": 0.125, "⅜": 0.375, "⅝": 0.625, "⅞": 0.875,
};

function parseQty(text: string): { qty: number; rest: string } {
  const t = text.trim();
  // unicode fractions
  if (FRACTIONS[t[0]]) {
    return { qty: FRACTIONS[t[0]], rest: t.slice(1).trim() };
  }
  // "1 1/2" or "1/2"
  const mMix = t.match(/^(\d+)\s+(\d+)\/(\d+)\s*(.*)$/);
  if (mMix) return { qty: Number(mMix[1]) + Number(mMix[2]) / Number(mMix[3]), rest: mMix[4] };
  const mFrac = t.match(/^(\d+)\/(\d+)\s*(.*)$/);
  if (mFrac) return { qty: Number(mFrac[1]) / Number(mFrac[2]), rest: mFrac[3] };
  const mNum = t.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
  if (mNum) return { qty: Number(mNum[1]), rest: mNum[2] };
  return { qty: 1, rest: t };
}

function stripParens(s: string) { return s.replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim(); }

export function findIngredient(text: string): IngredientDef | null {
  const t = text.toLowerCase();
  let best: { def: IngredientDef; score: number } | null = null;
  for (const def of INGREDIENTS) {
    const terms = [def.name, ...(def.aliases ?? [])];
    for (const term of terms) {
      if (t.includes(term)) {
        const score = term.length;
        if (!best || score > best.score) best = { def, score };
      }
    }
  }
  return best?.def ?? null;
}

export function suggestIngredients(query: string, limit = 6): IngredientDef[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored: { def: IngredientDef; score: number }[] = [];
  for (const def of INGREDIENTS) {
    const terms = [def.name, ...(def.aliases ?? [])];
    let s = 0;
    for (const term of terms) {
      if (term === q) s = Math.max(s, 100);
      else if (term.startsWith(q)) s = Math.max(s, 60 - term.length);
      else if (term.includes(q)) s = Math.max(s, 30 - term.length);
    }
    if (s > 0) scored.push({ def, score: s });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((x) => x.def);
}

export type ParsedIngredient = {
  raw: string;
  qty: number;
  unit: string;
  grams: number | null;
  match: IngredientDef | null;
  nutrition: Nutrition | null;
};

export function parseIngredientLine(line: string): ParsedIngredient {
  const clean = stripParens(line);
  const { qty, rest } = parseQty(clean);
  const restLower = rest.toLowerCase();
  // find unit at start of `rest`
  let unit = "";
  let afterUnit = rest;
  const words = restLower.split(/\s+/);
  const two = words.slice(0, 2).join(" ");
  if (UNIT_G[two] || UNIT_ML[two]) {
    unit = two;
    afterUnit = rest.split(/\s+/).slice(2).join(" ");
  } else {
    const w = words[0] ?? "";
    if (UNIT_G[w] || UNIT_ML[w] || PIECE_UNITS.has(w)) {
      unit = w;
      afterUnit = rest.split(/\s+/).slice(1).join(" ");
    }
  }
  const name = afterUnit || rest;
  const match = findIngredient(name);

  // compute grams
  let grams: number | null = null;
  if (UNIT_G[unit]) grams = qty * UNIT_G[unit];
  else if (UNIT_ML[unit]) {
    const gpc = match?.g_per_cup ?? 240;
    grams = qty * UNIT_ML[unit] * (gpc / 240);
  } else if (match) {
    // piece / bare number
    if (match.g_per_piece) grams = qty * match.g_per_piece;
    else if (match.g_per_cup) grams = qty * match.g_per_cup; // assume 1 = 1 cup
    else grams = qty * 100; // last resort
  }

  let nutrition: Nutrition | null = null;
  if (match && grams != null) {
    const f = grams / 100;
    nutrition = {
      calories: match.per100g.calories * f,
      protein_g: match.per100g.protein_g * f,
      carbs_g: match.per100g.carbs_g * f,
      fat_g: match.per100g.fat_g * f,
      fiber_g: match.per100g.fiber_g * f,
      sugar_g: match.per100g.sugar_g * f,
      sodium_mg: match.per100g.sodium_mg * f,
    };
  }
  return { raw: line, qty, unit, grams, match, nutrition };
}

export const EMPTY_NUTRITION: Nutrition = {
  calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0, sugar_g: 0, sodium_mg: 0,
};

export function sumNutrition(list: (Nutrition | null | undefined)[]): Nutrition {
  const out = { ...EMPTY_NUTRITION };
  for (const n of list) {
    if (!n) continue;
    out.calories += n.calories;
    out.protein_g += n.protein_g;
    out.carbs_g += n.carbs_g;
    out.fat_g += n.fat_g;
    out.fiber_g += n.fiber_g;
    out.sugar_g += n.sugar_g;
    out.sodium_mg += n.sodium_mg;
  }
  return out;
}

export function round(n: number, d = 1): number {
  const p = Math.pow(10, d);
  return Math.round(n * p) / p;
}
