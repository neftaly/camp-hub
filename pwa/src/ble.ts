import { setup, assign, fromPromise, fromCallback } from "xstate";
import {
  BATTERY_SERVICE,
  FRIDGE_SERVICE,
  CHAR,
  FLOAT_CHARS,
  UUID_TO_KEY,
  type CharKey,
} from "./constants";

export type SensorValue = { key: CharKey; value: number };

// Decoded value from a BLE characteristic DataView
function decodeValue(key: CharKey, view: DataView): number {
  return FLOAT_CHARS.has(key) ? view.getFloat32(0, true) : view.getUint8(0);
}

// Connect to GATT server and discover services/characteristics
const connectLogic = fromPromise(async () => {
  const device = await navigator.bluetooth.requestDevice({
    filters: [{ services: [BATTERY_SERVICE] }],
    optionalServices: [FRIDGE_SERVICE],
  });

  const server = await device.gatt!.connect();

  const chars = new Map<string, BluetoothRemoteGATTCharacteristic>();

  for (const serviceUuid of [BATTERY_SERVICE, FRIDGE_SERVICE]) {
    try {
      const service = await server.getPrimaryService(serviceUuid);
      const discovered = await service.getCharacteristics();
      for (const char of discovered) {
        chars.set(char.uuid, char);
      }
    } catch {
      // Fridge service may not exist if fridge isn't paired
      console.warn(`Service ${serviceUuid} not found`);
    }
  }

  return { device, server, chars };
});

// Subscribe to notifications and initial reads
const subscribeLogic = fromCallback<
  { type: "SENSOR"; value: SensorValue },
  { chars: Map<string, BluetoothRemoteGATTCharacteristic> }
>(({ sendBack, input }) => {
  const abortController = new AbortController();

  (async () => {
    for (const [uuid, char] of input.chars) {
      if (abortController.signal.aborted) return;

      const key = UUID_TO_KEY.get(uuid);
      if (!key) continue;

      // Initial read
      try {
        const value = await char.readValue();
        sendBack({ type: "SENSOR", value: { key, value: decodeValue(key, value) } });
      } catch {
        // Some characteristics may not be readable yet
      }

      // Subscribe to notifications
      if (char.properties.notify) {
        char.addEventListener("characteristicvaluechanged", ((event: Event) => {
          const target = event.target as BluetoothRemoteGATTCharacteristic;
          const view = target.value!;
          sendBack({ type: "SENSOR", value: { key, value: decodeValue(key, view) } });
        }) as EventListener);
        try {
          await char.startNotifications();
        } catch {
          console.warn(`Failed to start notifications for ${key}`);
        }
      }
    }
  })();

  return () => abortController.abort();
});

// Watch for GATT disconnect
const disconnectWatchLogic = fromCallback<
  { type: "GATT_DISCONNECT" },
  { device: BluetoothDevice }
>(({ sendBack, input }) => {
  const handler = () => sendBack({ type: "GATT_DISCONNECT" });
  input.device.addEventListener("gattserverdisconnected", handler);
  return () => input.device.removeEventListener("gattserverdisconnected", handler);
});

export const bleMachine = setup({
  types: {
    context: {} as {
      device: BluetoothDevice | null;
      server: BluetoothRemoteGATTServer | null;
      chars: Map<string, BluetoothRemoteGATTCharacteristic>;
      error: string | null;
    },
    events: {} as
      | { type: "CONNECT" }
      | { type: "DISCONNECT" }
      | { type: "SENSOR"; value: SensorValue }
      | { type: "GATT_DISCONNECT" }
      | { type: "WRITE"; key: CharKey; value: number },
  },
  actors: {
    connect: connectLogic,
    subscribe: subscribeLogic,
    disconnectWatch: disconnectWatchLogic,
  },
}).createMachine({
  id: "ble",
  initial: "disconnected",
  context: {
    device: null,
    server: null,
    chars: new Map(),
    error: null,
  },
  states: {
    disconnected: {
      on: {
        CONNECT: "connecting",
      },
    },
    connecting: {
      invoke: {
        src: "connect",
        onDone: {
          target: "connected",
          actions: assign(({ event }) => ({
            device: event.output.device,
            server: event.output.server,
            chars: event.output.chars,
            error: null,
          })),
        },
        onError: {
          target: "disconnected",
          actions: assign({
            error: ({ event }) =>
              event.error instanceof Error ? event.error.message : "Connection failed",
          }),
        },
      },
    },
    connected: {
      invoke: [
        {
          src: "subscribe",
          input: ({ context }) => ({ chars: context.chars }),
        },
        {
          src: "disconnectWatch",
          input: ({ context }) => ({ device: context.device! }),
        },
      ],
      on: {
        SENSOR: {},  // Handled by store subscription, not context
        DISCONNECT: {
          target: "disconnecting",
        },
        GATT_DISCONNECT: {
          target: "disconnected",
          actions: assign({
            device: null,
            server: null,
            chars: new Map(),
            error: "Connection lost",
          }),
        },
        WRITE: {
          actions: ({ context, event }) => {
            const uuid = CHAR[event.key];
            const char = context.chars.get(uuid);
            if (!char) return;

            const buffer = new ArrayBuffer(1);
            new DataView(buffer).setUint8(0, event.value);
            char.writeValue(buffer).catch(console.error);
          },
        },
      },
    },
    disconnecting: {
      entry: ({ context }) => {
        context.server?.disconnect();
      },
      always: {
        target: "disconnected",
        actions: assign({
          device: null,
          server: null,
          chars: new Map(),
          error: null,
        }),
      },
    },
  },
});
