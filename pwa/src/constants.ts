const BASE = "c4400000-ca6d-4860-ab60-e3a84b";

export const BATTERY_SERVICE = `${BASE}000000`;
export const FRIDGE_SERVICE = `${BASE}000100`;

// Suffixed onto the base to form full characteristic UUIDs
export const CHAR = {
  battSoc: `${BASE}000001`,
  battVoltage: `${BASE}000002`,
  battCurrent: `${BASE}000003`,
  battPower: `${BASE}000004`,
  battTemp1: `${BASE}000005`,
  battTemp2: `${BASE}000006`,
  battCharging: `${BASE}000007`,
  battDischarging: `${BASE}000008`,
  battOnline: `${BASE}000009`,
  bmsEnableCharging: `${BASE}00000a`,
  bmsEnableDischarging: `${BASE}00000b`,
  fridgeTemp: `${BASE}000101`,
  fridgeTarget: `${BASE}000102`,
  fridgePoweredOn: `${BASE}000103`,
  fridgePower: `${BASE}000104`,
} as const;

export type CharKey = keyof typeof CHAR;

// Which characteristics are float32 vs uint8
export const FLOAT_CHARS = new Set<CharKey>([
  "battSoc",
  "battVoltage",
  "battCurrent",
  "battPower",
  "battTemp1",
  "battTemp2",
  "fridgeTemp",
  "fridgeTarget",
]);

// Which characteristics are writable (switches)
export const WRITABLE_CHARS = new Set<CharKey>([
  "bmsEnableCharging",
  "bmsEnableDischarging",
  "fridgePower",
]);

// Map characteristic UUID -> key for reverse lookup in notification handler
export const UUID_TO_KEY = new Map<string, CharKey>(
  Object.entries(CHAR).map(([key, uuid]) => [uuid, key as CharKey]),
);
