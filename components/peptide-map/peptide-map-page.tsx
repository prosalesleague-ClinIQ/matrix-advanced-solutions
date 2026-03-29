"use client";

import { useState, useRef, useCallback } from "react";
import { PeptideMapCanvas } from "./peptide-map-canvas";
import { PeptideMapPanel } from "./peptide-map-panel";
import { PeptideMapSystemNav } from "./peptide-map-system-nav";
import { PeptideMapLegend } from "./peptide-map-legend";
import type { SystemId } from "./data/peptide-data";
import { BODY_SYSTEMS, SYSTEM_MAP, getPeptidesBySystem } from "./data/peptide-data";

export interface SceneState {
  hoveredSystem: SystemId | null;
  selectedSystem: SystemId | null;
  focusedPeptide: string | null;
}

export function PeptideMapPage() {
  const [hoveredSystem, setHoveredSystem] = useState<SystemId | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<SystemId | null>(null);
  const [focusedPeptide, setFocusedPeptide] = useState<string | null>(null);

  // Ref shared with Three.js scene (read every frame)
  const stateRef = useRef<SceneState>({
    hoveredSystem: null,
    selectedSystem: null,
    focusedPeptide: null,
  });

  // Keep ref in sync with React state
  stateRef.current.hoveredSystem = hoveredSystem;
  stateRef.current.selectedSystem = selectedSystem;
  stateRef.current.focusedPeptide = focusedPeptide;

  const handleSystemHover = useCallback((id: SystemId | null) => {
    setHoveredSystem(id);
  }, []);

  const handleSystemSelect = useCallback((id: SystemId | null) => {
    setSelectedSystem(id);
    setFocusedPeptide(null);
  }, []);

  const handlePeptideSelect = useCallback((name: string | null) => {
    setFocusedPeptide(name);
  }, []);

  const handlePanelClose = useCallback(() => {
    setSelectedSystem(null);
    setFocusedPeptide(null);
  }, []);

  const activeSystem = selectedSystem ? SYSTEM_MAP.get(selectedSystem) ?? null : null;
  const activePeptides = selectedSystem ? getPeptidesBySystem(selectedSystem) : [];

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#050b1e]">
      {/* Three.js Canvas */}
      <PeptideMapCanvas
        stateRef={stateRef}
        onSystemHover={handleSystemHover}
        onSystemSelect={handleSystemSelect}
      />

      {/* Top-left legend */}
      <PeptideMapLegend />

      {/* Bottom system navigation */}
      <PeptideMapSystemNav
        systems={BODY_SYSTEMS}
        hoveredSystem={hoveredSystem}
        selectedSystem={selectedSystem}
        onHover={handleSystemHover}
        onSelect={handleSystemSelect}
      />

      {/* Right-side info panel */}
      <PeptideMapPanel
        system={activeSystem}
        peptides={activePeptides}
        focusedPeptide={focusedPeptide}
        onPeptideSelect={handlePeptideSelect}
        onClose={handlePanelClose}
      />
    </div>
  );
}
