"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { getItemTypes, createItemType } from "@/supabase/queries/itemTypes";
import { createItem } from "@/supabase/queries/items";
import type { ItemType } from "@/supabase/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  Image as ImageIcon,
  Check,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export interface AddItemCardProps {
  boxId: string;
  onItemAdded: () => void;
}

export default function AddItemCard({ boxId, onItemAdded }: AddItemCardProps) {
  const supabase = useSupabaseClient();

  const [open, setOpen] = useState(true);
  const [name, setName] = useState("");
  const [qty, setQty] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  const [typeId, setTypeId] = useState<number | "">("");
  const [addingType, setAddingType] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");

  // load existing types
  useEffect(() => {
    getItemTypes()
      .then(setItemTypes)
      .catch(() => toast.error("Failed to load item types."));
  }, []);

  const addType = async () => {
    const nm = newTypeName.trim();
    if (!nm) return toast.error("Type name required.");
    try {
      const t = await createItemType(nm);
      setItemTypes((prev) => [...prev, t]);
      setTypeId(t.id);
      setNewTypeName("");
      setAddingType(false);
      toast.success("New type added.");
    } catch {
      toast.error("Couldn’t create type.");
    }
  };

  const handleAdd = async () => {
    if (!name.trim()) return toast.error("Item name required.");
    let photo_url: string | undefined;
    if (file) {
      setUploading(true);
      const ext = file.name.split(".").pop();
      const fileName = `${boxId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("item-photos")
        .upload(fileName, file);
      if (upErr) {
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
        type_id: typeId === "" ? undefined : typeId,
      });
      toast.success("Item added!");
      setName("");
      setQty(1);
      setFile(null);
      setTypeId("");
      onItemAdded();
    } catch {
      toast.error("Failed to add item.");
    }
  };

  return (
    <Card className="w-full transition-shadow hover:shadow-lg">
      <CardHeader
        className="flex cursor-pointer items-center justify-between"
        onClick={() => setOpen((o) => !o)}
      >
        <CardTitle className="text-base font-medium">Add Item</CardTitle>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>

      {open && (
        <>
          <CardContent className="space-y-4">
            {/* ─ Type picker / inline create ─ */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Type</label>
              <div className="flex gap-2 items-center">
                {itemTypes.length > 0 ? (
                  <Select
                    value={typeId === "" ? undefined : String(typeId)}
                    onValueChange={(v) => setTypeId(v ? Number(v) : "")}
                    // @ts-ignore
                    className="flex-1"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {itemTypes.map((t) => (
                        <SelectItem key={t.id} value={String(t.id)}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex-1 rounded border border-input bg-background p-2 text-muted-foreground cursor-not-allowed">
                        No types yet
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        You haven’t created any types yet. Click the “+” to add
                        your first one.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {addingType ? (
                  <>
                    <Input
                      value={newTypeName}
                      onChange={(e) => setNewTypeName(e.target.value)}
                      placeholder="New type"
                      className="w-32"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={addType}
                      aria-label="Save new type"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setAddingType(false);
                        setNewTypeName("");
                      }}
                      aria-label="Cancel new type"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setAddingType(true)}
                    aria-label="Add new type"
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* ─ Name & Qty ─ */}
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

            {/* ─ Photo upload ─ */}
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
            <Button disabled={uploading || !name.trim()} onClick={handleAdd}>
              {uploading ? (
                "Uploading..."
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
  );
}
