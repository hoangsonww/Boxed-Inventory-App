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
import { X, HelpCircle } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";

import {
  getCollaboratorsWithInfo,
  addCollaborator,
  removeCollaborator,
} from "@/supabase/queries/collaborators";
import type { CollaboratorInfo } from "@/supabase/types";

export default function CollaboratorsSection({ boxId }: { boxId: string }) {
  const session = useSession();
  const [collaborators, setCollaborators] = useState<CollaboratorInfo[] | null>(
    null,
  );
  const [newId, setNewId] = useState("");
  const isOwner =
    session?.user.id === /* owner_profile_id from box state */ session?.user.id;

  // load on mount
  useEffect(() => {
    if (!boxId) return;
    getCollaboratorsWithInfo(boxId)
      .then(setCollaborators)
      .catch(() => toast.error("Failed to load collaborators."));
  }, [boxId]);

  const refresh = () =>
    getCollaboratorsWithInfo(boxId)
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
        <div className="flex items-center justify-between w-full">
          <CardTitle>Collaborators</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Help">
                <HelpCircle className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm space-y-4">
              <p>
                To invite a friend: 🚀
                <ol className="list-decimal list-inside ml-2">
                  <li>
                    Ask them to click the profile icon at the top‑right of the
                    screen and select “Profile.”
                  </li>
                  <li>
                    On their Profile page, click “Copy Profile ID,” or use the
                    email/share buttons to send their ID.
                  </li>
                  <li>Paste their Profile ID here and click “Add.”</li>
                </ol>
                Enjoy collaborating on your boxes together! ✨
              </p>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {collaborators === null ? (
          <p>Loading...</p>
        ) : collaborators.length === 0 ? (
          <p className="text-muted-foreground">No collaborators yet.</p>
        ) : (
          <ul className="space-y-2">
            {collaborators.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between rounded border border-border p-2"
              >
                <div className="truncate">
                  <span className="font-medium">{c.name || c.id}</span>{" "}
                  <span className="text-sm text-muted-foreground">
                    &lt;{c.email || c.id}&gt;
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remove"
                  onClick={() => onRemove(c.id)}
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
