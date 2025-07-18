import { supabase } from "../client";
import { itemTypeSchema } from "../types";
import type { ItemType, NewItemType } from "../types";

export const getItemTypes = async (): Promise<ItemType[]> => {
  const { data, error } = await supabase
    .from("item_types")
    .select("*")
    .order("name");
  if (error) throw error;
  return itemTypeSchema.array().parse(data || []);
};

export const createItemType = async (name: string): Promise<ItemType> => {
  const { data, error } = await supabase
    .from("item_types")
    .insert({ name })
    .select("*")
    .single();
  if (error) throw error;
  return itemTypeSchema.parse(data);
};
