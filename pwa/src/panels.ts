import { useStore } from "./store";

// --- Battery ---

function formatValue(value: number | null, decimals: number, unit: string): string {
  if (value === null) return `--.-${unit}`;
  return `${value.toFixed(decimals)}${unit}`;
}

function formatCurrent(value: number | null): string {
  if (value === null) return "--.-A";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}A`;
}

export function useBattery() {
  const soc = useStore((s) => s.battSoc);
  const voltage = useStore((s) => s.battVoltage);
  const current = useStore((s) => s.battCurrent);
  const charging = useStore((s) => s.battCharging);

  return {
    socText: soc !== null ? `${Math.round(soc)}%` : "--%",
    remainingLabel: charging ? "Full in" : "Remaining",
    currentText: formatCurrent(current),
    currentColor: current === null ? "dim" as const : charging ? "green" as const : "accent" as const,
    voltageText: formatValue(voltage, 1, "V"),
    voltageColor: voltage !== null ? undefined : ("dim" as const),
  };
}

// --- Fridge ---

const TEMP_MIN = -20;
const TEMP_MAX = 20;
export const RUN_MODES = ["Max", "Eco"];
export const CUTOFF_LEVELS = ["Hi", "Mid", "Low"];

export function useFridge() {
  const temp = useStore((s) => s.fridgeTemp);
  const target = useStore((s) => s.fridgeTarget);
  const mode = useStore((s) => s.fridgeMode);
  const cutoff = useStore((s) => s.fridgeCutoff);
  const setTarget = useStore((s) => s.setFridgeTarget);
  const setMode = useStore((s) => s.setFridgeMode);
  const setCutoff = useStore((s) => s.setFridgeCutoff);

  return {
    tempText: temp !== null ? `${Math.round(temp)}°C` : "--°C",
    displayTarget: target !== null ? Math.round(target) : null,
    min: TEMP_MIN,
    max: TEMP_MAX,
    mode,
    cutoff,
    handleTargetChange: setTarget,
    handleModeChange: setMode,
    handleCutoffChange: setCutoff,
  };
}
