"use client";

import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import type { SceneState } from "./peptide-map-page";
import type { SystemId } from "./data/peptide-data";

export interface SceneCallbacks {
  onSystemHover: (id: SystemId | null) => void;
  onSystemSelect: (id: SystemId | null) => void;
}

interface PeptideMapCanvasProps {
  stateRef: MutableRefObject<SceneState>;
  onSystemHover: (id: SystemId | null) => void;
  onSystemSelect: (id: SystemId | null) => void;
}

export function PeptideMapCanvas({
  stateRef,
  onSystemHover,
  onSystemSelect,
}: PeptideMapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const disposeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    let disposed = false;

    import("./scene/scene").then(({ initPeptideMapScene }) => {
      if (disposed || !canvasRef.current) return;

      const callbacks: SceneCallbacks = { onSystemHover, onSystemSelect };
      const { dispose } = initPeptideMapScene(
        canvasRef.current,
        callbacks,
        stateRef
      );
      disposeRef.current = dispose;
    });

    return () => {
      disposed = true;
      disposeRef.current?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ display: "block" }}
    />
  );
}
