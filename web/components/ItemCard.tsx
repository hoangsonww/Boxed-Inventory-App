"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Item, ItemType, Box } from "@/supabase/types";
import {
  Image as ImageIcon,
  CalendarClock,
  MapPin,
  Archive,
  Pencil,
  Camera,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";

dayjs.extend(relativeTime);

const TYPE_COLOR_CLASSES = [
  "bg-red-100 text-red-800",
  "bg-green-100 text-green-800",
  "bg-blue-100 text-blue-800",
  "bg-yellow-100 text-yellow-800",
  "bg-purple-100 text-purple-800",
  "bg-pink-100 text-pink-800",
];

export default function ItemCard({
  item,
  type,
  showBox = false,
  box,
}: {
  item: Item;
  type?: ItemType;
  showBox?: boolean;
  box?: Box;
}) {
  const supabase = useSupabaseClient();

  // local copy so UI updates immediately
  const [currentItem, setCurrentItem] = useState(item);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(item.name);
  const [qty, setQty] = useState(item.quantity);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // reset local item if parent prop changes
  useEffect(() => {
    setCurrentItem(item);
  }, [item]);

  // when dialog opens, initialize form fields from currentItem
  useEffect(() => {
    if (open) {
      setName(currentItem.name);
      setQty(currentItem.quantity);
      setFile(null);
    }
  }, [open, currentItem]);

  const onSave = async () => {
    let photo_url = currentItem.photo_url;
    if (file) {
      setUploading(true);
      const ext = file.name.split(".").pop();
      const fileName = `${currentItem.box_id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("item-photos")
        .upload(fileName, file);
      if (!uploadErr) {
        const { data } = supabase.storage
          .from("item-photos")
          .getPublicUrl(fileName);
        photo_url = data.publicUrl;
      }
      setUploading(false);
    }

    const { error } = await supabase
      .from("items")
      .update({ name, quantity: qty, photo_url })
      .eq("id", currentItem.id);

    if (error) {
      toast.error("Failed to save changes.");
      return;
    }

    // update local state so UI reflects changes immediately
    setCurrentItem({
      ...currentItem,
      name,
      quantity: qty,
      photo_url,
    });
    toast.success("Item updated.");
    setOpen(false);
  };

  const typeBadgeClass = type
    ? TYPE_COLOR_CLASSES[type.id % TYPE_COLOR_CLASSES.length]
    : "";

  return (
    <div className="relative flex flex-col gap-2 rounded-lg border border-border bg-card p-4 shadow-sm transition hover:shadow-md">
      <p className="truncate text-lg font-medium">{currentItem.name}</p>

      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span>Qty: {currentItem.quantity}</span>
        {currentItem.last_used && (
          <>
            <CalendarClock size={14} />
            <span>{dayjs(currentItem.last_used).fromNow()}</span>
          </>
        )}
      </div>

      {/* Image */}
      {currentItem.photo_url ? (
        <img
          src={currentItem.photo_url}
          alt={currentItem.name}
          className="mt-2 h-24 w-full rounded border object-cover"
        />
      ) : (
        <div className="mt-2 flex h-24 w-full items-center justify-center rounded border bg-muted/10 text-muted-foreground">
          <ImageIcon size={32} />
        </div>
      )}

      <div className="mt-2 flex items-center justify-between">
        {type ? (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${typeBadgeClass}`}
          >
            {type.name}
          </span>
        ) : (
          <span />
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Edit item"
              className="shrink-0"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-md space-y-6">
            <h2 className="text-lg font-semibold">Edit item</h2>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium">Quantity</label>
                <Input
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(+e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium">
                  Photo (optional)
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="mr-1 h-4 w-4" />
                    Choose file
                  </Button>
                  {file && (
                    <span className="truncate text-sm text-muted-foreground">
                      {file.name}
                    </span>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      setFile(e.target.files ? e.target.files[0] : null)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button onClick={onSave} disabled={uploading}>
                {uploading ? "Saving..." : "Save"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {showBox && box && (
        <div className="mt-4 flex items-center justify-between border-t pt-2 text-sm text-muted-foreground">
          <Link
            href={`/boxes/${box.id}`}
            className="flex items-center gap-1 transition hover:text-primary"
          >
            <Archive size={14} />
            <span className="truncate">{box.name}</span>
          </Link>
          {box.location && (
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>{box.location}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
