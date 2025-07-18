import { supabase } from "../client";
import { profileSchema } from "../types";
import type { Profile, NewProfile } from "../types";

export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data ? profileSchema.parse(data) : null;
};

export const upsertProfile = async (
  profile: NewProfile & { id: string },
): Promise<Profile> => {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(profile)
    .single();
  if (error) throw error;
  return profileSchema.parse(data);
};
