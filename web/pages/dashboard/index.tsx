"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, useSessionContext } from "@supabase/auth-helpers-react";
import { toast } from "sonner";

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import BoxCard from "@/components/BoxCard";
import ItemCard from "@/components/ItemCard";
import { getBoxesByOwner } from "@/supabase/queries/boxes";
import { getItemsByBox } from "@/supabase/queries/items";
import { searchItems } from "@/supabase/queries/search";
import { getAccessibleBoxes } from "@/supabase/queries/boxes";
import type { Box, Item } from "@/supabase/types";
import {
  Search,
  GripVertical,
  ChevronUp,
  ChevronDown,
  BarChart3,
} from "lucide-react";
import Head from "next/head";

function SortableBoxCard({ id, box }: { id: string; box: Box }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 20 : undefined,
      }}
      {...attributes}
      className="group relative"
    >
      <button
        {...listeners}
        className="absolute right-2 top-2 z-10 inline-flex items-center justify-center rounded p-1 text-muted-foreground opacity-0 transition group-hover:opacity-100 focus:opacity-100 cursor-grab active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <BoxCard box={box} />
    </div>
  );
}

export default function Dashboard() {
  const { session, isLoading: authLoading } = useSessionContext();
  const userId = session?.user.id!;
  const router = useRouter();

  const [boxes, setBoxes] = useState<Box[] | null>(null);
  const [order, setOrder] = useState<string[]>([]);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Item[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchOpen, setSearchOpen] = useState(true);

  const [exporting, setExporting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  useEffect(() => {
    if (!authLoading && !session) {
      router.push("/login");
    }
  }, [authLoading, session, router]);

  const LOCALSTORAGE_KEY = `dashboard-box-order-${userId}`;

  useEffect(() => {
    // wait until auth is initialized
    if (authLoading) return;
    // then bail if there’s no session or no userId
    if (!session || !userId) return;

    (async () => {
      try {
        const fetched = await getAccessibleBoxes(userId);
        setBoxes(fetched);

        // restore saved order, dropping any stale IDs
        const ids = fetched.map((b) => b.id);
        let saved: string[] = [];
        try {
          saved = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY) || "[]");
        } catch {}
        const kept = saved.filter((id) => ids.includes(id));
        const added = ids.filter((id) => !kept.includes(id));
        setOrder([...kept, ...added]);
      } catch (err) {
        console.error(err);
        toast.error("Could not load boxes.");
      }
    })();
  }, [authLoading, session, userId]);

  const handleDragStart = (_e: DragStartEvent) => {};
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !boxes) return;
    const oldIndex = order.indexOf(active.id as string);
    const newIndex = order.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;
    const newOrder = arrayMove(order, oldIndex, newIndex);
    setOrder(newOrder);
    setBoxes(newOrder.map((id) => boxes.find((b) => b.id === id)!));
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(newOrder));
  };

  const debounceRef = useRef<number>(0);
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setLoadingSearch(false);
      return;
    }
    setLoadingSearch(true);
    debounceRef.current = window.setTimeout(async () => {
      const data = await searchItems(query.trim());
      setResults(data);
      setLoadingSearch(false);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const exportCSV = async () => {
    setExporting(true);
    try {
      const allBoxes = await getBoxesByOwner(userId);
      const rows: Record<string, any>[] = [];

      for (const bx of allBoxes) {
        const items = await getItemsByBox(bx.id);
        if (items.length) {
          items.forEach((it) =>
            rows.push({
              box_id: bx.id,
              box_name: bx.name,
              box_location: bx.location ?? "",
              box_status: bx.status,
              item_id: it.id,
              item_name: it.name,
              item_quantity: it.quantity ?? 0,
              item_photo_url: it.photo_url ?? "",
            }),
          );
        } else {
          rows.push({
            box_id: bx.id,
            box_name: bx.name,
            box_location: bx.location ?? "",
            box_status: bx.status,
            item_id: "",
            item_name: "",
            item_quantity: "",
            item_photo_url: "",
          });
        }
      }

      const header = [
        "box_id",
        "box_name",
        "box_location",
        "box_status",
        "item_id",
        "item_name",
        "item_quantity",
        "item_photo_url",
      ];
      const csv = [
        header.join(","),
        ...rows.map((r) =>
          header.map((h) => `"${String(r[h]).replace(/"/g, '""')}"`).join(","),
        ),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "boxed_export.csv";
      a.click();
      URL.revokeObjectURL(url);

      toast.success("Export ready!");
    } catch (err) {
      console.error(err);
      toast.error("Export failed.");
    } finally {
      setExporting(false);
    }
  };

  if (!session) {
    return <p className="text-center text-muted-foreground">Please sign in.</p>;
  }

  return (
    <>
      <Head>
        <title>Dashboard - Boxed</title>
        <meta
          name="description"
          content="All your boxes and items in one place. Manage, search, and export your belongings efficiently."
        />
      </Head>

      <div className="container mx-auto px-6 py-8 space-y-12">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Your Boxes</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back,{" "}
              <span className="font-medium">
                {session.user.user_metadata.full_name || "User"}
              </span>
              !
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/insights">
              <Button variant="secondary">
                <BarChart3 className="mr-2 h-4 w-4" />
                Insights
              </Button>
            </Link>
            <Link href="/boxes/new">
              <Button>Add Box</Button>
            </Link>
            <Button onClick={exportCSV} disabled={exporting} variant="outline">
              {exporting ? "Exporting..." : "Export CSV"}
            </Button>
          </div>
        </header>

        <Card className="space-y-0">
          <CardHeader
            className="flex items-center justify-between cursor-pointer mt-0"
            onClick={() => setSearchOpen((o) => !o)}
          >
            <CardTitle>Find an Item</CardTitle>
            {searchOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>

          {searchOpen && (
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Search by item name..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <Button disabled>
                  <Search size={16} className="mr-1" />
                  Search
                </Button>
              </div>

              {loadingSearch && <Skeleton className="h-20 w-full mt-2" />}

              {!loadingSearch && results.length > 0 && boxes && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
                  {results.map((item) => {
                    const parentBox = boxes.find((b) => b.id === item.box_id);
                    return (
                      <ItemCard
                        key={item.id}
                        item={item}
                        showBox={!!parentBox}
                        box={parentBox}
                      />
                    );
                  })}
                </div>
              )}

              {!loadingSearch &&
                query.trim() !== "" &&
                results.length === 0 && (
                  <p className="mt-4 text-center text-muted-foreground">
                    No results found for “{query.trim()}”.
                  </p>
                )}
            </CardContent>
          )}
        </Card>

        <section>
          {!boxes ? (
            <Skeleton className="h-64 w-full" />
          ) : boxes.length === 0 ? (
            <p className="text-center text-muted-foreground">
              You have no boxes yet.
            </p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={order} strategy={rectSortingStrategy}>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {order.map((id) => {
                    const box = boxes.find((b) => b.id === id)!;
                    return <SortableBoxCard key={id} id={id} box={box} />;
                  })}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </section>

        <style jsx global>{`
          [data-rfd-drag-handle] {
            touch-action: none;
          }
        `}</style>
      </div>
    </>
  );
}
