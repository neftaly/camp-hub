import { useCallback, useEffect, useState } from "react";
import { Tui, Box, Text, Slider, Radio } from "./lib/tui";
import {
  useBattery,
  useFridge,
  TEMP_MIN,
  TEMP_MAX,
  RUN_MODES,
  CUTOFF_LEVELS,
} from "./panels";
import { useStore } from "./store";

function formatCurrent(value: number | null): string {
  if (value === null) return "--.-A";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}A`;
}

export function App() {
  const connected = useStore((s) => s.connected);
  const { soc, voltage, current, charging } = useBattery();
  const { temperature, target, mode, cutoff, power, setTarget, setMode, setCutoff, setPower } =
    useFridge();

  const socText = soc !== null ? `${Math.round(soc)}%` : "--%";
  const currentText = formatCurrent(current);
  const currentColor = current === null ? "dim" : charging ? "green" : "accent";
  const remainingLabel = charging ? "Full in" : "Remaining";
  const voltageText = voltage !== null ? `${voltage.toFixed(1)}V` : "--.-V";
  const voltageColor = voltage !== null ? undefined : "dim";
  const tempText =
    temperature !== null ? `${Math.round(temperature)}°C` : "--°C";
  const displayTarget = target !== null ? Math.round(target) : null;
  const [dragTarget, setDragTarget] = useState<number | null>(null);
  const onTargetChange = useCallback((v: number) => {
    setDragTarget(null);
    setTarget(v);
  }, [setTarget]);

  useEffect(() => {
    document.title = `Camp Hub - ${socText}`;
  }, [socText]);

  return (
    <div className="app">
      <Tui>
        <Text
          left="Camp Hub"
          leftColor="accent"
          rightPrefix={connected ? "●" : "○"}
          rightPrefixColor={connected ? "green" : "red"}
          right=" WiFi"
          rightColor="label"
        />
        <Box border title="Battery" headerValue={socText}>
          <Text label="Current" value={currentText} valueColor={currentColor} />
          <Text label={remainingLabel} value="--.-h" valueColor="dim" />
          <Text label="Voltage" value={voltageText} valueColor={voltageColor} />
        </Box>
        <Box border title="Fridge" headerValue={tempText}>
          <Radio
            label="Power"
            options={["On", "Off"]}
            value={power === null ? "Off" : power ? "On" : "Off"}
            onChange={(v) => setPower(v === "On")}
          />
          <Slider
            value={dragTarget ?? displayTarget}
            min={TEMP_MIN}
            max={TEMP_MAX}
            unit="°"
            onChange={onTargetChange}
            onDrag={setDragTarget}
          />
          <Radio
            label="Mode"
            options={RUN_MODES}
            value={mode ?? "Eco"}
            onChange={setMode}
          />
          <Radio
            label="Batt. Protect"
            options={CUTOFF_LEVELS}
            value={cutoff ?? "High"}
            onChange={setCutoff}
          />
        </Box>
      </Tui>
    </div>
  );
}
