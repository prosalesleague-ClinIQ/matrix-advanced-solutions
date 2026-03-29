"use client";

export function PeptideMapLegend() {
  return (
    <div className="absolute top-20 left-4 z-20 max-w-[220px] md:max-w-[220px] max-w-[180px]">
      <div
        className="rounded-xl p-3 md:p-4"
        style={{
          background: "rgba(10, 18, 50, 0.7)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(74, 214, 255, 0.08)",
        }}
      >
        <h2 className="font-display text-xs md:text-sm font-bold text-[#e6f1ff] neon-heading mb-1.5">
          Peptide Intelligence Map
        </h2>
        <p className="text-[9px] md:text-[10px] text-[#9db4d8]/70 leading-relaxed">
          Hover over body regions to explore biological systems.
          Click a region to view targeting peptides and mechanisms.
        </p>
        <div className="mt-2 flex items-center gap-2 text-[9px] md:text-[10px] text-[#9db4d8]/50">
          <span className="h-1.5 w-1.5 rounded-full bg-[#4ad6ff] animate-pulse" />
          <span>Interactive — click to explore</span>
        </div>
      </div>
    </div>
  );
}
