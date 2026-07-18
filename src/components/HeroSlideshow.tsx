import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { PLACEHOLDER_IMG } from "@/lib/types";

type Slide = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
};

export function HeroSlideshow({ slides }: { slides: Slide[] }) {
  const list = slides.length ? slides : [{
    id: "placeholder", title: "Discover recipes",
    description: "Sign up and add the first recipe.", image_url: PLACEHOLDER_IMG,
  }];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (list.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % list.length), 3800);
    return () => clearInterval(t);
  }, [list.length]);

  return (
    <div className="relative">
      <div className="absolute -right-8 -top-8 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      <div className="glass-strong relative aspect-[4/5] overflow-hidden rounded-3xl shadow-warm">
        {list.map((s, i) => (
          <Link
            key={s.id}
            to={s.id === "placeholder" ? "/recipes" : "/recipes/$id"}
            params={s.id === "placeholder" ? undefined : { id: s.id }}
            className={`absolute inset-0 transition-all duration-[900ms] ease-out ${
              i === idx
                ? "translate-x-0 opacity-100 scale-100"
                : i === (idx - 1 + list.length) % list.length
                  ? "-translate-x-full opacity-0 scale-105"
                  : "translate-x-full opacity-0 scale-105"
            }`}
          >
            <img
              src={s.image_url || PLACEHOLDER_IMG}
              alt={s.title}
              className={`h-full w-full object-cover transition-transform duration-[6000ms] ${
                i === idx ? "scale-110" : "scale-100"
              }`}
            />
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 to-transparent p-6 text-white">
              <Badge className="mb-2 border-0 bg-white/20 text-white">Chef's pick</Badge>
              <h3 className="font-display text-2xl">{s.title}</h3>
              {s.description && (
                <p className="mt-1 line-clamp-2 text-sm opacity-90">{s.description}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
      {list.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {list.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === idx ? "w-6 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
