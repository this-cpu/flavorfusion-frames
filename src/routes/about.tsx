import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/Layouts";
import { Heart, Leaf, Sparkles } from "lucide-react";

export const Route = createFileRoute("/about")({
  component: About,
});

function About() {
  return (
    <SiteLayout>
      <section className="bg-hero">
        <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Our story</p>
          <h1 className="mt-3 font-display text-5xl font-semibold leading-tight sm:text-6xl">
            A little cookbook with a <span className="text-gradient">big appetite</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Saveur started as a student project — a place to keep every recipe we
            loved cooking together. Today it's a community for anyone who believes
            a great meal makes an ordinary day worth remembering.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <Value icon={<Heart className="h-5 w-5" />} title="Made with love">
            Every feature is designed by people who actually cook.
          </Value>
          <Value icon={<Leaf className="h-5 w-5" />} title="Real & seasonal">
            We celebrate recipes that respect ingredients, seasons, and the planet.
          </Value>
          <Value icon={<Sparkles className="h-5 w-5" />} title="Delightfully simple">
            Beautiful recipes and a clear path to dinner.
          </Value>
        </div>
      </section>
    </SiteLayout>
  );
}

function Value({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">{icon}</div>
      <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
