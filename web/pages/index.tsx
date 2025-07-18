"use client";

import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Archive,
  Search,
  QrCode,
  Package2,
  MapPin,
  Box as BoxIcon,
  Check,
  ShieldCheck,
  Layers,
  LayoutDashboard,
  Database,
  Truck,
  Activity,
  Star,
  Mail,
  Calendar,
} from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

function useCountUp(target: number, duration = 1200) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const step = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          setVal(Math.floor(p * target));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);
  return { ref, val };
}

const rotatingA = ["clutter", "chaos", "mess", "mystery"];
const rotatingB = ["control", "order", "clarity", "peace"];

const features = [
  {
    icon: <Archive size={24} />,
    title: "Boxes & Items",
    desc: "Name every box & add photos.",
  },
  {
    icon: <Search size={24} />,
    title: "Instant search",
    desc: "Locate anything fast.",
  },
  {
    icon: <QrCode size={24} />,
    title: "QR Labels",
    desc: "Scan & view contents.",
  },
  {
    icon: <Truck size={24} />,
    title: "Moving mode",
    desc: "Packed • transit • unpacked.",
  },
  {
    icon: <ShieldCheck size={24} />,
    title: "Shared access",
    desc: "Invite family / friends.",
  },
  {
    icon: <Database size={24} />,
    title: "CSV export",
    desc: "Insurance‑ready backups.",
  },
];

const useCases = [
  {
    icon: <Package2 size={28} />,
    h: "Dorm rooms",
    p: "Track every drawer & bin.",
  },
  {
    icon: <MapPin size={28} />,
    h: "Self‑storage",
    p: "Know what’s in unit B‑12.",
  },
  {
    icon: <LayoutDashboard size={28} />,
    h: "Office supply",
    p: "Stay stocked at work.",
  },
  {
    icon: <Layers size={28} />,
    h: "Makers & crafters",
    p: "Sort fabrics & parts.",
  },
];

const techStack = [
  { icon: <Activity size={24} />, label: "Next 15" },
  { icon: <BoxIcon size={24} />, label: "Supabase" },
  { icon: <QrCode size={24} />, label: "QRCode.react" },
  { icon: <ShieldCheck size={24} />, label: "Tailwind" },
  { icon: <Layers size={24} />, label: "shadcn UI" },
];

const testimonials = [
  {
    name: "Jules K.",
    role: "Film student",
    msg: "Boxed turned my cramped dorm into a catalogued studio cupboard.",
  },
  {
    name: "Priya S.",
    role: "Maker & Etsy seller",
    msg: "I locate beads & fabrics in seconds - no more digging!",
  },
  {
    name: "Martin B.",
    role: "Storage facility manager",
    msg: "Our customers love scanning QR codes on packed boxes.",
  },
];

const pricing = [
  {
    tier: "Starter",
    price: "$0",
    perk: ["Unlimited boxes", "500 items", "QR labels"],
  },
  {
    tier: "Plus",
    price: "$4",
    perk: ["Unlimited items", "CSV export", "Dark‑mode themes"],
  },
  {
    tier: "Pro",
    price: "$9",
    perk: ["Family sharing", "Priority support", "S3 photo backups"],
  },
];

const faqs = [
  { q: "Is Boxed free?", a: "Yes - the Starter plan is free forever." },
  { q: "Who can see my data?", a: "Only you (and those you invite)." },
  { q: "Will my counts sync offline?", a: "Yes - the PWA caches data." },
  { q: "Do QR codes need internet?", a: "No - content is cached locally." },
];

const roadmap = [
  { q: "Q3 ’25", t: "Bulk CSV import" },
  { q: "Q4 ’25", t: "Offline photo capture" },
  { q: "Q1 ’26", t: "iOS & Android apps" },
  { q: "Q2 ’26", t: "Smart suggestions (AI)" },
];

