// pages/_document.tsx
import Document, { Html, Head, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en" className="scroll-smooth font-sans antialiased">
        <Head>
          {/* Primary Meta Tags */}
          <meta charSet="utf-8" />
          <title>Boxed — Your Smart Home Inventory & Packing Assistant</title>
          <meta
            name="description"
            content="Boxed helps you know where your stuff is. Create boxes, add items & photos, tag types, collaborate, then ask BoxedAI “Where’s my winter jacket?”—all powered by AI and instant context."
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />

          {/* PWA Manifest */}
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#ffffff" />

          {/* Favicons */}
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16x16.png"
          />

          {/* Open Graph / Facebook */}
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://boxed.app" />
          <meta
            property="og:title"
            content="Boxed — Your Smart Home Inventory & Packing Assistant"
          />
          <meta
            property="og:description"
            content="Boxed helps you know where your stuff is. Create boxes, add items & photos, tag types, collaborate, then ask BoxedAI “Where’s my winter jacket?”"
          />
          <meta
            property="og:image"
            content="https://boxed.app/android-chrome-512x512.png"
          />

          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@hoangsonww" />
          <meta
            name="twitter:title"
            content="Boxed — Your Smart Home Inventory & Packing Assistant"
          />
          <meta
            name="twitter:description"
            content="Boxed helps you know where your stuff is. Create boxes, add items & photos, tag types, collaborate, then ask BoxedAI “Where’s my winter jacket?”"
          />
          <meta
            name="twitter:image"
            content="https://boxed.app/android-chrome-512x512.png"
          />

          {/* Sitemap hint */}
          <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        </Head>
        <body className="bg-neutral-50 text-neutral-900">
        <Main />
        <NextScript />
        </body>
      </Html>
    );
  }
}
