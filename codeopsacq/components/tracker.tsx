"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** First-party page-view beacon for attribution. */
export function Tracker() {
  const path = usePathname();
  useEffect(() => {
    const body = JSON.stringify({ url: location.href, referrer: document.referrer || null });
    fetch("/api/track", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true }).catch(() => {});
  }, [path]);
  return null;
}
