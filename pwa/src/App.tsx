import { useCallback, useEffect, useRef, useState } from "react";
import { useMachine } from "@xstate/react";
import { bleMachine, type SensorValue } from "./ble";
import { useStore } from "./store";
import { CHAR } from "./constants";
import { StatusBar } from "./components/StatusBar";
import { BatteryPanel } from "./components/BatteryPanel";
import { FridgePanel } from "./components/FridgePanel";
import { ConnectDialog } from "./components/ConnectDialog";

const hasBluetooth = typeof navigator !== "undefined" && "bluetooth" in navigator;

export function App() {
  const [state, send, actorRef] = useMachine(bleMachine);
  const [dismissed, setDismissed] = useState(false);

  // Route SENSOR events from the machine to the Zustand store
  const sensorCallbackRef = useRef((sv: SensorValue) => {
    useStore.getState().setSensor(sv.key, sv.value);
  });
  useEffect(() => {
    const sub = actorRef.on("*", (event) => {
      if (event.type === "SENSOR") {
        const sensorEvent = event as unknown as { type: "SENSOR"; value: SensorValue };
        sensorCallbackRef.current(sensorEvent.value);
      }
    });
    return () => sub.unsubscribe();
  }, [actorRef]);

  const bleState = state.value as "disconnected" | "connecting" | "connected" | "disconnecting";
  const isConnected = bleState === "connected";
  const showDialog = !isConnected && !dismissed;

  const handleConnect = useCallback(() => {
    if (!hasBluetooth) {
      // No BLE available — just dismiss the dialog for dev/preview
      setDismissed(true);
      return;
    }
    useStore.getState().resetSensors();
    setDismissed(false);
    send({ type: "CONNECT" });
  }, [send]);

  // Keep a ref to chars so write callbacks don't cause re-renders
  const charsRef = useRef(state.context.chars);
  charsRef.current = state.context.chars;

  const handleWriteTarget = useCallback((value: number) => {
    const char = charsRef.current.get(CHAR.fridgeTarget);
    if (!char) return;
    const buffer = new ArrayBuffer(4);
    new DataView(buffer).setFloat32(0, value, true);
    char.writeValue(buffer).catch(console.error);
  }, []);

  const handleWriteMode = useCallback((_value: string) => {
    // TODO: needs a command characteristic or separate select protocol
  }, []);

  const handleWriteCutoff = useCallback((_value: string) => {
    // TODO: needs a command characteristic or separate select protocol
  }, []);

  return (
    <>
      <div className={`app${showDialog ? " disconnected" : ""}`}>
        <StatusBar state={isConnected ? "connected" : "disconnected"} />
        <div className="panels">
          <BatteryPanel />
          <FridgePanel
            onWriteTarget={handleWriteTarget}
            onWriteMode={handleWriteMode}
            onWriteCutoff={handleWriteCutoff}
          />
        </div>
      </div>
      {showDialog && (
        <ConnectDialog
          state={bleState === "connecting" ? "connecting" : "disconnected"}
          error={state.context.error}
          onConnect={handleConnect}
        />
      )}
    </>
  );
}
