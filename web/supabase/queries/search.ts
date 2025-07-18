import { supabase } from "../client";
import { itemSchema } from "../types";
import type { Item, SearchFilters } from "../types";

export const searchItems = async (
  queryText: string,
  filters: SearchFilters = {},
): Promise<Item[]> => {
  let qb = supabase.from("items").select("*");

  if (queryText) qb = qb.ilike("name", `%${queryText}%`);
  if (filters.typeIds?.length) qb = qb.in("type_id", filters.typeIds);
  if (filters.boxIds?.length) qb = qb.in("box_id", filters.boxIds);

  if (filters.location) {
    // first fetch box IDs matching that location
    const { data: boxes, error: boxErr } = await supabase
      .from("boxes")
      .select("id")
      .eq("location", filters.location);
    if (boxErr) throw boxErr;
    const locBoxIds = boxes?.map((b) => b.id) || [];
    if (locBoxIds.length === 0) return [];
    qb = qb.in("box_id", locBoxIds);
  }

  const { data, error } = await qb.order("created_at", { ascending: false });
  if (error) throw error;
  return itemSchema.array().parse(data || []);
};