export default function Landing() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setIdx((i) => (i + 1) % rotatingA.length),
      2200,
    );
    return () => clearInterval(id);
  }, []);

  const boxes = useCountUp(42000);
  const items = useCountUp(311000);
  const homes = useCountUp(152);

  return (
    <>
      <Head>
        <title>Boxed - Minimal inventory tracker</title>
        <meta
          name="description"
          content="Find anything you own in seconds. Free, fast & beautifully simple."
        />
      </Head>

      <main className="flex flex-col items-center gap-28 pb-36">
        <section className="relative isolate w-full max-w-6xl overflow-hidden rounded-3xl p-[3px] animated-border">
          {/* Animated gradient blobs */}
          <div className="pointer-events-none absolute -top-48 -left-48 h-96 w-96 rounded-full bg-primary/30 blur-3xl animate-blob" />
          <div className="pointer-events-none absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-secondary/25 blur-3xl animate-blob delay-150" />
          <div className="pointer-events-none absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/20 blur-2xl animate-blob delay-300" />

          {/* Content */}
          <div className="relative z-10 overflow-hidden rounded-[inherit] bg-background/80 px-6 py-32 text-center backdrop-blur-md">
            <h1 className="mx-auto max-w-5xl text-5xl font-extrabold leading-tight tracking-tight md:text-6xl lg:text-7xl">
              Turn&nbsp;
              <span className="text-primary">{rotatingA[idx]}</span>
              &nbsp;into&nbsp;
              <span className="text-primary">{rotatingB[idx]}</span>
              &nbsp;with Boxed
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Know what’s in every box, drawer or storage unit - without lifting
              a lid.
            </p>

            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button
                  size="lg"
                  className="group transition hover:-translate-y-[2px] hover:shadow-lg"
                >
                  Get started
                  <ArrowRight
                    size={18}
                    className="ml-2 transition group-hover:translate-x-1"
                  />
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  variant="outline"
                  size="lg"
                  className="transition hover:-translate-y-[2px]"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid w-full max-w-6xl grid-cols-1 gap-8 text-center sm:grid-cols-3">
          {[
            { ref: boxes.ref, label: "Boxes tracked", val: boxes.val },
            { ref: items.ref, label: "Items catalogued", val: items.val },
            { ref: homes.ref, label: "Countries organized", val: homes.val },
          ].map((s) => (
            <div key={s.label} ref={s.ref} className="space-y-1">
              <p className="text-4xl font-extrabold text-primary">
                {s.val.toLocaleString()}+
              </p>
              <p className="text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </section>

        {/* Feature grid */}
        <section
          id="features"
          className="grid w-full max-w-7xl gap-8 px-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative flex flex-col gap-3 overflow-hidden rounded-xl border bg-card p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="text-primary transition group-hover:opacity-80">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </section>

        {/* Use‑cases */}
        <section className="w-full max-w-7xl px-4">
          <h2 className="mb-8 text-center text-3xl font-bold">
            Perfect for...
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {useCases.map((c) => (
              <div
                key={c.h}
                className="flex flex-col gap-3 rounded-xl border bg-card p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full border bg-background text-primary">
                  {c.icon}
                </div>
                <h3 className="font-semibold">{c.h}</h3>
                <p className="text-sm text-muted-foreground">{c.p}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tech stack */}
        <section className="w-full max-w-6xl px-4">
          <h2 className="mb-8 text-center text-3xl font-bold">Powered by</h2>
          <div className="flex flex-wrap justify-center gap-8">
            {techStack.map((t) => (
              <div
                key={t.label}
                className="flex flex-col items-center gap-1 opacity-90 hover:opacity-100"
              >
                {t.icon}
                <span className="text-xs text-muted-foreground">{t.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="w-full max-w-7xl px-4">
          <h2 className="mb-8 text-center text-3xl font-bold">
            Loved by folks everywhere
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-xl border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <Star size={18} className="text-yellow-400" />
                <p className="my-4 italic">&ldquo;{t.msg}&rdquo;</p>
                <p className="font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="w-full max-w-7xl px-4">
          <h2 className="mb-6 text-center text-3xl font-bold">Pricing</h2>
          <p className="mb-10 text-center text-sm text-muted-foreground">
            Absolutely <b>free during beta</b> - upgrades later.
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            {pricing.map((p) => (
              <div
                key={p.tier}
                className="flex flex-col gap-4 rounded-xl border bg-card p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="text-xl font-bold">{p.tier}</h3>
                <p className="text-4xl font-extrabold text-primary">
                  <span className="line-through opacity-60">{p.price}</span>
                </p>
                <ul className="space-y-2 text-sm">
                  {p.perk.map((perk) => (
                    <li key={perk} className="flex items-center gap-2">
                      <Check size={14} className="text-primary" /> {perk}
                    </li>
                  ))}
                </ul>
                <Button className="mt-auto w-full" disabled>
                  Free now
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Roadmap */}
        <section className="w-full max-w-6xl px-4">
          <h2 className="mb-8 text-center text-3xl font-bold">Roadmap</h2>
          <div className="relative border-l pl-6">
            {roadmap.map((r) => (
              <div key={r.q} className="mb-8 flex gap-4">
                <span className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-primary" />
                <Calendar
                  size={18}
                  className="text-muted-foreground shrink-0"
                />
                <div>
                  <p className="font-semibold">{r.q}</p>
                  <p className="text-sm text-muted-foreground">{r.t}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Newsletter */}
        <section className="w-full max-w-6xl rounded-xl border bg-card p-10 px-4 flex flex-col md:flex-row items-center gap-6">
          <Mail size={32} className="text-primary shrink-0" />
          <div className="flex-1">
            <h3 className="mb-1 text-xl font-bold">Stay in the loop</h3>
            <p className="text-sm text-muted-foreground">
              Monthly release notes • no spam
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const email = (e.currentTarget.email as HTMLInputElement).value;
              e.currentTarget.reset();
              alert(`Thanks! We'll email ${email} soon.`);
            }}
            className="flex w-full gap-2 md:w-auto"
          >
            <input
              name="email"
              required
              type="email"
              placeholder="you@example.com"
              className="flex-1 rounded-full border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary md:w-64"
            />
            <Button type="submit">Subscribe</Button>
          </form>
        </section>

        {/* FAQ */}
        <section className="w-full max-w-5xl px-4">
          <h2 className="mb-8 text-center text-3xl font-bold">FAQ</h2>
          <Accordion type="single" collapsible>
            {faqs.map((f, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border-b py-3"
              >
                <AccordionTrigger className="font-medium hover:text-primary">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* CTA banner */}
        <section className="w-full max-w-6xl rounded-2xl bg-gradient-to-br from-primary via-accent to-secondary p-[2px]">
          <div className="flex flex-col items-center justify-between gap-6 rounded-[inherit] bg-background px-8 py-14 md:flex-row">
            <div>
              <h3 className="mb-1 text-2xl font-bold md:text-3xl">
                Ready to get organized?
              </h3>
              <p className="text-muted-foreground">
                Sign up & start boxing - free while in beta.
              </p>
            </div>
            <Link href="/register">
              <Button
                size="lg"
                className="transition hover:-translate-y-[2px] hover:shadow-lg"
              >
                Create account
              </Button>
            </Link>
          </div>
        </section>

        {/* animated border keyframes */}
        <style jsx>{`
          .animated-border::before {
            content: "";
            position: absolute;
            inset: 0;
            z-index: -1;
            background: linear-gradient(
              135deg,
              var(--color-primary),
              var(--color-accent),
              var(--color-secondary),
              var(--color-primary)
            );
            background-size: 400% 400%;
            animation: border-spin 12s linear infinite;
          }
          @keyframes border-spin {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
        `}</style>

        {/* === Styles === */}
        <style jsx>{`
          /* rainbow border that slowly spins */
          .animated-border::before {
            content: "";
            position: absolute;
            inset: 0;
            z-index: -1;
            background: linear-gradient(
              135deg,
              var(--color-primary),
              var(--color-accent),
              var(--color-secondary),
              var(--color-primary)
            );
            background-size: 400% 400%;
            animation: border-spin 18s linear infinite;
          }
          @keyframes border-spin {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }

          /* drifting blobs */
          @keyframes blob {
            0%,
            100% {
              transform: translate3d(0, 0, 0) scale(1);
            }
            33% {
              transform: translate3d(30%, -20%, 0) scale(1.1);
            }
            66% {
              transform: translate3d(-25%, 25%, 0) scale(0.9);
            }
          }
          .animate-blob {
            animation: blob 28s ease-in-out infinite;
          }
          .delay-150 {
            animation-delay: 6s;
          }
          .delay-300 {
            animation-delay: 12s;
          }
        `}</style>
      </main>
    </>
  );
}
