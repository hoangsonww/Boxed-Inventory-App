"use client";

import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

import {
  getCollaborators,
  addCollaborator,
  removeCollaborator,
} from "@/supabase/queries/collaborators";
import type { Collaborator } from "@/supabase/types";

export default function CollaboratorsSection({ boxId }: { boxId: string }) {
  const session = useSession();
  const [collaborators, setCollaborators] = useState<Collaborator[] | null>(
    null,
  );
  const [newId, setNewId] = useState("");
  const isOwner =
    session?.user.id === /* owner_profile_id from box state */ session?.user.id;

  // load on mount
  useEffect(() => {
    if (!boxId) return;
    getCollaborators(boxId)
      .then(setCollaborators)
      .catch((err) => toast.error("Failed to load collaborators."));
  }, [boxId]);

  const refresh = () =>
    getCollaborators(boxId)
      .then(setCollaborators)
      .catch(() => toast.error("Failed to refresh."));

  const onAdd = async () => {
    if (!newId.trim()) {
      toast.error("Enter a profile ID.");
      return;
    }
    try {
      await addCollaborator(boxId, newId.trim());
      toast.success("Collaborator added.");
      setNewId("");
      refresh();
    } catch {
      toast.error("Failed to add collaborator.");
    }
  };

  const onRemove = async (collabId: string) => {
    try {
      await removeCollaborator(boxId, collabId);
      toast.success("Removed.");
      refresh();
    } catch {
      toast.error("Failed to remove.");
    }
  };

  if (!isOwner) return null;

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>Collaborators</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {collaborators === null ? (
          <p>Loading...</p>
        ) : collaborators.length === 0 ? (
          <p className="text-muted-foreground">No collaborators yet.</p>
        ) : (
          <ul className="space-y-2">
            {collaborators.map((c) => (
              <li
                key={c.collaborator_profile_id}
                className="flex items-center justify-between rounded border border-border p-2"
              >
                <span className="truncate">{c.collaborator_profile_id}</span>
                <span className="px-2 text-xs font-medium">{c.role}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remove"
                  onClick={() => onRemove(c.collaborator_profile_id)}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Input
          placeholder="Profile ID"
          value={newId}
          onChange={(e) => setNewId(e.target.value)}
        />
        <Button onClick={onAdd}>Add</Button>
      </CardFooter>
    </Card>
  );
}
