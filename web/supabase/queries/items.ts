import { supabase } from "../client";
import { itemSchema } from "../types";
import type { Item, NewItem } from "../types";

export const getItemsByBox = async (boxId: string): Promise<Item[]> => {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("box_id", boxId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return itemSchema.array().parse(data ?? []);
};

export const getItem = async (id: string): Promise<Item | null> => {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data ? itemSchema.parse(data) : null;
};

export const createItem = async (item: NewItem): Promise<Item> => {
  const { data, error } = await supabase
    .from("items")
    .insert(item)
    .select("*")
    .single();
  if (error) throw error;
  return itemSchema.parse(data);
};

export const updateItem = async (
  id: string,
  updates: Partial<NewItem>,
): Promise<Item> => {
  const { data, error } = await supabase
    .from("items")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return itemSchema.parse(data);
};

export const deleteItem = async (id: string): Promise<void> => {
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) throw error;
};
