"use client";

import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import {
  ArrowUpRight,
  BarChart3,
  Box,
  Boxes,
  Clock3,
  DollarSign,
  Lightbulb,
  MapPin,
  Package,
  PackageSearch,
  TrendingDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getAccessibleBoxes } from "@/supabase/queries/boxes";
import { getItemsByBox } from "@/supabase/queries/items";
import type { Box as BoxType, Item } from "@/supabase/types";

const numberFormatter = new Intl.NumberFormat("en-US");
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const statusLabels: Record<BoxType["status"], string> = {
  packed: "Packed",
  unpacked: "Unpacked",
  in_transit: "In transit",
};

type BoxWithItems = {
  box: BoxType;
  items: Item[];
};

type InventoryInsights = {
  totals: {
    boxes: number;
    items: number;
    quantity: number;
    avgPerBox: number;
    totalValue: number;
  };
  statuses: Array<{
    status: BoxType["status"];
    count: number;
    percentage: number;
  }>;
  locationBreakdown: Array<{
    location: string;
    boxes: number;
    items: number;
    quantity: number;
  }>;
  conditionBreakdown: Array<{
    condition: string;
    count: number;
    percentage: number;
  }>;
  lowStock: Array<{ item: Item; box?: BoxType }>;
  valuableItems: Array<{ item: Item; box?: BoxType }>;
  staleItems: Array<{ item: Item; box?: BoxType; daysSince: number }>;
  highlights: {
    highestQuantity?: { box: BoxType; items: number; quantity: number };
    highestValue?: { box: BoxType; items: number; value: number };
  };
};

const LOW_STOCK_THRESHOLD = 2;
const STALE_DAYS = 180;

