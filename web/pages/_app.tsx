import type { AppProps } from "next/app";
import { useState } from "react";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "@/supabase/client";
import "@/styles/globals.css";
import Layout from "@/components/Layout";
import { Toaster } from "sonner";
import DraggableChatbot from "@/components/DraggableChatbot";
import MetaUpdater from "@/components/MetaUpdater";
import { Analytics } from "@vercel/analytics/next";

export default function MyApp({ Component, pageProps }: AppProps) {
  const [initialSession] = useState(pageProps.initialSession);

  return (
    <>
      {/* Injects & keeps <meta name="theme-color"> in sync */}
      <MetaUpdater />

      <SessionContextProvider
        supabaseClient={supabase}
        initialSession={initialSession}
      >
        <Analytics />
        <Layout>
          <Component {...pageProps} />
          <Toaster position="bottom-right" richColors />
          <DraggableChatbot />
        </Layout>
      </SessionContextProvider>
    </>
  );
}
