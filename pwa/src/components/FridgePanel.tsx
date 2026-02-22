import { useCallback, useState } from "react";
import { useStore } from "../store";
import { Panel, type PanelLine } from "./Panel";

const TEMP_MIN = -20;
const TEMP_MAX = 20;
const RUN_MODES = ["Max", "Eco"];
const CUTOFF_LEVELS = ["Hi", "Mid", "Low"];

interface FridgePanelProps {
  onWriteTarget: (value: number) => void;
  onWriteMode: (value: string) => void;
  onWriteCutoff: (value: string) => void;
}

export function FridgePanel({ onWriteTarget, onWriteMode, onWriteCutoff }: FridgePanelProps) {
  const temp = useStore((s) => s.fridgeTemp);
  const target = useStore((s) => s.fridgeTarget);

  // Local state for mode/cutoff until BLE characteristics are added
  const [mode, setMode] = useState<string>("Eco");
  const [cutoff, setCutoff] = useState<string>("Hi");

  // Local state for slider target (immediate feedback while dragging)
  const [localTarget, setLocalTarget] = useState<number | null>(null);
  const displayTarget = localTarget ?? (target !== null ? Math.round(target) : null);

  const tempText = temp !== null ? `${Math.round(temp)}°C` : "--°C";

  const handleTargetChange = useCallback(
    (value: number) => {
      setLocalTarget(value);
      onWriteTarget(value);
    },
    [onWriteTarget],
  );

  const handleModeChange = useCallback(
    (value: string) => {
      setMode(value);
      onWriteMode(value);
    },
    [onWriteMode],
  );

  const handleCutoffChange = useCallback(
    (value: string) => {
      setCutoff(value);
      onWriteCutoff(value);
    },
    [onWriteCutoff],
  );

  const lines: PanelLine[] = [
    {
      type: "slider",
      value: displayTarget,
      min: TEMP_MIN,
      max: TEMP_MAX,
      unit: "°",
      onChange: handleTargetChange,
    },
    {
      type: "radio",
      label: "Mode",
      options: RUN_MODES,
      value: mode,
      onChange: handleModeChange,
    },
    {
      type: "radio",
      label: "Cutoff",
      options: CUTOFF_LEVELS,
      value: cutoff,
      onChange: handleCutoffChange,
    },
  ];

  return <Panel title="Fridge" headerValue={tempText} lines={lines} />;
}
