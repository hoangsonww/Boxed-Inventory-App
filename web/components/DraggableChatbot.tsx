"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

import { MessageSquare, Send, Loader2, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { chatWithBoxAI } from "@/lib/chatWithBoxAI";

// Types we expect
type BoxRow = {
  id: string;
  name: string;
  location: string | null;
  status: string;
  owner_profile_id: string;
  photo_url?: string | null;
  created_at?: string;
};

type ItemRow = {
  id: string;
  box_id: string;
  name: string;
  quantity: number | null;
  photo_url?: string | null;
  created_at?: string;
};

type CollaboratorRow = {
  box_id: string;
  collaborator_profile_id: string;
  role: string;
};

interface ChatMsg {
  sender: "user" | "assistant";
  text: string;
}

const LOCAL_STORAGE_KEY = "boxedChatHistory_v1";
const INVENTORY_CACHE_KEY = "boxedInventoryCache_v1";
const INVENTORY_CACHE_TTL_MS = 60_000; // 1 minute (adjust)

export default function Chatbot() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const isLoggedIn = !!session?.user;

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [contextReady, setContextReady] = useState(false);
  const [contextSummary, setContextSummary] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const summarizeInventory = useCallback(
    (boxes: BoxRow[], items: ItemRow[], collaborators: CollaboratorRow[]) => {
      if (!boxes.length) return "User has no boxes.";

      // Build quick lookups
      const itemsByBox: Record<string, ItemRow[]> = {};
      items.forEach((it) => {
        itemsByBox[it.box_id] = itemsByBox[it.box_id] || [];
        itemsByBox[it.box_id].push(it);
      });

      const collabsByBox: Record<string, CollaboratorRow[]> = {};
      collaborators.forEach((c) => {
        collabsByBox[c.box_id] = collabsByBox[c.box_id] || [];
        collabsByBox[c.box_id].push(c);
      });

      // Limit to avoid overly large prompts
      const MAX_BOXES = 30;
      const MAX_ITEMS_PER_BOX = 25;

      const parts: string[] = [];
      parts.push(`Total boxes: ${boxes.length}. Total items: ${items.length}.`);

      boxes.slice(0, MAX_BOXES).forEach((b) => {
        const its = (itemsByBox[b.id] || []).slice(0, MAX_ITEMS_PER_BOX);
        const collabs = collabsByBox[b.id] || [];
        const itemSumm = its
          .map(
            (it) =>
              `${it.name}${it.quantity ? ` (qty ${it.quantity})` : ""}${
                it.photo_url ? "[img]" : ""
              }`,
          )
          .join(", ");

        parts.push(
          `Box: "${b.name}" (id:${b.id}) status:${b.status} ${
            b.location ? `loc:${b.location}` : "loc:unknown"
          } items:${its.length}${
            itemsByBox[b.id] && itemsByBox[b.id].length > MAX_ITEMS_PER_BOX
              ? "+"
              : ""
          }${its.length ? ` => ${itemSumm}` : ""}${
            collabs.length
              ? ` collaborators:${collabs
                  .map((c) => `${c.collaborator_profile_id}(${c.role})`)
                  .join(";")}`
              : ""
          }`,
        );
      });

      if (boxes.length > MAX_BOXES)
        parts.push(
          `… (truncated; ${boxes.length - MAX_BOXES} more boxes not listed)`,
        );

      const ctx = parts.join("\n");
      return ctx.slice(0, 16_000); // final safety cutoff
    },
    [],
  );

  const fetchInventoryContext = useCallback(async () => {
    if (!session?.user) return;

    setContextReady(false);

    // Cache logic
    try {
      const cachedRaw = localStorage.getItem(INVENTORY_CACHE_KEY);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw) as {
          t: number;
          summary: string;
        };
        if (Date.now() - cached.t < INVENTORY_CACHE_TTL_MS) {
          setContextSummary(cached.summary);
          setContextReady(true);
          return;
        }
      }
    } catch {
      /* ignore */
    }

    // Fetch boxes
    const { data: boxesData, error: boxErr } = await supabase
      .from("boxes")
      .select("id,name,location,status,owner_profile_id,photo_url,created_at")
      .eq("owner_profile_id", session.user.id);

    if (boxErr) {
      setContextSummary("Error fetching boxes.");
      setContextReady(true);
      return;
    }

    // Fetch items for those boxes
    const boxIds = (boxesData || []).map((b) => b.id);
    let itemsData: ItemRow[] = [];
    if (boxIds.length) {
      const { data: itemsRaw, error: itemsErr } = await supabase
        .from("items")
        .select("id,box_id,name,quantity,photo_url,created_at")
        .in("box_id", boxIds);
      if (itemsErr) {
        setContextSummary("Error fetching items.");
        setContextReady(true);
        return;
      }
      itemsData = itemsRaw || [];
    }

    // Fetch collaborators
    let collabsData: CollaboratorRow[] = [];
    if (boxIds.length) {
      const { data: collabsRaw, error: collabsErr } = await supabase
        .from("box_collaborators")
        .select("box_id,collaborator_profile_id,role")
        .in("box_id", boxIds);
      if (!collabsErr) {
        collabsData = collabsRaw || [];
      }
    }

    const summary = summarizeInventory(
      (boxesData as BoxRow[]) || [],
      itemsData,
      collabsData,
    );
    setContextSummary(summary);
    setContextReady(true);

    try {
      localStorage.setItem(
        INVENTORY_CACHE_KEY,
        JSON.stringify({ t: Date.now(), summary }),
      );
    } catch {
      /* ignore */
    }
  }, [session?.user, supabase, summarizeInventory]);

  useEffect(() => {
    if (open && isLoggedIn && !contextReady) {
      void fetchInventoryContext();
    }
  }, [open, isLoggedIn, contextReady, fetchInventoryContext]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Persist messages
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* ignore */
    }
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading || !contextReady) return;
    const text = input.trim();
    setMessages((m) => [...m, { sender: "user", text }]);
    setInput("");
    setLoading(true);

    // Convert messages to history format
    const history = messages.map((m) => ({
      role: m.sender,
      parts: [{ text: m.text }],
    }));

    try {
      const reply = await chatWithBoxAI(history, text, contextSummary);
      setMessages((m) => [...m, { sender: "assistant", text: reply }]);
    } catch (e) {
      console.error("💥 chatWithBoxAI error:", e);
      setMessages((m) => [
        ...m,
        { sender: "assistant", text: "❌ Error: Could not get a response." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  if (!isLoggedIn) return null;

  return (
    <div className="fixed top-1/2 -translate-y-1/2 left-2 z-40">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            className="rounded-full h-10 w-10 p-0 shadow-md"
            variant="default"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-card">
          <DialogHeader className="px-5 pt-5 pb-3 border-b bg-card/70 backdrop-blur">
            <DialogTitle className="text-lg font-semibold">BoxedAI</DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              Ask about your items, where something is, or get packing tips.
            </DialogDescription>
          </DialogHeader>

          {/* Messages */}
          <div className="px-5 pt-4 pb-2">
            <ScrollArea className="h-72 pr-2">
              <div className="space-y-4 text-sm">
                {!messages.length && !loading && (
                  <>
                    <div className="flex h-10 w-full items-center justify-center text-muted-foreground">
                      <MessageSquare className="h-8 w-8" />
                    </div>
                    <p className="text-center text-muted-foreground">
                      Start a conversation! For example, try: “Where is my
                      winter jacket?”
                    </p>
                  </>
                )}

                {!contextReady && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading your inventory…
                  </div>
                )}

                {messages.map((m, i) => {
                  const isUser = m.sender === "user";
                  return (
                    <div
                      key={i}
                      className={`flex w-full ${
                        isUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm break-words prose prose-invert dark:prose-invert ${
                          isUser
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            a: (props) => (
                              <a
                                {...props}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline underline-offset-2"
                              />
                            ),
                            // @ts-ignore
                            code: ({ inline, children, ...props }) =>
                              inline ? (
                                <code
                                  className="rounded bg-background/50 px-1 py-0.5 text-xs"
                                  {...props}
                                >
                                  {children}
                                </code>
                              ) : (
                                <pre className="rounded bg-background/80 p-2 text-xs overflow-x-auto">
                                  <code {...props}>{children}</code>
                                </pre>
                              ),
                          }}
                        >
                          {m.text}
                        </ReactMarkdown>
                      </div>
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Thinking…
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>

          {/* Input */}
          <div className="px-5 pb-4 pt-1 space-y-3">
            <div className="flex items-end gap-2">
              <Textarea
                placeholder={
                  contextReady ? "Type your message…" : "Loading inventory…"
                }
                className="resize-none h-20 text-sm"
                disabled={loading || !contextReady}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
              />
              <Button
                onClick={send}
                disabled={loading || !input.trim() || !contextReady}
                className="h-10 px-4 shrink-0 self-end"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearChat}
                disabled={loading || messages.length === 0}
                className="text-xs"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
              <span className="text-[10px] text-muted-foreground">
                Press Enter to send · Press Shift + Enter to add a newline
              </span>
            </div>
          </div>

          <DialogFooter className="hidden" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
