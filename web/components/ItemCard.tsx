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

  const [open, setOpen] = useState(false);
  const [name, setName] = useState(item.name);
  const [qty, setQty] = useState(item.quantity);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* refresh form fields each time the modal opens */
  useEffect(() => {
    if (open) {
      setName(item.name);
      setQty(item.quantity);
      setFile(null);
    }
  }, [open, item]);

  /* save edits */
  const onSave = async () => {
    let photo_url = item.photo_url;
    if (file) {
      setUploading(true);
      const ext = file.name.split(".").pop();
      const fileName = `${item.box_id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("item-photos")
        .upload(fileName, file);
      if (!error) {
        const { data } = supabase.storage
          .from("item-photos")
          .getPublicUrl(fileName);
        photo_url = data.publicUrl;
      }
      setUploading(false);
    }

    await supabase
      .from("items")
      .update({ name, quantity: qty, photo_url })
      .eq("id", item.id);

    setOpen(false);
    // 👉 trigger parent refresh here if needed
  };

  const typeBadgeClass = type
    ? TYPE_COLOR_CLASSES[type.id % TYPE_COLOR_CLASSES.length]
    : "";

  return (
    <div className="relative flex flex-col gap-2 rounded-lg border border-border bg-card p-4 shadow-sm transition hover:shadow-md">
      {/* Name */}
      <p className="truncate text-lg font-medium">{item.name}</p>

      {/* Quantity + last used */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span>Qty: {item.quantity}</span>
        {item.last_used && (
          <>
            <CalendarClock size={14} />
            <span>{dayjs(item.last_used).fromNow()}</span>
          </>
        )}
      </div>

      {/* Image */}
      {item.photo_url ? (
        <img
          src={item.photo_url}
          alt={item.name}
          className="mt-2 h-24 w-full rounded border object-cover"
        />
      ) : (
        <div className="mt-2 flex h-24 w-full items-center justify-center rounded border bg-muted/10 text-muted-foreground">
          <ImageIcon size={32} />
        </div>
      )}

      {/* Bottom bar: pill (L) + edit (R) */}
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

          {/* ───────── Modal ───────── */}
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
                {uploading ? "Saving…" : "Save"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Optional box info */}
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
