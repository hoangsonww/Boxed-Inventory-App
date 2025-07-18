// pages/dashboard/index.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@supabase/auth-helpers-react";

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
import { Skeleton } from "@/components/ui/skeleton";
import BoxCard from "@/components/BoxCard";
import ItemCard from "@/components/ItemCard";
import { getBoxesByOwner } from "@/supabase/queries/boxes";
import { searchItems } from "@/supabase/queries/search";
import type { Box, Item } from "@/supabase/types";
import { Search, GripVertical } from "lucide-react";

/* ───────────────── Sortable wrapper (handle‑only drag) ───────────────── */
function SortableBoxCard({ id, box }: { id: string; box: Box }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 20 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="group relative rounded-lg">
        {/* drag handle */}
        <button
          type="button"
          {...listeners}
          className="absolute right-2 top-2 z-10 inline-flex items-center justify-center rounded p-1 text-muted-foreground opacity-0 transition group-hover:opacity-100 focus:opacity-100 focus:outline-none"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* actual card */}
        <BoxCard box={box} />
      </div>
    </div>
  );
}

/* ───────────────── Page ───────────────── */
export default function Dashboard() {
  const session = useSession();

  const [boxes, setBoxes] = useState<Box[] | null>(null);
  const [order, setOrder] = useState<string[]>([]);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Item[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  /* load boxes for user */
  useEffect(() => {
    if (!session) return;
    (async () => {
      const b = await getBoxesByOwner(session.user.id);
      setBoxes(b);
      setOrder(b.map((bx) => bx.id));
    })();
  }, [session]);

  /* drag start (optional visual hooks) */
  const handleDragStart = (_e: DragStartEvent) => {
    // no‑op; could set activeId if needed
  };

  /* drag end: reorder local state */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !boxes) return;

    const oldIndex = order.indexOf(active.id as string);
    const newIndex = order.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(order, oldIndex, newIndex);
    setOrder(newOrder);

    // reorder boxes array to match new order
    const reordered = newOrder.map((id) => boxes.find((b) => b.id === id)!);
    setBoxes(reordered);

    // TODO persist sort_index for user if desired
  };

  /* search */
  const doSearch = async () => {
    setLoadingSearch(true);
    const data = await searchItems(query);
    setResults(data);
    setLoadingSearch(false);
  };

  if (!session) {
    return <p className="text-center text-muted-foreground">Please sign in.</p>;
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Boxes</h1>
        <Link href="/boxes/new">
          <Button>Add Box</Button>
        </Link>
      </div>

      {/* Boxes (sortable) */}
      {!boxes ? (
        <Skeleton className="h-32 w-full" />
      ) : boxes.length === 0 ? (
        <p className="text-muted-foreground">You have no boxes yet.</p>
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

      {/* Search */}
      <section className="mt-12 space-y-4">
        <h2 className="text-xl font-semibold">Find an Item</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Search by item name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="max-w-sm"
          />
          <Button onClick={doSearch} disabled={loadingSearch || !query}>
            <Search size={16} className="mr-1" />
            Search
          </Button>
        </div>

        {loadingSearch && <Skeleton className="mt-4 h-20 w-full" />}

        {results.length > 0 && (
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* optional: global tweak to reduce drag jitter on mobile */}
      <style jsx global>{`
        [data-rfd-drag-handle] {
          touch-action: none;
        }
      `}</style>
    </div>
  );
}
