import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, MessageSquare, Phone } from "lucide-react";
import { SiteLayout } from "@/components/Layouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/contact")({
  component: Contact,
});

function Contact() {
  const [open, setOpen] = useState(false);
  return (
    <SiteLayout>
      <section className="bg-hero">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Say hi</p>
          <h1 className="mt-3 font-display text-5xl font-semibold sm:text-6xl">
            Let's talk food.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Have feedback, a partnership idea, or a recipe you'd love us to feature? We'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-20 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          <ContactCard icon={<Mail className="h-5 w-5" />} title="Email" value="hello@saveur.app" />
          <ContactCard icon={<Phone className="h-5 w-5" />} title="Phone" value="+1 (415) 555-0184" />
          <ContactCard icon={<MapPin className="h-5 w-5" />} title="Studio" value="14 Baker Street, Lisbon" />
          <ContactCard icon={<MessageSquare className="h-5 w-5" />} title="Live chat" value="Mon–Fri, 9–6 CET" />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setOpen(true);
          }}
          className="rounded-3xl border bg-card p-8 shadow-soft"
        >
          <h2 className="font-display text-2xl font-semibold">Send us a message</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cemail">Email</Label>
              <Input id="cemail" type="email" placeholder="you@example.com" />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="What's this about?" />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="msg">Message</Label>
              <Textarea id="msg" rows={5} placeholder="Type your message..." />
            </div>
          </div>
          <Button type="submit" size="lg" className="mt-6 w-full rounded-full sm:w-auto">
            Send message
          </Button>
        </form>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message sent 🎉</DialogTitle>
            <DialogDescription>
              Thanks for reaching out. We'll get back to you within a couple of business days.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setOpen(false)} className="rounded-full">Great</Button>
          </div>
        </DialogContent>
      </Dialog>
    </SiteLayout>
  );
}

function ContactCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border bg-card p-5">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">{icon}</div>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
