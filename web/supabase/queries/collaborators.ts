// src/supabase/queries/collaborators.ts

import { supabase } from "../client";
import { collaboratorSchema } from "../types";
import type { Collaborator, NewCollaborator } from "../types";

export const getCollaborators = async (
  boxId: string,
): Promise<Collaborator[]> => {
  const { data, error } = await supabase
    .from("box_collaborators")
    .select("*")
    .eq("box_id", boxId);

  if (error) throw error;
  return collaboratorSchema.array().parse(data || []);
};

export const addCollaborator = async (
  boxId: string,
  collaboratorId: string,
  role: string = "viewer",
): Promise<Collaborator> => {
  const { data, error } = await supabase
    .from("box_collaborators")
    .insert({ box_id: boxId, collaborator_profile_id: collaboratorId, role })
    .select("*") // ← ensure the inserted row is returned
    .single(); // ← return a single record

  if (error) throw error;
  return collaboratorSchema.parse(data);
};

export const removeCollaborator = async (
  boxId: string,
  collaboratorId: string,
): Promise<void> => {
  const { error } = await supabase
    .from("box_collaborators")
    .delete()
    .eq("box_id", boxId)
    .eq("collaborator_profile_id", collaboratorId);

  if (error) throw error;
};