export default function InsightsPage() {
  const { session, isLoading: authLoading } = useSessionContext();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<InventoryInsights | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!session?.user?.id) return;

    const loadInsights = async () => {
      try {
        setLoading(true);
        const accessibleBoxes = await getAccessibleBoxes(session.user.id);
        const boxesWithItems: BoxWithItems[] = await Promise.all(
          accessibleBoxes.map(async (box) => ({
            box,
            items: await getItemsByBox(box.id),
          })),
        );

        const allItems = boxesWithItems.flatMap((entry) => entry.items);
        const totalBoxes = boxesWithItems.length;
        const totalItems = allItems.length;
        const totalQuantity = allItems.reduce(
          (acc, item) => acc + (item.quantity ?? 0),
          0,
        );
        const totalValue = allItems.reduce(
          (acc, item) => acc + (item.value ?? 0),
          0,
        );

        const statuses = (Object.keys(statusLabels) as Array<BoxType["status"]>)
          .map((status) => {
            const count = boxesWithItems.filter(
              (entry) => entry.box.status === status,
            ).length;
            const percentage = totalBoxes
              ? Math.round((count / totalBoxes) * 100)
              : 0;
            return { status, count, percentage };
          })
          .filter((entry) => entry.count > 0)
          .sort((a, b) => b.count - a.count);

        const locationAggregates = new Map<
          string,
          { boxIds: Set<string>; items: number; quantity: number }
        >();
        boxesWithItems.forEach(({ box, items }) => {
          const key = box.location?.trim() || "Unassigned";
          if (!locationAggregates.has(key)) {
            locationAggregates.set(key, {
              boxIds: new Set<string>(),
              items: 0,
              quantity: 0,
            });
          }
          const current = locationAggregates.get(key)!;
          current.boxIds.add(box.id);
          current.items += items.length;
          current.quantity += items.reduce(
            (acc, item) => acc + (item.quantity ?? 0),
            0,
          );
        });
        const locationBreakdown = Array.from(locationAggregates.entries())
          .map(([location, data]) => ({
            location,
            boxes: data.boxIds.size,
            items: data.items,
            quantity: data.quantity,
          }))
          .sort((a, b) => b.quantity - a.quantity);

        const conditionAggregates = new Map<string, number>();
        allItems.forEach((item) => {
          const key = item.condition?.trim() || "Unspecified";
          conditionAggregates.set(
            key,
            (conditionAggregates.get(key) ?? 0) + 1,
          );
        });
        const conditionBreakdown = Array.from(conditionAggregates.entries())
          .map(([condition, count]) => ({
            condition,
            count,
            percentage: totalItems ? Math.round((count / totalItems) * 100) : 0,
          }))
          .sort((a, b) => b.count - a.count);

        const lowStock = allItems
          .filter((item) => (item.quantity ?? 0) <= LOW_STOCK_THRESHOLD)
          .sort((a, b) => (a.quantity ?? 0) - (b.quantity ?? 0))
          .slice(0, 12)
          .map((item) => ({
            item,
            box: boxesWithItems.find((entry) => entry.box.id === item.box_id)?.box,
          }));

        const valuableItems = allItems
          .filter((item) => typeof item.value === "number" && item.value > 0)
          .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
          .slice(0, 8)
          .map((item) => ({
            item,
            box: boxesWithItems.find((entry) => entry.box.id === item.box_id)?.box,
          }));

        const now = Date.now();
        const staleItems = allItems
          .map((item) => {
            if (!item.last_used) return null;
            const lastUsed = new Date(item.last_used);
            if (Number.isNaN(lastUsed.getTime())) return null;
            const daysSince = Math.floor(
              (now - lastUsed.getTime()) / (1000 * 60 * 60 * 24),
            );
            if (daysSince < STALE_DAYS) return null;
            return {
              item,
              box: boxesWithItems.find((entry) => entry.box.id === item.box_id)?.box,
              daysSince,
            };
          })
          .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
          .sort((a, b) => b.daysSince - a.daysSince)
          .slice(0, 8);

        const boxSummaries = boxesWithItems.map(({ box, items }) => {
          const quantity = items.reduce(
            (acc, item) => acc + (item.quantity ?? 0),
            0,
          );
          const value = items.reduce(
            (acc, item) => acc + (item.value ?? 0),
            0,
          );
          return { box, items: items.length, quantity, value };
        });

        const highestQuantity = boxSummaries
          .slice()
          .sort((a, b) => b.quantity - a.quantity)[0];
        const highestValue = boxSummaries
          .slice()
          .sort((a, b) => b.value - a.value)[0];

        setInsights({
          totals: {
            boxes: totalBoxes,
            items: totalItems,
            quantity: totalQuantity,
            avgPerBox: totalBoxes ? totalQuantity / totalBoxes : 0,
            totalValue,
          },
          statuses,
          locationBreakdown,
          conditionBreakdown,
          lowStock,
          valuableItems,
          staleItems,
          highlights: {
            highestQuantity,
            highestValue,
          },
        });
      } catch (error) {
        console.error(error);
        toast.error("Unable to load inventory insights right now.");
        setInsights(null);
      } finally {
        setLoading(false);
      }
    };

    void loadInsights();
  }, [authLoading, session]);

  const locationTotalQuantity = useMemo(() => {
    return insights?.locationBreakdown.reduce(
      (acc, entry) => acc + entry.quantity,
      0,
    );
  }, [insights]);

  if (!session) {
    return (
      <div className="container mx-auto px-6 py-12 text-center text-muted-foreground">
        Please sign in to view insights.
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Inventory Insights - Boxed</title>
        <meta
          name="description"
          content="Understand your storage at a glance with smart trends, health checks, and opportunities to tidy up."
        />
      </Head>

      <div className="container mx-auto px-6 py-10 space-y-10">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Lightbulb className="h-3.5 w-3.5" />
              Smart overview
            </div>
            <h1 className="text-3xl font-bold sm:text-4xl">Inventory insights</h1>
            <p className="max-w-2xl text-muted-foreground">
              Surface trends, spot risks, and celebrate wins in your collection.
              Every chart is generated live from the boxes you own or collaborate on.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowUpRight className="mr-2 h-4 w-4" /> Back to dashboard
              </Button>
            </Link>
            <Link href="/boxes/new">
              <Button>
                <Package className="mr-2 h-4 w-4" /> Add another box
              </Button>
            </Link>
          </div>
        </header>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-20" />
                </CardHeader>
                <CardContent className="pb-6">
                  <Skeleton className="h-3 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !insights ? (
          <Card>
            <CardHeader>
              <CardTitle>Nothing to analyze yet</CardTitle>
              <CardDescription>
                Add a few boxes and items to unlock personalized insights.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <Link href="/boxes/new">
                <Button>
                  <Package className="mr-2 h-4 w-4" /> Create your first box
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base font-medium">
                    <Boxes className="h-4 w-4 text-primary" /> Total boxes
                  </CardTitle>
                  <CardDescription>Distinct storage containers you can access.</CardDescription>
                </CardHeader>
                <CardContent className="pb-6 text-3xl font-semibold">
                  {numberFormatter.format(insights.totals.boxes)}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base font-medium">
                    <PackageSearch className="h-4 w-4 text-primary" /> Items tracked
                  </CardTitle>
                  <CardDescription>Total unique catalogued things.</CardDescription>
                </CardHeader>
                <CardContent className="pb-6 text-3xl font-semibold">
                  {numberFormatter.format(insights.totals.items)}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base font-medium">
                    <BarChart3 className="h-4 w-4 text-primary" /> Pieces on hand
                  </CardTitle>
                  <CardDescription>Combined quantity across every item.</CardDescription>
                </CardHeader>
                <CardContent className="pb-6 space-y-1">
                  <div className="text-3xl font-semibold">
                    {numberFormatter.format(insights.totals.quantity)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Avg. {numberFormatter.format(Math.round(insights.totals.avgPerBox || 0))} per box
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base font-medium">
                    <DollarSign className="h-4 w-4 text-primary" /> Estimated value
                  </CardTitle>
                  <CardDescription>Sum of item values you&apos;ve entered.</CardDescription>
                </CardHeader>
                <CardContent className="pb-6 space-y-1">
                  <div className="text-3xl font-semibold">
                    {currencyFormatter.format(insights.totals.totalValue)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Track values for insurance or donations.
                  </p>
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" /> Box health
                  </CardTitle>
                  <CardDescription>
                    Current status mix and hotspots where things are piling up.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6 space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Status spread
                      </h3>
                      {insights.statuses.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          We&apos;ll chart statuses once you label your boxes.
                        </p>
                      ) : (
                        <ul className="space-y-3">
                          {insights.statuses.map((entry) => (
                            <li key={entry.status} className="space-y-1">
                              <div className="flex items-center justify-between text-sm font-medium">
                                <span>{statusLabels[entry.status]}</span>
                                <span>{entry.count} • {entry.percentage}%</span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-muted">
                                <div
                                  className="h-2 rounded-full bg-primary"
                                  style={{ width: `${Math.max(entry.percentage, 4)}%` }}
                                />
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Condition overview
                      </h3>
                      {insights.conditionBreakdown.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Add condition tags to see this chart fill in.
                        </p>
                      ) : (
                        <ul className="space-y-3">
                          {insights.conditionBreakdown.map((entry) => (
                            <li key={entry.condition} className="space-y-1">
                              <div className="flex items-center justify-between text-sm font-medium">
                                <span>{entry.condition}</span>
                                <span>{entry.count} • {entry.percentage}%</span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-muted">
                                <div
                                  className="h-2 rounded-full bg-primary/80"
                                  style={{ width: `${Math.max(entry.percentage, 4)}%` }}
                                />
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Storage hotspots
                    </h3>
                    {insights.locationBreakdown.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Assign locations to your boxes to see where things live.
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {insights.locationBreakdown.map((entry) => {
                          const percentage = locationTotalQuantity
                            ? Math.round((entry.quantity / locationTotalQuantity) * 100)
                            : 0;
                          return (
                            <li key={entry.location} className="space-y-1">
                              <div className="flex items-center justify-between text-sm font-medium">
                                <span className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-primary" />
                                  {entry.location}
                                </span>
                                <span>{percentage}%</span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-muted">
                                <div
                                  className="h-2 rounded-full bg-primary/60"
                                  style={{ width: `${Math.max(percentage, 4)}%` }}
                                />
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {entry.boxes} boxes • {entry.items} items • {entry.quantity} pcs
                              </p>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Box className="h-4 w-4 text-primary" /> Box highlights
                  </CardTitle>
                  <CardDescription>Your densest and most valuable boxes right now.</CardDescription>
                </CardHeader>
                <CardContent className="pb-6 space-y-4 text-sm">
                  {insights.highlights.highestQuantity ? (
                    <div className="rounded-lg border p-4">
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        Most packed
                      </p>
                      <p className="mt-1 text-base font-semibold">
                        {insights.highlights.highestQuantity.box.name}
                      </p>
                      <p className="text-muted-foreground">
                        {numberFormatter.format(insights.highlights.highestQuantity.quantity)} pieces • {insights.highlights.highestQuantity.items} unique items
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      We&apos;ll spotlight your densest box once items are catalogued.
                    </p>
                  )}

                  {insights.highlights.highestValue ? (
                    <div className="rounded-lg border p-4">
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        Highest declared value
                      </p>
                      <p className="mt-1 text-base font-semibold">
                        {insights.highlights.highestValue.box.name}
                      </p>
                      <p className="text-muted-foreground">
                        {currencyFormatter.format(insights.highlights.highestValue.value)} across {insights.highlights.highestValue.items} items
                      </p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-primary" /> Low stock watchlist
                  </CardTitle>
                  <CardDescription>
                    Items at or below {LOW_STOCK_THRESHOLD} units. Time to restock or retire.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  {insights.lowStock.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Everything is well stocked. Nice job staying ahead!
                    </p>
                  ) : (
                    <ul className="space-y-4">
                      {insights.lowStock.map(({ item, box }) => (
                        <li key={item.id} className="flex flex-col gap-1 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {box ? box.name : "Unknown box"}
                            </p>
                          </div>
                          <Badge variant="secondary" className="w-fit">
                            {item.quantity ?? 0} left
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" /> Top valued pieces
                  </CardTitle>
                  <CardDescription>
                    Highest declared items help you keep insurance info handy.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  {insights.valuableItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Add estimated values to track what matters most.
                    </p>
                  ) : (
                    <ul className="space-y-4">
                      {insights.valuableItems.map(({ item, box }) => (
                        <li key={item.id} className="flex flex-col gap-1 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {box ? box.name : "Unknown box"}
                            </p>
                          </div>
                          <div className="text-sm font-medium">
                            {currencyFormatter.format(item.value ?? 0)}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </section>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-primary" /> Dormant items
                </CardTitle>
                <CardDescription>
                  Things untouched for {STALE_DAYS}+ days are perfect donation or resale candidates.
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-6">
                {insights.staleItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nothing has gone quiet for that long. Keep logging usage to stay proactive.
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {insights.staleItems.map(({ item, box, daysSince }) => (
                      <li key={item.id} className="flex flex-col gap-1 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {box ? box.name : "Unknown box"}
                          </p>
                        </div>
                        <Badge variant="outline" className="w-fit">
                          {daysSince} days idle
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  );
}
