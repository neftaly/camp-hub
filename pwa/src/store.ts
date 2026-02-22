import { create } from "zustand";
import type { CharKey } from "./constants";

interface SensorState {
  // Battery
  battSoc: number | null;
  battVoltage: number | null;
  battCurrent: number | null;
  battPower: number | null;
  battTemp1: number | null;
  battTemp2: number | null;
  battCharging: boolean | null;
  battDischarging: boolean | null;
  battOnline: boolean | null;
  bmsEnableCharging: boolean | null;
  bmsEnableDischarging: boolean | null;

  // Fridge
  fridgeTemp: number | null;
  fridgeTarget: number | null;
  fridgePoweredOn: boolean | null;
  fridgePower: boolean | null;

  // Timestamp of last received value
  lastUpdate: number | null;

  setSensor: (key: CharKey, value: number) => void;
  resetSensors: () => void;
}

const BOOL_KEYS = new Set<CharKey>([
  "battCharging",
  "battDischarging",
  "battOnline",
  "bmsEnableCharging",
  "bmsEnableDischarging",
  "fridgePoweredOn",
  "fridgePower",
]);

const initialSensors = {
  battSoc: null,
  battVoltage: null,
  battCurrent: null,
  battPower: null,
  battTemp1: null,
  battTemp2: null,
  battCharging: null,
  battDischarging: null,
  battOnline: null,
  bmsEnableCharging: null,
  bmsEnableDischarging: null,
  fridgeTemp: null,
  fridgeTarget: null,
  fridgePoweredOn: null,
  fridgePower: null,
  lastUpdate: null,
} as const;

export const useStore = create<SensorState>((set) => ({
  ...initialSensors,

  setSensor: (key, value) =>
    set({
      [key]: BOOL_KEYS.has(key) ? value !== 0 : value,
      lastUpdate: Date.now(),
    }),

  resetSensors: () => set(initialSensors),
}));
