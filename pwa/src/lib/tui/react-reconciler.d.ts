declare module "react-reconciler" {
  import type { ReactNode } from "react";

  interface OpaqueRoot {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type HostConfig = Record<string, any>;

  interface Reconciler<Container> {
    createContainer(
      containerInfo: Container,
      tag: number,
      hydrationCallbacks: null,
      isStrictMode: boolean,
      concurrentUpdatesByDefaultOverride: null,
      identifierPrefix: string,
      onUncaughtError: (error: unknown) => void,
      onCaughtError: (error: unknown) => void,
      onRecoverableError: (error: unknown) => void,
    ): OpaqueRoot;
    updateContainer(
      element: ReactNode | null,
      container: OpaqueRoot,
      parentComponent: null,
      callback: null,
    ): void;
    updateContainerSync(
      element: ReactNode | null,
      container: OpaqueRoot,
      parentComponent: null,
      callback: null,
    ): void;
    flushSyncWork(): void;
  }

  export default function ReactReconciler<Container>(
    hostConfig: HostConfig,
  ): Reconciler<Container>;
}

declare module "react-reconciler/constants" {
  export const DefaultEventPriority: number;
}
