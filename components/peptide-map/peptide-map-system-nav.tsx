"use client";

import type { SystemId, BodySystem } from "./data/peptide-data";

interface PeptideMapSystemNavProps {
  systems: BodySystem[];
  hoveredSystem: SystemId | null;
  selectedSystem: SystemId | null;
  onHover: (id: SystemId | null) => void;
  onSelect: (id: SystemId | null) => void;
}

export function PeptideMapSystemNav({
  systems,
  hoveredSystem,
  selectedSystem,
  onHover,
  onSelect,
}: PeptideMapSystemNavProps) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 max-w-[95vw]">
      <div className="landing-surface rounded-2xl px-3 py-2.5 flex items-center gap-1 overflow-x-auto scrollbar-hide">
        {systems.map((system) => {
          const isHovered = hoveredSystem === system.id;
          const isSelected = selectedSystem === system.id;

          return (
            <button
              key={system.id}
              onMouseEnter={() => onHover(system.id)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onSelect(isSelected ? null : system.id)}
              className="group flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-medium transition-all duration-200"
              style={{
                backgroundColor: isSelected
                  ? `${system.color}25`
                  : isHovered
                    ? `${system.color}10`
                    : "transparent",
                color: isSelected || isHovered ? system.color : "#9db4d8",
                boxShadow: isSelected
                  ? `0 0 12px ${system.color}30, inset 0 0 8px ${system.color}10`
                  : "none",
              }}
            >
              <span
                className="h-2 w-2 rounded-full shrink-0 transition-shadow duration-200"
                style={{
                  backgroundColor: system.color,
                  boxShadow:
                    isSelected || isHovered
                      ? `0 0 6px ${system.color}80`
                      : "none",
                }}
              />
              {system.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
