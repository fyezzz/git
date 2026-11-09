import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

/** Branded social card: black field, glowing [> mark, headline, kicker. Used for Open Graph and Twitter. */
export function ogCard({ kicker, title, sub }: { kicker: string; title: string; sub: string }) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, backgroundColor: "#0b0f17", backgroundImage: "radial-gradient(70% 60% at 85% 20%, rgba(2,239,125,0.22), rgba(11,15,23,0))", color: "#e8edf5", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="76" height="76" viewBox="0 0 40 40">
            <defs>
              <linearGradient id="e" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0" stopColor="#b6ffd9" />
                <stop offset=".45" stopColor="#02ef7d" />
                <stop offset="1" stopColor="#0a6b3d" />
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="36" height="36" rx="9" fill="#060a08" stroke="url(#e)" strokeWidth="2.5" />
            <path d="M13 11h-3.5v18h3.5" fill="none" stroke="#5dff9f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M19.5 14l8 6-8 6" fill="none" stroke="#5dff9f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 700 }}>
            CodeOps<span style={{ color: "#02ef7d" }}>Acq</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 24, letterSpacing: 6, textTransform: "uppercase", color: "#02ef7d" }}>{kicker}</div>
          <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, maxWidth: 1000 }}>{title}</div>
          <div style={{ fontSize: 28, color: "#8b95a8", maxWidth: 980 }}>{sub}</div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
