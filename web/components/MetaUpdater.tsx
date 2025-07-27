"use client";

import { useEffect } from "react";

export default function MetaUpdater() {
  useEffect(() => {
    const updateMeta = () => {
      // detect dark by the html.dark class
      const isDark = document.documentElement.classList.contains("dark");

      // find or create the theme-color meta
      let meta = document.querySelector<HTMLMetaElement>(
        'meta[name="theme-color"]',
      );
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "theme-color";
        document.head.appendChild(meta);
      }

      // update it instantly
      meta.content = isDark ? "#1e1b18" : "#ffffff";
    };

    // run at mount
    updateMeta();

    // observe class changes on <html> so toggles fire instantly
    const mo = new MutationObserver(updateMeta);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // also update on OS‐level preference flips
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    mql.addEventListener("change", updateMeta);

    return () => {
      mo.disconnect();
      mql.removeEventListener("change", updateMeta);
    };
  }, []);

  return null;
}
