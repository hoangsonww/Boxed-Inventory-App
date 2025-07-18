import { supabase } from "../client";
import { boxSchema } from "../types";
import type { Box, NewBox, CollaboratorInfo } from "../types";

export const getBoxesByOwner = async (ownerId: string): Promise<Box[]> => {
  const { data, error } = await supabase
    .from("boxes")
    .select("*")
    .eq("owner_profile_id", ownerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return boxSchema.array().parse(data ?? []);
};

export const getAccessibleBoxes = async (userId: string): Promise<Box[]> => {
  // 1) Boxes you own
  const ownedRes = await supabase
    .from("boxes")
    .select("*")
    .eq("owner_profile_id", userId)
    .order("created_at", { ascending: false });

  if (ownedRes.error) throw ownedRes.error;
  const owned = boxSchema.array().parse(ownedRes.data ?? []);

  // 2) Boxes where you’re a collaborator — inner‐join only those
  const invitedRes = await supabase
    .from("boxes")
    // the !inner makes this an INNER JOIN on box_collaborators
    .select("*, box_collaborators!inner(collaborator_profile_id)")
    .eq("box_collaborators.collaborator_profile_id", userId)
    .order("created_at", { ascending: false });

  if (invitedRes.error) throw invitedRes.error;
  // strip off the collaborator payload before parsing
  const invited = boxSchema
    .array()
    .parse(invitedRes.data!.map(({ box_collaborators, ...b }) => b));

  // 3) merge & dedupe (so if you both own it and are listed, it only appears once)
  const map = new Map<string, Box>();
  owned.forEach((b) => map.set(b.id, b));
  invited.forEach((b) => map.set(b.id, b));

  return Array.from(map.values());
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
