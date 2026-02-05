"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import Head from "next/head";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowDown,
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
  Sparkles,
  Scan,
  Clipboard,
  ListChecks,
  Users,
  Building2,
  Shield,
  Server,
  CloudUpload,
  Timer,
  BadgeCheck,
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
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        if (reducedMotion) {
          setVal(target);
          return;
        }
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

type RevealVariant = "up" | "left" | "right" | "scale";

const reveal = (delay = 0, variant: RevealVariant = "up") =>
  ({
    "data-reveal": variant,
    style: { "--reveal-delay": `${delay}ms` } as CSSProperties,
  }) as HTMLAttributes<HTMLElement>;

type CountUpStatProps = {
  value: number;
  label: string;
  description?: string;
  prefix?: string;
  suffix?: string;
  align?: "left" | "center";
  delay?: number;
  size?: "md" | "lg";
};

function CountUpStat({
  value,
  label,
  description,
  prefix = "",
  suffix = "",
  align = "center",
  delay = 0,
  size = "lg",
}: CountUpStatProps) {
  const { ref, val } = useCountUp(value);
  return (
    <div
      ref={ref}
      className={`space-y-2 ${
        align === "center" ? "text-center" : "text-left"
      }`}
      {...reveal(delay)}
    >
      <p
        className={`font-extrabold text-primary ${
          size === "lg" ? "text-3xl sm:text-5xl" : "text-2xl sm:text-4xl"
        }`}
      >
        {prefix}
        {val.toLocaleString()}
        {suffix}
      </p>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

const rotatingA = ["clutter", "chaos", "mess", "mystery"];
const rotatingB = ["control", "order", "clarity", "peace"];

const features = [
  {
    icon: <Archive size={24} />,
    title: "Boxes & items",
    desc: "Name every box, attach photos, and keep receipts together.",
  },
  {
    icon: <Search size={24} />,
    title: "Instant search",
    desc: "Find items by room, tag, or photo in seconds.",
  },
  {
    icon: <QrCode size={24} />,
    title: "QR Labels",
    desc: "Generate labels that open exact box contents.",
  },
  {
    icon: <Truck size={24} />,
    title: "Moving mode",
    desc: "Track packed, transit, and unpacked status.",
  },
  {
    icon: <Users size={24} />,
    title: "Shared access",
    desc: "Invite family or teams with roles and permissions.",
  },
  {
    icon: <Database size={24} />,
    title: "CSV export",
    desc: "Insurance-ready exports and audit history.",
  },
  {
    icon: <Sparkles size={24} />,
    title: "Smart tags",
    desc: "Tag by season, warranty, or donor in one tap.",
  },
  {
    icon: <ListChecks size={24} />,
    title: "Audit trail",
    desc: "Run quick audits with discrepancy history.",
  },
  {
    icon: <Shield size={24} />,
    title: "Secure vault",
    desc: "Private by default with row-level access.",
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
  {
    icon: <Building2 size={28} />,
    h: "Property managers",
    p: "Standardize unit turnover.",
  },
  {
    icon: <Users size={28} />,
    h: "Family archives",
    p: "Share heirloom locations.",
  },
];

const workflowSteps = [
  {
    icon: <Scan size={24} />,
    title: "Capture",
    desc: "Snap photos, assign rooms, and tag items as you go.",
  },
  {
    icon: <Clipboard size={24} />,
    title: "Catalog",
    desc: "Add quantities, receipts, and warranty dates.",
  },
  {
    icon: <ListChecks size={24} />,
    title: "Validate",
    desc: "Run quick audits and fix discrepancies in minutes.",
  },
  {
    icon: <Truck size={24} />,
    title: "Move",
    desc: "Track packed, transit, and unpacked status.",
  },
];

const statHighlights = [
  {
    value: 42000,
    label: "Boxes tracked",
    suffix: "+",
    description: "Across homes and storage units.",
  },
  {
    value: 311000,
    label: "Items catalogued",
    suffix: "+",
    description: "Detailed with photos and tags.",
  },
  {
    value: 12600000,
    label: "Photos indexed",
    suffix: "+",
    description: "Searchable by room or label.",
  },
  {
    value: 1800000,
    label: "Monthly scans",
    suffix: "+",
    description: "Fast QR retrievals on demand.",
  },
  {
    value: 4800,
    label: "Moves completed",
    suffix: "+",
    description: "Packed, tracked, and verified.",
  },
  {
    value: 4200000,
    label: "Assets protected",
    prefix: "$",
    suffix: "+",
    description: "Insurance-ready inventory data.",
  },
];

const impactStats = [
  {
    value: 72000,
    label: "Minutes saved",
    suffix: "+",
    description: "Inventory time reclaimed yearly.",
  },
  {
    value: 24000,
    label: "Labels printed",
    suffix: "+",
    description: "Across teams and families.",
  },
  {
    value: 58000,
    label: "Reports exported",
    suffix: "+",
    description: "For audits and claims.",
  },
  {
    value: 32000,
    label: "Weekly searches",
    suffix: "+",
    description: "Items found in seconds.",
  },
];

const carouselTemplates = [
  {
    title: "Kitchen Pantry",
    detail: "84 items - Expiration tracking",
    tags: ["Zones", "Allergens"],
    icon: <Archive size={20} />,
  },
  {
    title: "Garage Tools",
    detail: "212 items - Power tool kits",
    tags: ["Warranty", "Serials"],
    icon: <Package2 size={20} />,
  },
  {
    title: "Holiday Decor",
    detail: "63 items - Seasonal rotation",
    tags: ["Attic", "Fragile"],
    icon: <Layers size={20} />,
  },
  {
    title: "Baby Gear",
    detail: "48 items - Hand-me-downs",
    tags: ["Sizes", "Loaned"],
    icon: <Users size={20} />,
  },
  {
    title: "Office Supplies",
    detail: "126 items - Reorder points",
    tags: ["Vendors", "MOQ"],
    icon: <LayoutDashboard size={20} />,
  },
  {
    title: "Cables & Tech",
    detail: "158 items - Charging kits",
    tags: ["Adapters", "Checked out"],
    icon: <QrCode size={20} />,
  },
  {
    title: "Art Studio",
    detail: "96 items - Mediums & tools",
    tags: ["Projects", "Colors"],
    icon: <Archive size={20} />,
  },
  {
    title: "Storage Unit",
    detail: "320 items - Multi-row map",
    tags: ["Rows", "Pallets"],
    icon: <MapPin size={20} />,
  },
];

const operationalChecks = [
  "Room and bin hierarchy with custom labels.",
  "Photo annotations, receipts, and warranty dates.",
  "Move checklists with timestamped status.",
  "Share links with time-boxed access.",
];

const securityPillars = [
  {
    icon: <ShieldCheck size={20} />,
    title: "Private by default",
    desc: "Row-level protection keeps every inventory isolated.",
  },
  {
    icon: <Server size={20} />,
    title: "Resilient storage",
    desc: "Daily backups with multi-region resilience.",
  },
  {
    icon: <CloudUpload size={20} />,
    title: "Fast sync",
    desc: "Low-latency updates across devices.",
  },
  {
    icon: <BadgeCheck size={20} />,
    title: "Audit-ready",
    desc: "Exportable history for insurance and compliance.",
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
    msg: "Boxed turned my cramped dorm into a cataloged studio with instant recall.",
  },
  {
    name: "Priya S.",
    role: "Maker & Etsy seller",
    msg: "I locate beads and fabrics in seconds. My storage finally makes sense.",
  },
  {
    name: "Martin B.",
    role: "Storage facility manager",
    msg: "Customers love scanning QR codes and finding items immediately.",
  },
  {
    name: "Lena P.",
    role: "Operations manager",
    msg: "Our audit prep time dropped dramatically with Boxed exports.",
  },
  {
    name: "Carlos D.",
    role: "Freelance photographer",
    msg: "Tracking gear across shoots used to be a nightmare. Not anymore.",
  },
  {
    name: "Aisha R.",
    role: "New homeowner",
    msg: "Moving was stress-free. I knew exactly where everything was packed.",
  },
];

const pricing = [
  {
    tier: "Starter",
    price: "$0",
    desc: "For personal spaces and first-time movers.",
    perk: ["Unlimited boxes", "500 items", "QR labels"],
  },
  {
    tier: "Plus",
    price: "$4",
    desc: "For households that want full history.",
    perk: ["Unlimited items", "CSV export", "Dark‑mode themes"],
  },
  {
    tier: "Pro",
    price: "$9",
    desc: "For teams and multi-location inventory.",
    perk: ["Family sharing", "Priority support", "S3 photo backups"],
  },
];

const faqs = [
  { q: "Is Boxed free?", a: "Yes - the Starter plan is free forever." },
  { q: "Who can see my data?", a: "Only you (and those you invite)." },
  { q: "Will my counts sync offline?", a: "Yes - the PWA caches data." },
  { q: "Do QR codes need internet?", a: "No - content is cached locally." },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    if (!elements.length) return;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) {
      elements.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
    );
    elements.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

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
          <div className="relative z-10 flex min-h-[70svh] flex-col justify-center overflow-hidden rounded-[inherit] bg-background/80 px-6 py-16 text-center backdrop-blur-md sm:min-h-[75svh] sm:py-20 md:min-h-[80svh] md:py-24">
            <div
              className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-muted-foreground badge-shine float-slow"
              {...reveal(0, "scale")}
            >
              <Sparkles size={14} className="text-primary" />
              Inventory operations, elevated
            </div>
            <h1
              className="mx-auto max-w-xl text-4xl font-extrabold leading-tight tracking-tight sm:max-w-2xl sm:text-5xl md:text-6xl lg:text-7xl"
              {...reveal(80)}
            >
              Turn <span className="text-primary">{rotatingA[idx]}</span> into{" "}
              <span className="text-primary">{rotatingB[idx]}</span>
              <br />
              with Boxed
            </h1>

            <p
              className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg"
              {...reveal(140)}
            >
              Know what’s in every box, drawer, or storage unit without lifting
              a lid. Keep photos, receipts, and warranty dates in one place.
              Find anything you own in seconds with a clean, audit-ready trail.
            </p>

            <div
              className="mx-auto mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground"
              {...reveal(200)}
            >
              {[
                "Photo-first catalog",
                "Role-based sharing",
                "Offline-friendly search",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-full border bg-background/70 px-4 py-2"
                >
                  <Check size={14} className="text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div
              className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
              {...reveal(260)}
            >
              <Link href="/register">
                <Button
                  size="lg"
                  className="group transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Get started
                  <ArrowRight
                    size={18}
                    className=" transition group-hover:translate-x-1"
                  />
                </Button>
              </Link>
              <Link href="#stats">
                <Button
                  variant="outline"
                  size="lg"
                  className="group transition hover:-translate-y-0.5"
                >
                  Learn More
                  <ArrowDown
                    size={18}
                    className="transition group-hover:translate-y-0.5"
                  />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section id="stats" className="w-full max-w-6xl px-4">
          <div className="mb-10 text-center" {...reveal(0)}>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Inventory at scale
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Live activity across active Boxed workspaces.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {statHighlights.map((s, i) => (
              <CountUpStat
                key={s.label}
                value={s.value}
                label={s.label}
                prefix={s.prefix}
                suffix={s.suffix}
                description={s.description}
                delay={80 * i}
              />
            ))}
          </div>
        </section>

        {/* Workflow */}
        <section className="w-full max-w-7xl px-4">
          <div className="mb-10 text-center" {...reveal(0)}>
            <h2 className="text-3xl font-bold sm:text-4xl">
              A repeatable workflow
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Capture once, find forever. Every step is designed for clarity.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {workflowSteps.map((step, i) => (
              <div
                key={step.title}
                className="group relative flex h-full flex-col gap-3 rounded-2xl border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                {...reveal(80 * i, i % 2 === 0 ? "left" : "right")}
              >
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  <span>Step {String(i + 1).padStart(2, "0")}</span>
                  <Timer size={16} className="text-primary" />
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-background text-primary">
                  {step.icon}
                </div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Feature grid */}
        <section id="features" className="w-full max-w-7xl px-4">
          <div className="mb-10 text-center" {...reveal(0)}>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Everything you need to stay organized
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Build a single source of truth for every box, bin, and storage
              location.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group relative flex flex-col gap-3 overflow-hidden rounded-xl border bg-card p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                {...reveal(50 * i, i % 2 === 0 ? "up" : "scale")}
              >
                <div className="text-primary transition group-hover:opacity-80">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Use‑cases */}
        <section className="w-full max-w-7xl px-4">
          <div className="mb-8 text-center" {...reveal(0)}>
            <h2 className="text-3xl font-bold">Perfect for...</h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              One workspace for every space you manage.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {useCases.map((c, i) => (
              <div
                key={c.h}
                className="flex flex-col gap-3 rounded-xl border bg-card p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                {...reveal(60 * i, i % 2 === 0 ? "left" : "right")}
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

        {/* Operational detail */}
        <section className="w-full max-w-7xl px-4">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-6">
              <div {...reveal(0, "left")}>
                <h2 className="text-3xl font-bold sm:text-4xl">
                  Operational clarity, end to end
                </h2>
                <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                  Boxed keeps every inventory action traceable. From first photo
                  to final unpack, you always know what changed, when it
                  changed, and who made the update.
                </p>
              </div>
              <div className="grid gap-3">
                {operationalChecks.map((item, i) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-xl border bg-card/70 px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    {...reveal(80 * i, "left")}
                  >
                    <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border bg-background text-primary">
                      <Check size={14} />
                    </div>
                    <p className="text-sm text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="rounded-2xl border bg-card p-8 shadow-sm"
              {...reveal(120, "right")}
            >
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Operational impact
                </p>
                <h3 className="mt-2 text-2xl font-bold">
                  Big numbers, real efficiency
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Measurable gains from teams who inventory at scale.
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                {impactStats.map((stat, i) => (
                  <CountUpStat
                    key={stat.label}
                    value={stat.value}
                    label={stat.label}
                    suffix={stat.suffix}
                    description={stat.description}
                    align="left"
                    size="md"
                    delay={80 * i}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Templates carousel */}
        <section className="w-full max-w-7xl px-4">
          <div
            className="flex flex-col gap-3 text-center md:text-left"
            {...reveal(0)}
          >
            <h2 className="text-3xl font-bold sm:text-4xl">
              Ready-to-use templates
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              Start fast with proven layouts, or build your own.
            </p>
          </div>
          <div className="mt-8 overflow-x-auto overflow-y-visible snap-x snap-mandatory scroll-px-6">
            <div className="flex w-full gap-6 px-4 py-6">
              {carouselTemplates.map((card, i) => (
                <div
                  key={card.title}
                  className="min-w-[240px] shrink-0 snap-center rounded-2xl border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:min-w-[280px]"
                  {...reveal(60 * i, i % 2 === 0 ? "up" : "scale")}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-background text-primary">
                      {card.icon}
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Template
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{card.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {card.detail}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {card.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border bg-background px-3 py-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tech stack */}
        <section className="w-full max-w-6xl px-4">
          <div className="mb-8 text-center" {...reveal(0)}>
            <h2 className="text-3xl font-bold">Powered by</h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Modern, secure infrastructure built for speed.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {techStack.map((t, i) => (
              <div
                key={t.label}
                className="flex flex-col items-center gap-1 opacity-90 hover:opacity-100"
                {...reveal(50 * i, "scale")}
              >
                {t.icon}
                <span className="text-xs text-muted-foreground">{t.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="w-full max-w-7xl px-4">
          <div className="mb-8 text-center" {...reveal(0)}>
            <h2 className="text-3xl font-bold">Loved by teams everywhere</h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Clean workflows, faster retrievals, fewer surprises.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className="rounded-xl border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                {...reveal(60 * i, i % 2 === 0 ? "left" : "right")}
              >
                <Star size={18} className="text-yellow-400" />
                <p className="my-4 italic">&ldquo;{t.msg}&rdquo;</p>
                <p className="font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Security */}
        <section className="w-full max-w-7xl px-4">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div {...reveal(0, "left")}>
                <h2 className="text-3xl font-bold sm:text-4xl">
                  Security & governance
                </h2>
                <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                  Built for personal use and professional operations. Your data
                  stays private, backed up, and fully exportable.
                </p>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {securityPillars.map((pillar, i) => (
                  <div
                    key={pillar.title}
                    className="rounded-2xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    {...reveal(60 * i, i % 2 === 0 ? "left" : "right")}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-background text-primary">
                      {pillar.icon}
                    </div>
                    <h3 className="mt-3 font-semibold">{pillar.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {pillar.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="rounded-2xl border bg-card p-8 shadow-sm"
              {...reveal(120, "right")}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-background text-primary">
                  <Shield size={22} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Compliance snapshot
                  </p>
                  <h3 className="text-xl font-bold">
                    Always-on data stewardship
                  </h3>
                </div>
              </div>
              <div className="mt-6 grid gap-4 text-sm text-muted-foreground">
                {[
                  "MFA-ready access controls with role permissions.",
                  "Exports available in CSV for claims and audits.",
                  "Data ownership remains with the account owner.",
                  "Retention policies configurable by workspace.",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-xl border bg-background px-4 py-3"
                  >
                    <Check size={14} className="mt-0.5 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="w-full max-w-7xl px-4">
          <div className="mb-10 text-center" {...reveal(0)}>
            <h2 className="text-3xl font-bold">Pricing</h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Absolutely <b>free during beta</b> - upgrades later.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {pricing.map((p, i) => (
              <div
                key={p.tier}
                className="flex flex-col gap-4 rounded-xl border bg-card p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                {...reveal(60 * i, i % 2 === 0 ? "left" : "right")}
              >
                <h3 className="text-xl font-bold">{p.tier}</h3>
                <p className="text-sm text-muted-foreground">{p.desc}</p>
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

        {/*/!* Roadmap *!/*/}
        {/*<section className="w-full max-w-6xl px-4">*/}
        {/*  <div className="mb-8 text-center" {...reveal(0)}>*/}
        {/*    <h2 className="text-3xl font-bold">Roadmap</h2>*/}
        {/*    <p className="mt-3 text-sm text-muted-foreground sm:text-base">*/}
        {/*      The next milestones on the Boxed roadmap.*/}
        {/*    </p>*/}
        {/*  </div>*/}
        {/*  <div className="relative border-l pl-6">*/}
        {/*    {roadmap.map((r, i) => (*/}
        {/*      <div*/}
        {/*        key={r.q}*/}
        {/*        className="mb-8 flex gap-4"*/}
        {/*        {...reveal(60 * i, i % 2 === 0 ? "left" : "right")}*/}
        {/*      >*/}
        {/*        <span className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-primary" />*/}
        {/*        <Calendar*/}
        {/*          size={18}*/}
        {/*          className="text-muted-foreground shrink-0"*/}
        {/*        />*/}
        {/*        <div>*/}
        {/*          <p className="font-semibold">{r.q}</p>*/}
        {/*          <p className="text-sm text-muted-foreground">{r.t}</p>*/}
        {/*        </div>*/}
        {/*      </div>*/}
        {/*    ))}*/}
        {/*  </div>*/}
        {/*</section>*/}

        {/* FAQ */}
        <section className="w-full max-w-5xl px-4">
          <div className="mb-8 text-center" {...reveal(0)}>
            <h2 className="text-3xl font-bold">FAQ</h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Quick answers to the most common questions.
            </p>
          </div>
          <Accordion type="single" collapsible>
            {faqs.map((f, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border-b py-3"
                {...reveal(60 * i, i % 2 === 0 ? "left" : "right")}
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
        <section
          className="w-full max-w-6xl rounded-2xl bg-gradient-to-br from-primary via-accent to-secondary p-[2px]"
          {...reveal(0, "scale")}
        >
          <div className="flex flex-col items-center justify-between gap-6 rounded-[inherit] bg-background px-8 py-14 md:flex-row">
            <div>
              <h3 className="mb-1 text-2xl font-bold md:text-3xl">
                Ready to get organized?
              </h3>
              <p className="text-muted-foreground">
                Sign up and start organizing - free while in beta.
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

          /* reveal animations */
          [data-reveal] {
            opacity: 0;
            translate: 0 16px;
            scale: 0.98;
            filter: blur(0.4px);
            transition:
              opacity 700ms ease,
              translate 700ms ease,
              scale 700ms ease,
              filter 700ms ease;
            transition-delay: var(--reveal-delay, 0ms);
          }
          [data-reveal="left"] {
            translate: -16px 12px;
          }
          [data-reveal="right"] {
            translate: 16px 12px;
          }
          [data-reveal="scale"] {
            scale: 0.96;
            translate: 0 10px;
          }
          [data-reveal].is-visible {
            opacity: 1;
            translate: 0 0;
            scale: 1;
            filter: blur(0);
          }

          /* badge shimmer */
          .badge-shine {
            background: linear-gradient(
              120deg,
              rgba(255, 255, 255, 0.3),
              rgba(255, 255, 255, 0.05),
              rgba(255, 255, 255, 0.25)
            );
            background-size: 200% 200%;
            animation: badge-shine 8s ease infinite;
          }
          @keyframes badge-shine {
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

          /* subtle float */
          @keyframes float {
            0%,
            100% {
              transform: translate3d(0, 0, 0);
            }
            50% {
              transform: translate3d(0, -6px, 0);
            }
          }
          .float-slow {
            animation: float 8s ease-in-out infinite;
          }

          @media (prefers-reduced-motion: reduce) {
            .animate-blob,
            .animated-border::before,
            .badge-shine,
            .float-slow {
              animation: none;
            }
            [data-reveal] {
              opacity: 1;
              translate: none;
              scale: 1;
              filter: none;
              transition: none;
            }
          }
        `}</style>
      </main>
    </>
  );
}
