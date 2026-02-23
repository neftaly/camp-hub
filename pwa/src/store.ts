import { create } from "zustand";

export const useStore = create<{
  connected: boolean;
  connect: () => void;

  battSoc: number | null;
  battVoltage: number | null;
  battCurrent: number | null;
  battCharging: boolean | null;

  fridgeTemp: number | null;
  fridgeTarget: number | null;
  fridgeMode: string;
  fridgeCutoff: string;
  setFridgeTarget: (v: number) => void;
  setFridgeMode: (v: string) => void;
  setFridgeCutoff: (v: string) => void;
}>((set) => ({
  connected: false,
  connect: () => set({ connected: true }),

  battSoc: null,
  battVoltage: null,
  battCurrent: null,
  battCharging: null,

  fridgeTemp: null,
  fridgeTarget: null,
  fridgeMode: "Eco",
  fridgeCutoff: "Hi",
  setFridgeTarget: (v) => set({ fridgeTarget: v }),
  setFridgeMode: (v) => set({ fridgeMode: v }),
  setFridgeCutoff: (v) => set({ fridgeCutoff: v }),
}));
