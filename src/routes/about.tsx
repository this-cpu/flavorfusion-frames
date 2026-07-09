import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/Layouts";
import { Heart, Leaf, Sparkles } from "lucide-react";

export const Route = createFileRoute("/about")({
  component: About,
});

const team = [
  { name: "Aria Bennett", role: "Founder & Chef", img: "https://i.pravatar.cc/200?img=32" },
  { name: "Marco Bianchi", role: "Head of Product", img: "https://i.pravatar.cc/200?img=15" },
  { name: "Ploy Suwan", role: "Food Editor", img: "https://i.pravatar.cc/200?img=25" },
  { name: "Kaito Mori", role: "Engineer", img: "https://i.pravatar.cc/200?img=12" },
];

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
            Every feature is designed by people who actually cook — no lorem ipsum kitchens.
          </Value>
          <Value icon={<Leaf className="h-5 w-5" />} title="Real & seasonal">
            We celebrate recipes that respect ingredients, seasons, and the planet.
          </Value>
          <Value icon={<Sparkles className="h-5 w-5" />} title="Delightfully simple">
            No 3,000 word intros. Just a beautiful recipe and a clear path to dinner.
          </Value>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <img
            src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=70"
            alt=""
            className="rounded-3xl object-cover shadow-warm"
          />
          <div>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">
              Cooking is a conversation between hands, heat, and time.
            </h2>
            <p className="mt-4 text-muted-foreground">
              We built Saveur to make that conversation easier — quicker to plan,
              simpler to follow, and prettier to share. Whether you're a first-year
              student roasting your first chicken or a seasoned home cook building
              a personal cookbook, Saveur grows with you.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl font-semibold">Meet the team</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          {team.map((t) => (
            <div key={t.name} className="rounded-2xl border bg-card p-4 text-center">
              <img src={t.img} alt="" className="mx-auto h-20 w-20 rounded-full object-cover" />
              <p className="mt-4 font-medium">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.role}</p>
            </div>
          ))}
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
