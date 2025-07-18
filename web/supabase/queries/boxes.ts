import { supabase } from "../client";
import { boxSchema } from "../types";
import type { Box, NewBox } from "../types";

export const getBoxesByOwner = async (ownerId: string): Promise<Box[]> => {
  const { data, error } = await supabase
    .from("boxes")
    .select("*")
    .eq("owner_profile_id", ownerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return boxSchema.array().parse(data ?? []);
};

export const getBox = async (id: string): Promise<Box | null> => {
  const { data, error } = await supabase
    .from("boxes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data ? boxSchema.parse(data) : null;
};

export const createBox = async (box: NewBox): Promise<Box> => {
  const { data, error } = await supabase
    .from("boxes")
    .insert(box)
    .select("*")
    .single();

  if (error) throw error;
  // data is guaranteed now
  return boxSchema.parse(data);
};

export const updateBox = async (
  id: string,
  updates: Partial<NewBox>,
): Promise<Box> => {
  const { data, error } = await supabase
    .from("boxes")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return boxSchema.parse(data);
};

export const deleteBox = async (id: string): Promise<void> => {
  const { error } = await supabase.from("boxes").delete().eq("id", id);
  if (error) throw error;
};
