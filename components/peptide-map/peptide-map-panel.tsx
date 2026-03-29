"use client";

import { X } from "lucide-react";
import type { BodySystem, Peptide } from "./data/peptide-data";
import { getSystemsForPeptide } from "./data/peptide-data";

interface PeptideMapPanelProps {
  system: BodySystem | null;
  peptides: Peptide[];
  focusedPeptide: string | null;
  onPeptideSelect: (name: string | null) => void;
  onClose: () => void;
}

export function PeptideMapPanel({
  system,
  peptides,
  focusedPeptide,
  onPeptideSelect,
  onClose,
}: PeptideMapPanelProps) {
  const isOpen = system !== null;

  return (
    <>
      {/* Desktop: Right-side panel (>= 768px) */}
      <div
        className="hidden md:block absolute top-16 right-0 bottom-0 w-[380px] z-20 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ transform: isOpen ? "translateX(0)" : "translateX(100%)" }}
      >
        <div
          className="h-full flex flex-col rounded-l-2xl overflow-hidden"
          style={{
            background: "rgba(10, 18, 50, 0.85)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderLeft: `1px solid ${system?.color ?? "#4ad6ff"}20`,
            boxShadow: `inset 1px 0 0 ${system?.color ?? "#4ad6ff"}10, -8px 0 30px rgba(0,0,0,0.3)`,
          }}
        >
          {system && <PanelContent system={system} peptides={peptides} focusedPeptide={focusedPeptide} onPeptideSelect={onPeptideSelect} onClose={onClose} />}
        </div>
      </div>

      {/* Mobile: Bottom sheet (< 768px) */}
      <div
        className="md:hidden absolute left-0 right-0 bottom-0 z-20 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          maxHeight: "60vh",
          transform: isOpen ? "translateY(0)" : "translateY(100%)",
        }}
      >
        <div
          className="h-full flex flex-col rounded-t-2xl overflow-hidden"
          style={{
            background: "rgba(10, 18, 50, 0.92)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderTop: `1px solid ${system?.color ?? "#4ad6ff"}20`,
            boxShadow: `0 -8px 30px rgba(0,0,0,0.4)`,
          }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>
          {system && <PanelContent system={system} peptides={peptides} focusedPeptide={focusedPeptide} onPeptideSelect={onPeptideSelect} onClose={onClose} mobile />}
        </div>
      </div>
    </>
  );
}

function PanelContent({
  system,
  peptides,
  focusedPeptide,
  onPeptideSelect,
  onClose,
  mobile = false,
}: {
  system: BodySystem;
  peptides: Peptide[];
  focusedPeptide: string | null;
  onPeptideSelect: (name: string | null) => void;
  onClose: () => void;
  mobile?: boolean;
}) {
  return (
    <>
      {/* Header */}
      <div className={`relative ${mobile ? "px-4 pt-2 pb-3" : "p-5 pb-4"} border-b border-white/5`}>
        <button
          onClick={onClose}
          aria-label="Close panel"
          className="absolute top-3 right-3 p-1.5 rounded-lg text-[#9db4d8]/60 hover:text-[#e6f1ff] hover:bg-white/5 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <span
            className="h-3 w-3 rounded-full shrink-0"
            style={{
              backgroundColor: system.color,
              boxShadow: `0 0 10px ${system.color}60`,
            }}
          />
          <h3 className="font-display text-lg font-bold text-[#e6f1ff]">
            {system.name}
          </h3>
        </div>

        <p className="text-[11px] uppercase tracking-[0.15em] text-[#9db4d8]/50 mb-1.5">
          {system.region}
        </p>
        <p className={`text-xs text-[#9db4d8]/80 leading-relaxed ${mobile ? "line-clamp-2" : ""}`}>
          {system.description}
        </p>

        {/* Targets */}
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {system.targets.map((target) => (
            <span
              key={target}
              className="text-[10px] px-2 py-0.5 rounded-full border"
              style={{
                borderColor: `${system.color}30`,
                color: `${system.color}cc`,
                backgroundColor: `${system.color}08`,
              }}
            >
              {target}
            </span>
          ))}
        </div>
      </div>

      {/* Mechanisms */}
      <div className="px-4 md:px-5 py-2.5 border-b border-white/5">
        <h4 className="text-[10px] uppercase tracking-[0.15em] text-[#9db4d8]/40 mb-1.5">
          Mechanisms of Action
        </h4>
        <ul className="space-y-0.5">
          {system.mechanisms.map((m) => (
            <li key={m} className="flex items-start gap-2 text-[11px] text-[#9db4d8]/70">
              <span
                className="mt-1.5 h-1 w-1 rounded-full shrink-0"
                style={{ backgroundColor: system.color }}
              />
              {m}
            </li>
          ))}
        </ul>
      </div>

      {/* Peptide Cards */}
      <div className="flex-1 overflow-y-auto px-4 md:px-5 py-3">
        <h4 className="text-[10px] uppercase tracking-[0.15em] text-[#9db4d8]/40 mb-2.5">
          Targeting Peptides ({peptides.length})
        </h4>

        <div className="space-y-2.5">
          {peptides.map((peptide) => {
            const isFocused = focusedPeptide === peptide.name;
            const otherSystems = getSystemsForPeptide(peptide.name).filter(
              (s) => s.id !== system.id
            );

            return (
              <button
                key={peptide.name}
                onClick={() =>
                  onPeptideSelect(isFocused ? null : peptide.name)
                }
                className="w-full text-left rounded-xl p-3.5 transition-all duration-200"
                style={{
                  background: isFocused
                    ? `linear-gradient(135deg, ${system.color}15, ${system.color}05)`
                    : "rgba(255,255,255,0.02)",
                  border: `1px solid ${isFocused ? system.color + "40" : "rgba(255,255,255,0.05)"}`,
                  boxShadow: isFocused
                    ? `0 0 20px ${system.color}15, inset 0 0 12px ${system.color}08`
                    : "none",
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <h5 className="font-display text-sm font-semibold text-[#e6f1ff]">
                    {peptide.name}
                  </h5>
                  <span className="text-[9px] px-2 py-0.5 rounded-full border border-[#d44cff]/25 text-[#d44cff]/80 whitespace-nowrap">
                    {peptide.category}
                  </span>
                </div>

                <p className={`mt-1.5 text-[11px] text-[#9db4d8]/70 leading-relaxed ${mobile ? "line-clamp-2" : ""}`}>
                  {peptide.mechanism}
                </p>

                {/* Cross-system badges */}
                {otherSystems.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    <span className="text-[9px] text-[#9db4d8]/40 mr-0.5 self-center">
                      Also targets:
                    </span>
                    {otherSystems.map((sys) => (
                      <span
                        key={sys.id}
                        className="text-[9px] px-1.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${sys.color}12`,
                          color: `${sys.color}bb`,
                          border: `1px solid ${sys.color}20`,
                        }}
                      >
                        {sys.name}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clinical Outcomes */}
      <div className="px-4 md:px-5 py-2.5 border-t border-white/5">
        <h4 className="text-[10px] uppercase tracking-[0.15em] text-[#9db4d8]/40 mb-1.5">
          Clinical Outcomes
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {system.outcomes.map((o) => (
            <span
              key={o}
              className="text-[10px] px-2 py-0.5 rounded-full bg-[#4aff9f]/8 text-[#4aff9f]/70 border border-[#4aff9f]/15"
            >
              {o}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
