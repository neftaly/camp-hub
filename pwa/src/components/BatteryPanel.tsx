import { useStore } from "../store";
import { Panel, type PanelLine } from "./Panel";

function formatValue(value: number | null, decimals: number, unit: string): string {
  if (value === null) return `--.-${unit}`;
  return `${value.toFixed(decimals)}${unit}`;
}

function formatCurrent(value: number | null): string {
  if (value === null) return "--.-A";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}A`;
}

export function BatteryPanel() {
  const soc = useStore((s) => s.battSoc);
  const voltage = useStore((s) => s.battVoltage);
  const current = useStore((s) => s.battCurrent);
  const charging = useStore((s) => s.battCharging);

  const socText = soc !== null ? `${Math.round(soc)}%` : "--%";
  const remainingLabel = charging ? "Full in" : "Remaining";
  const currentColor = current === null ? "dim" : charging ? "green" : "accent";

  const lines: PanelLine[] = [
    { type: "text", label: "Current", value: formatCurrent(current), valueColor: currentColor },
    { type: "text", label: remainingLabel, value: "--.-h", valueColor: "dim" },
    { type: "text", label: "Voltage", value: formatValue(voltage, 1, "V"), valueColor: voltage !== null ? undefined : "dim" },
  ];

  return <Panel title="Battery" headerValue={socText} lines={lines} />;
}
