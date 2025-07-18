import { supabase } from "../client";
import { type CollaboratorInfo, collaboratorSchema } from "../types";
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
    .select("*")
    .single();

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

export const getCollaboratorsWithInfo = async (
  boxId: string,
): Promise<CollaboratorInfo[]> => {
  const { data, error } = await supabase
    .from("box_collaborators")
    .select(
      `
      collaborator_profile_id,
      profiles!inner(
        full_name,
        email
      )
    `,
    )
    .eq("box_id", boxId);

  if (error) throw error;

  return (data ?? []).map((row) => {
    const id = row.collaborator_profile_id;
    const prof = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    const name = prof?.full_name ?? id;
    const email = prof?.email ?? id;
    return { id, name, email };
  });
};
