import { useEffect } from "react";
import { Tui, Box, Text, Slider, Radio } from "./lib/tui";
import { useBattery, useFridge, RUN_MODES, CUTOFF_LEVELS } from "./panels";
import { useStore } from "./store";

export function App() {
  const connected = useStore((s) => s.connected);
  const { socText, remainingLabel, currentText, currentColor, voltageText, voltageColor } = useBattery();
  const { tempText, displayTarget, min, max, mode, cutoff, handleTargetChange, handleModeChange, handleCutoffChange } = useFridge();

  useEffect(() => {
    document.title = `Camp Hub - ${socText}`;
  }, [socText]);

  return (
    <div className="app">
      <Tui>
        <Text left="Camp Hub" leftColor="accent" rightPrefix={connected ? "●" : "○"} rightPrefixColor={connected ? "green" : "red"} right=" BLE" rightColor="label" />
        <Box border title="Battery" headerValue={socText}>
          <Text label="Current" value={currentText} valueColor={currentColor} />
          <Text label={remainingLabel} value="--.-h" valueColor="dim" />
          <Text label="Voltage" value={voltageText} valueColor={voltageColor} />
        </Box>
        <Box border title="Fridge" headerValue={tempText}>
          <Slider value={displayTarget} min={min} max={max} unit="°" onChange={handleTargetChange} />
          <Radio label="Mode" options={RUN_MODES} value={mode} onChange={handleModeChange} />
          <Radio label="Cutoff" options={CUTOFF_LEVELS} value={cutoff} onChange={handleCutoffChange} />
        </Box>
      </Tui>
    </div>
  );
}
