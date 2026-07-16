// Simple localStorage-backed shopping list. No backend required.
import { useEffect, useState, useCallback } from "react";

export type ShoppingItem = {
  id: string; // uuid-ish
  text: string;
  recipe_id?: string;
  recipe_title?: string;
  checked: boolean;
  added_at: number;
};

const KEY = "saveur.shopping-list.v1";

function read(): ShoppingItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function write(items: ShoppingItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("shopping-list-changed"));
}

export function addToShoppingList(
  ingredients: string[],
  meta?: { recipe_id?: string; recipe_title?: string },
): number {
  const current = read();
  const existing = new Set(current.map((i) => i.text.toLowerCase()));
  const additions: ShoppingItem[] = ingredients
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !existing.has(s.toLowerCase()))
    .map((text) => ({
      id: crypto.randomUUID(),
      text,
      recipe_id: meta?.recipe_id,
      recipe_title: meta?.recipe_title,
      checked: false,
      added_at: Date.now(),
    }));
  write([...additions, ...current]);
  return additions.length;
}

export function useShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  useEffect(() => {
    setItems(read());
    const h = () => setItems(read());
    window.addEventListener("shopping-list-changed", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("shopping-list-changed", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  const toggle = useCallback((id: string) => {
    write(read().map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)));
  }, []);
  const remove = useCallback((id: string) => {
    write(read().filter((i) => i.id !== id));
  }, []);
  const clear = useCallback(() => write([]), []);
  const clearChecked = useCallback(() => write(read().filter((i) => !i.checked)), []);
  return { items, toggle, remove, clear, clearChecked };
}
