"use client";

import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { toast } from "sonner";

import { getBox, updateBox } from "@/supabase/queries/boxes";
import { getItemsByBox, createItem } from "@/supabase/queries/items";
import type { Box, Item } from "@/supabase/types";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ItemCard from "@/components/ItemCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PlusCircle,
  Image as ImageIcon,
  GripVertical,
  Archive,
  MapPin,
  Camera,
  Pencil,
  X,
  Check,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

/* dnd-kit */
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/*──────────────────────────────────────────────────────────
  Status styling helpers
──────────────────────────────────────────────────────────*/
const statusBadgeClasses: Record<Box["status"], string> = {
  unpacked:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-300 dark:border-green-700",
  packed:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-300 dark:border-blue-700",
  in_transit:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-500/60 dark:border-yellow-700",
};

function StatusPill({ status }: { status: Box["status"] }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs capitalize ${statusBadgeClasses[status]}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

/*──────────────────────────────────────────────────────────
  Inline editable text field (lightweight)
──────────────────────────────────────────────────────────*/
function EditableText({
  value,
  placeholder,
  onSave,
  canEdit,
  className,
  inputClassName,
  "aria-label": ariaLabel,
}: {
  value?: string | null;
  placeholder?: string;
  onSave: (val: string) => Promise<void> | void;
  canEdit: boolean;
  className?: string;
  inputClassName?: string;
  "aria-label"?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editing) {
      setDraft(value ?? "");
      // next tick focus
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [editing, value]);

  const save = async () => {
    if (!canEdit) return;
    setSaving(true);
    try {
      await onSave(draft.trim());
      setEditing(false);
    } catch {
      toast.error("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    setDraft(value ?? "");
    setEditing(false);
  };

  if (!canEdit) {
    return (
      <span className={className}>
        {value?.trim() ? (
          value
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </span>
    );
  }

  if (!editing) {
    return (
      <button
        type="button"
        aria-label={ariaLabel ?? "Edit"}
        className={`group inline-flex items-center gap-1 text-left ${className}`}
        onClick={() => setEditing(true)}
      >
        <span className="truncate">
          {value?.trim() ? (
            value
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </span>
        <Pencil className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100 text-muted-foreground" />
      </button>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className={`h-7 w-40 ${inputClassName}`}
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            void save();
          } else if (e.key === "Escape") {
            e.preventDefault();
            cancel();
          }
        }}
      />
      <Button
        variant="ghost"
        size="icon"
        type="button"
        aria-label="Save"
        onClick={save}
        disabled={saving}
      >
        <Check className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        type="button"
        aria-label="Cancel"
        onClick={cancel}
        disabled={saving}
      >
        <X className="h-4 w-4" />
      </Button>
    </span>
  );
}

/*──────────────────────────────────────────────────────────
  Sortable Item wrapper w/ handle‑only drag
──────────────────────────────────────────────────────────*/
interface SortableItemProps {
  id: string;
  item: Item;
}
function SortableItem({ id, item }: SortableItemProps) {
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
        {/* drag handle (bigger target) */}
        <button
          type="button"
          {...listeners}
          aria-label="Drag to reorder item"
          className="absolute right-2 top-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground opacity-0 transition group-hover:opacity-100 focus:opacity-100 focus:outline-none cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* actual card UI */}
        <ItemCard item={item} dragging={isDragging} />
      </div>
    </div>
  );
}

/*──────────────────────────────────────────────────────────
  Box Hero (photo + meta) – looks like a box
──────────────────────────────────────────────────────────*/
function BoxHero({
  box,
  isOwner,
  onUploadClick,
  onRemovePhoto,
  onTogglePacked,
  onRename,
  onRelocate,
  totalItems,
  totalQty,
}: {
  box: Box;
  isOwner: boolean;
  onUploadClick: () => void;
  onRemovePhoto: () => void;
  onTogglePacked: () => void;
  onRename: (newName: string) => Promise<void>;
  onRelocate: (newLoc: string) => Promise<void>;
  totalItems: number;
  totalQty: number;
}) {
  const hasPhoto = Boolean(box.photo_url);

  return (
    <div className="relative mx-auto w-full max-w-4xl">
      <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {/* Photo / placeholder */}
        {hasPhoto ? (
          <div className="relative h-52 w-full overflow-hidden">
            <img
              src={box.photo_url!}
              alt={box.name}
              className="h-full w-full object-cover opacity-0 transition-opacity duration-300 data-[loaded=true]:opacity-100"
              onLoad={(e) => {
                (e.currentTarget as HTMLImageElement).dataset.loaded = "true";
              }}
            />
            {/* Dark gradient footer for text legibility */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
          </div>
        ) : (
          <div className="box-cardboard-bg relative flex h-52 w-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <Archive className="h-8 w-8" />
            <span>No box photo</span>
            {isOwner && (
              <Button
                variant="outline"
                size="sm"
                onClick={onUploadClick}
                type="button"
              >
                <Camera className="mr-1 h-4 w-4" /> Add photo
              </Button>
            )}
          </div>
        )}

        {/* Mask top corners softer */}
        <div className="pointer-events-none absolute inset-0 rounded-xl [mask-image:radial-gradient(circle_at_top,black,transparent_70%)]" />

        {/* Tape strips (visual detail, hidden when photo) */}
        {!hasPhoto && (
          <>
            <span className="pointer-events-none absolute left-6 top-0 h-6 w-20 -rotate-6 bg-primary/20" />
            <span className="pointer-events-none absolute right-8 top-1 h-6 w-24 rotate-3 bg-primary/20" />
          </>
        )}

        {/* Meta overlay */}
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 p-4">
          <div className="space-y-1">
            <h1 className="max-w-full truncate text-2xl font-bold drop-shadow-sm">
              <EditableText
                value={box.name}
                placeholder="Untitled box"
                onSave={onRename}
                canEdit={isOwner}
                className="align-middle"
                aria-label="Edit box name"
              />
            </h1>
            <div className="flex items-center gap-1 text-sm text-muted-foreground drop-shadow-sm">
              <MapPin className="h-4 w-4 shrink-0" />
              <EditableText
                value={box.location ?? ""}
                placeholder="Add location"
                onSave={onRelocate}
                canEdit={isOwner}
                className="truncate"
                aria-label="Edit box location"
              />
            </div>
            <p className="text-xs text-muted-foreground drop-shadow-sm">
              {totalItems} item{totalItems !== 1 ? "s" : ""} · {totalQty} total
            </p>
          </div>

          <div className="flex items-center gap-2">
            <StatusPill status={box.status} />
            {isOwner && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onTogglePacked}
                type="button"
              >
                {box.status === "packed" ? "Mark Unpacked" : "Mark Packed"}
              </Button>
            )}
            {isOwner && hasPhoto && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onUploadClick}
                  type="button"
                >
                  <Camera className="mr-1 h-4 w-4" />
                  Change
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remove photo"
                  onClick={onRemovePhoto}
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/*──────────────────────────────────────────────────────────
  Page
──────────────────────────────────────────────────────────*/
export default function BoxDetailPage() {
  const { query } = useRouter();
  const boxId = query.id as string | undefined;

  const session = useSession();
  const supabase = useSupabaseClient();

  const [box, setBox] = useState<Box | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [order, setOrder] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  /* Add‑item form state */
  const [addOpen, setAddOpen] = useState(true); // collapsible
  const [name, setName] = useState("");
  const [qty, setQty] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  /* box photo hidden input */
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isOwner = session?.user.id === box?.owner_profile_id;

  /* sensors */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  /* load */
  const loadAll = async (id: string) => {
    setLoading(true);
    const b = await getBox(id);
    setBox(b);
    const its = await getItemsByBox(id);
    setItems(its);
    setOrder(its.map((i) => i.id));
    setLoading(false);
  };

  useEffect(() => {
    if (!boxId) return;
    void loadAll(boxId);
  }, [boxId]);

  /* counts */
  const { totalItems, totalQty } = useMemo(() => {
    const totalItems = items.length;
    const totalQty = items.reduce((sum, i) => sum + (i.quantity ?? 0), 0);
    return { totalItems, totalQty };
  }, [items]);

  /* add item */
  const addItem = async () => {
    if (!boxId || !name.trim()) {
      toast.error("Item name required.");
      return;
    }

    let photo_url: string | undefined;
    if (file) {
      setUploading(true);
      const ext = file.name.split(".").pop();
      const fileName = `${boxId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("item-photos")
        .upload(fileName, file);
      if (uploadError) {
        toast.error("Upload failed.");
        setUploading(false);
        return;
      }
      photo_url = supabase.storage.from("item-photos").getPublicUrl(fileName)
        .data.publicUrl;
      setUploading(false);
    }

    try {
      await createItem({
        box_id: boxId,
        name: name.trim(),
        quantity: qty,
        photo_url,
      });
      await loadAll(boxId); // refresh
      setName("");
      setQty(1);
      setFile(null);
      toast.success("Item added.");
    } catch {
      toast.error("Failed to add item.");
    }
  };

  /* toggle packed */
  const togglePacked = async () => {
    if (!boxId || !box) return;
    const next = box.status === "packed" ? "unpacked" : "packed";
    try {
      const updated = await updateBox(box.id, { status: next });
      setBox(updated);
      toast.success(`Marked ${next}.`);
    } catch {
      toast.error("Failed to update status.");
    }
  };

  /* rename box */
  const renameBox = async (newName: string) => {
    if (!boxId || !box) return;
    try {
      const updated = await updateBox(box.id, { name: newName });
      setBox(updated);
      toast.success("Box renamed.");
    } catch {
      toast.error("Rename failed.");
    }
  };

  /* relocate box */
  const relocateBox = async (newLoc: string) => {
    if (!boxId || !box) return;
    try {
      const updated = await updateBox(box.id, {
        location: newLoc || undefined,
      });
      setBox(updated);
      toast.success("Location updated.");
    } catch {
      toast.error("Update failed.");
    }
  };

  /* upload/change box photo */
  const uploadBoxPhoto = async (f: File) => {
    if (!boxId) return;
    const ext = f.name.split(".").pop();
    const fileName = `${boxId}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("box-photos")
      .upload(fileName, f, {
        cacheControl: "3600",
        upsert: true,
      });
    if (uploadError) {
      toast.error("Box photo upload failed.");
      return;
    }
    const { data: urlData } = supabase.storage
      .from("box-photos")
      .getPublicUrl(fileName);
    try {
      const updated = await updateBox(boxId, { photo_url: urlData.publicUrl });
      setBox(updated);
      toast.success("Box photo updated.");
    } catch {
      toast.error("Failed to save box photo.");
    }
  };

  /* remove box photo */
  const removeBoxPhoto = async () => {
    if (!boxId) return;
    try {
      const updated = await updateBox(boxId, { photo_url: null as any });
      setBox(updated);
      toast.success("Box photo removed.");
    } catch {
      toast.error("Failed to remove photo.");
    }
  };

  const handleBoxPhotoInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    void uploadBoxPhoto(f);
  };

  /* drag handlers */
  const handleDragStart = (_e: DragStartEvent) => {
    // nothing; we could set activeId if we want styling
  };
  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = order.indexOf(active.id as string);
    const newIdx = order.indexOf(over.id as string);
    if (oldIdx === -1 || newIdx === -1) return;
    const newOrder = arrayMove(order, oldIdx, newIdx);
    setOrder(newOrder);
    setItems(newOrder.map((id) => items.find((i) => i.id === id)!));
    // TODO persist sort_index if needed
  };

  /* loading skeleton */
  if (!boxId || loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-52 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!box) {
    return <p className="text-muted-foreground">Box not found.</p>;
  }

  return (
    <div className="space-y-10">
      {/* Hidden file input for box photo */}
      {isOwner && (
        <input
          ref={fileInputRef}
          id="box-photo-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleBoxPhotoInput}
        />
      )}

      {/* Box Hero w/ photo & controls */}
      <BoxHero
        box={box}
        isOwner={!!isOwner}
        onUploadClick={() => {
          if (!isOwner) return;
          fileInputRef.current?.click();
        }}
        onRemovePhoto={removeBoxPhoto}
        onTogglePacked={togglePacked}
        onRename={renameBox}
        onRelocate={relocateBox}
        totalItems={totalItems}
        totalQty={totalQty}
      />

      {/* Add item (collapsible) */}
      {isOwner && (
        <Card className="mx-auto max-w-lg transition-shadow hover:shadow-lg">
          <CardHeader
            className="flex cursor-pointer flex-row items-center justify-between space-y-0"
            onClick={() => setAddOpen((o) => !o)}
          >
            <CardTitle className="text-base font-medium">
              {addOpen ? "Add Item" : "Add Item"}
            </CardTitle>
            {addOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          {addOpen && (
            <>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Input
                    placeholder="Item name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="sm:col-span-2"
                  />
                  <Input
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(e) => setQty(+e.target.value)}
                    placeholder="Qty"
                  />
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground">
                  <ImageIcon className="text-primary" />
                  {file ? file.name : "Upload photo (optional)"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </label>
              </CardContent>
              <CardFooter className="justify-end">
                <Button disabled={uploading || !name.trim()} onClick={addItem}>
                  {uploading ? (
                    "Uploading…"
                  ) : (
                    <>
                      <PlusCircle className="mr-1 h-4 w-4" /> Add
                    </>
                  )}
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      )}

      {/* Items grid — simple + stable drag */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={order} strategy={rectSortingStrategy}>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {order.length ? (
              order.map((id) => {
                const item = items.find((i) => i.id === id)!;
                return <SortableItem key={id} id={id} item={item} />;
              })
            ) : (
              <p className="text-center text-muted-foreground">No items yet.</p>
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* Minimal drag CSS override */}
      <style jsx global>{`
        [data-rfd-drag-handle] {
          touch-action: none;
        }
        .box-cardboard-bg {
          background-image:
            repeating-linear-gradient(
              -45deg,
              rgba(0, 0, 0, 0.04) 0 2px,
              rgba(0, 0, 0, 0) 2px 4px
            ),
            linear-gradient(
              to bottom,
              oklch(0.87 0.03 70) 0%,
              oklch(0.82 0.04 70) 100%
            );
        }
      `}</style>
    </div>
  );
}
