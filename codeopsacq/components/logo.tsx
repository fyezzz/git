/** CodeOps mark: black rounded tile, glowing green gradient border, terminal "[>" glyph. */
export function LogoMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg aria-hidden className={`shrink-0 drop-shadow-[0_0_8px_#02ef7d66] ${className}`} height={size} viewBox="0 0 40 40" width={size}>
      <defs>
        <linearGradient id="cops-edge" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#b6ffd9" />
          <stop offset=".45" stopColor="#02ef7d" />
          <stop offset="1" stopColor="#0a6b3d" />
        </linearGradient>
        <linearGradient id="cops-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#0d1a14" />
          <stop offset="1" stopColor="#050806" />
        </linearGradient>
        <filter height="160%" id="cops-glow" width="160%" x="-30%" y="-30%">
          <feGaussianBlur result="b" stdDeviation="1.2" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect fill="url(#cops-fill)" height="36" rx="9" stroke="url(#cops-edge)" strokeWidth="2" width="36" x="2" y="2" />
      <g fill="none" filter="url(#cops-glow)" stroke="#5dff9f" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.6">
        <path d="M13 11 h-3.5 v18 h3.5" />
        <path d="M19.5 14 l8 6 -8 6" />
      </g>
    </svg>
  );
}

export function Wordmark({ size = 28 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2 font-semibold tracking-tight">
      <LogoMark size={size} />
      <span>
        Code<span className="bg-gradient-to-r from-[#b6ffd9] via-neon to-[#0a8f4f] bg-clip-text text-transparent">Ops</span>
      </span>
    </span>
  );
}
