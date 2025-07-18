"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { getProfile, upsertProfile } from "@/supabase/queries/profiles";
import type { Profile, NewProfile } from "@/supabase/types";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Camera, Check, X, Pencil } from "lucide-react";
import dayjs from "dayjs";

export default function ProfilePage() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const userId = session?.user.id;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // For username editing
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [savingName, setSavingName] = useState(false);

  // Avatar upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    if (!userId) return;
    (async () => {
      setLoading(true);
      try {
        const p = await getProfile(userId);
        setProfile(p);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  // Save new username
  const saveName = async () => {
    if (!profile) return;
    const newName = draftName.trim();
    if (!newName) {
      toast.error("Username cannot be empty.");
      return;
    }
    setSavingName(true);
    try {
      const updated = await upsertProfile({
        id: profile.id,
        username: newName,
        avatar_url: profile.avatar_url ?? undefined,
      });
      setProfile(updated);
      setEditingName(false);
      toast.success("Username updated.");
    } catch {
      toast.error("Failed to update username.");
    } finally {
      setSavingName(false);
    }
  };

  // Trigger avatar file picker
  const onChangeAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Upload avatar handler
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const filePath = `avatars/${profile.id}/${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });
    if (uploadErr) {
      toast.error("Upload failed.");
      setUploadingAvatar(false);
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    try {
      const updated = await upsertProfile({
        id: profile.id,
        username: profile.username ?? undefined,
        avatar_url: data.publicUrl,
      });
      setProfile(updated);
      toast.success("Avatar updated.");
    } catch {
      toast.error("Failed to save avatar.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (!session) {
    return <p className="text-center text-muted-foreground">Please sign in.</p>;
  }

  if (loading) {
    return (
      <div className="space-y-4 mx-auto max-w-md">
        <Skeleton className="h-32 w-full rounded-full" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 py-8">
      <h1 className="text-3xl font-bold text-center">Your Profile</h1>

      <Card>
        <CardHeader className="flex flex-col items-center gap-2 pb-0">
          {/* Avatar */}
          <div className="relative">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="h-32 w-32 rounded-full object-cover"
              />
            ) : (
              <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Camera size={48} />
              </div>
            )}
            {/* Upload button */}
            <button
              onClick={onChangeAvatarClick}
              disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 bg-card rounded-full p-1 shadow hover:bg-muted transition"
              aria-label="Change avatar"
            >
              {uploadingAvatar ? (
                <span className="animate-spin">...</span>
              ) : (
                <Camera size={18} />
              )}
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* Username */}
          {editingName ? (
            <div className="flex items-center gap-2 mt-2">
              <Input
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                className="w-48"
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveName();
                  if (e.key === "Escape") setEditingName(false);
                }}
                disabled={savingName}
              />
              <Button
                size="icon"
                variant="outline"
                onClick={saveName}
                disabled={savingName}
                aria-label="Save username"
              >
                <Check size={16} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setEditingName(false)}
                disabled={savingName}
                aria-label="Cancel edit"
              >
                <X size={16} />
              </Button>
            </div>
          ) : (
            <button
              type="button"
              className="group inline-flex items-center gap-2 mt-2 text-xl font-semibold"
              onClick={() => {
                setDraftName(profile?.username ?? "");
                setEditingName(true);
              }}
            >
              {profile?.username || (
                <span className="text-muted-foreground">Set username</span>
              )}
              <Pencil
                className="opacity-0 group-hover:opacity-100 transition text-muted-foreground"
                size={16}
              />
            </button>
          )}

          {/* Member since */}
          <p className="text-sm text-muted-foreground mt-1">
            Member since{" "}
            {profile?.created_at
              ? dayjs(profile.created_at).format("MMMM D, YYYY")
              : "–"}
          </p>
        </CardHeader>

        <CardContent className="pt-4">
          <p className="text-center text-sm text-muted-foreground">
            Manage your public profile and avatar here. Changes are saved
            automatically.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
