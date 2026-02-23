import { create } from "zustand";
import {
  connect as transportConnect,
  type StateEvent,
  type TransportHandle,
} from "./transport";

export type { StateEvent };

interface Store {
  entities: Map<string, StateEvent>;
  connected: boolean;
  connecting: boolean;
  error: string | null;
  connect: () => void;
  setFridgeTarget: (value: number) => void;
  setFridgeMode: (value: string) => void;
  setFridgeCutoff: (value: string) => void;
  setFridgePower: (on: boolean) => void;
}

let transport: TransportHandle | null = null;

function putEntity(
  entities: Map<string, StateEvent>,
  id: string,
  patch: Partial<StateEvent>,
): Map<string, StateEvent> {
  const next = new Map(entities);
  next.set(id, { id, state: "", value: 0, ...next.get(id), ...patch });
  return next;
}

export const useStore = create<Store>((set) => {
  function command(id: string, patch: Partial<StateEvent>, endpoint: string) {
    set((prev) => ({ entities: putEntity(prev.entities, id, patch) }));
    transport?.write(endpoint);
  }

  return {
    entities: new Map(),
    connected: false,
    connecting: false,
    error: null,

    connect: () => {
      transport?.disconnect();
      set({ connecting: true, error: null });

      transport = transportConnect(
        (id, event) => {
          set((prev) => ({ entities: putEntity(prev.entities, id, event) }));
        },
        () => set({ connected: true, connecting: false, error: null }),
        () => set({ connected: false, connecting: false, error: "Connection lost" }),
      );
    },

    setFridgeTarget: (value) =>
      command("sensor-fridge_target", { state: String(value), value },
        `/climate/Fridge/Fridge/set?target_temperature=${value}`),

    setFridgeMode: (value) =>
      command("select-fridge_run_mode", { state: value },
        `/select/Fridge/Fridge%20Run%20Mode/set?option=${value}`),

    setFridgeCutoff: (value) =>
      command("select-fridge_battery_protection", { state: value },
        `/select/Fridge/Fridge%20Battery%20Protection/set?option=${value}`),

    setFridgePower: (on) =>
      command("switch-fridge_power", { state: on ? "ON" : "OFF" },
        `/switch/Fridge/Fridge%20Power/${on ? "turn_on" : "turn_off"}`),
  };
});
