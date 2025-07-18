// pages/_app.tsx
import type { AppProps } from "next/app";
import { useState } from "react";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "@/supabase/client";
import "@/styles/globals.css";
import Layout from "@/components/Layout";
import { Toaster } from "sonner";
import DraggableChatbot from "@/components/DraggableChatbot";

export default function MyApp({ Component, pageProps }: AppProps) {
  const [initialSession] = useState(pageProps.initialSession);

  return (
    <SessionContextProvider
      supabaseClient={supabase}
      initialSession={initialSession}
    >
      <Layout>
        <Component {...pageProps} />
        {/* Sonner toasts */}
        <Toaster position="bottom-right" richColors />
        {/* Draggable AI Chatbot */}
        <DraggableChatbot />
      </Layout>
    </SessionContextProvider>
  );
}
