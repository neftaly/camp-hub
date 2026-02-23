import ReactReconciler from "react-reconciler";
import { DefaultEventPriority } from "react-reconciler/constants";
import { createElement, Fragment, type ReactNode } from "react";
import type { TuiNode, BoxNode, TextNode, SliderNode, RadioNode, BoxChild } from "./types";

// --- Container and instance types ---

interface Container {
  children: TuiNode[];
}

type Instance = BoxNode | TextNode | SliderNode | RadioNode;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Props = Record<string, any>;

// --- Instance creation and prop application ---

function applyProps(instance: Instance, props: Props): void {
  switch (instance.type) {
    case "box":
      instance.border = props.border ?? true;
      instance.borderColor = props.borderColor;
      instance.title = props.title;
      instance.headerValue = props.headerValue;
      instance.centered = props.centered;
      break;
    case "text":
      instance.label = props.label;
      instance.value = props.value;
      instance.valueColor = props.valueColor;
      instance.left = props.left;
      instance.leftColor = props.leftColor;
      instance.right = props.right;
      instance.rightColor = props.rightColor;
      instance.rightPrefix = props.rightPrefix;
      instance.rightPrefixColor = props.rightPrefixColor;
      instance.centered = props.centered;
      instance.onClick = props.onClick;
      instance.cursor = props.cursor;
      break;
    case "slider":
      instance.value = props.value;
      instance.min = props.min;
      instance.max = props.max;
      instance.unit = props.unit;
      instance.onChange = props.onChange;
      instance.onDrag = props.onDrag;
      break;
    case "radio":
      instance.label = props.label;
      instance.options = props.options;
      instance.value = props.value;
      instance.onChange = props.onChange;
      break;
  }
}

function createInstance(type: string, props: Props): Instance {
  const instance = (type === "tui-box"
    ? { type: "box", children: [] }
    : type === "tui-text" ? { type: "text" }
    : type === "tui-slider" ? { type: "slider" }
    : type === "tui-radio" ? { type: "radio" }
    : null) as Instance | null;
  if (!instance) throw new Error(`Unknown TUI element type: ${type}`);
  applyProps(instance, props);
  return instance;
}

// --- Tree mutation helpers ---

function appendChild(parent: Instance, child: Instance): void {
  if (parent.type === "box") {
    parent.children.push(child as BoxChild);
  }
}

function removeChild(parent: Instance, child: Instance): void {
  if (parent.type === "box") {
    const idx = parent.children.indexOf(child as BoxChild);
    if (idx >= 0) parent.children.splice(idx, 1);
  }
}

function insertBefore(parent: Instance, child: Instance, before: Instance): void {
  if (parent.type === "box") {
    const idx = parent.children.indexOf(before as BoxChild);
    if (idx >= 0) parent.children.splice(idx, 0, child as BoxChild);
  }
}

// --- Priority tracking (required by react-reconciler 0.33) ---

let currentUpdatePriority = 0;

// --- Host config ---

const hostConfig = {
  supportsMutation: true,
  supportsPersistence: false,
  supportsHydration: false,
  supportsMicrotasks: false,
  supportsTestSelectors: false,
  isPrimaryRenderer: false,
  noTimeout: -1 as const,
  NotPendingTransition: null,
  HostTransitionContext: { $$typeof: Symbol.for("react.context") as symbol, _currentValue: null },

  createInstance,
  createTextInstance() { throw new Error("Raw text is not supported in TUI elements"); },

  appendInitialChild: appendChild,
  appendChild,
  removeChild,
  insertBefore,

  appendChildToContainer(container: Container, child: Instance) {
    if (child.type === "box" || child.type === "text") {
      container.children.push(child);
    }
  },
  removeChildFromContainer(container: Container, child: Instance) {
    const idx = container.children.indexOf(child as TuiNode);
    if (idx >= 0) container.children.splice(idx, 1);
  },
  insertInContainerBefore(container: Container, child: Instance, before: Instance) {
    const idx = container.children.indexOf(before as TuiNode);
    if (idx >= 0) container.children.splice(idx, 0, child as TuiNode);
  },

  commitUpdate(instance: Instance, _type: string, _oldProps: Props, newProps: Props) {
    applyProps(instance, newProps);
  },
  commitMount() {},
  commitTextUpdate() {},

  finalizeInitialChildren() { return false; },
  prepareForCommit() { return null; },
  resetAfterCommit() {},

  shouldSetTextContent() { return false; },
  clearContainer(container: Container) { container.children.length = 0; },

  getPublicInstance(instance: Instance) { return instance; },
  getRootHostContext() { return {}; },
  getChildHostContext(ctx: object) { return ctx; },

  scheduleTimeout: setTimeout,
  cancelTimeout: clearTimeout,

  // Priority methods (required by 0.33)
  setCurrentUpdatePriority(priority: number) { currentUpdatePriority = priority; },
  getCurrentUpdatePriority() { return currentUpdatePriority; },
  resolveUpdatePriority() { return currentUpdatePriority || DefaultEventPriority; },

  getCurrentEventPriority() { return DefaultEventPriority; },
  getInstanceFromNode() { return null; },
  prepareScopeUpdate() {},
  getInstanceFromScope() { return null; },
  detachDeletedInstance() {},
  preparePortalMount() {},

  // Scheduler event tracking (no-ops)
  trackSchedulerEvent() {},
  resolveEventType() {},
  resolveEventTimeStamp() { return -1.1; },
  shouldAttemptEagerTransition() { return false; },
  requestPostPaintCallback() {},

  // Suspense commit (not used)
  maySuspendCommit() { return false; },
  maySuspendCommitOnUpdate() { return false; },
  maySuspendCommitInSyncRender() { return false; },
  preloadInstance() { return true; },
  startSuspendingCommit() {},
  suspendInstance() {},
  waitForCommitToBeReady() { return null; },
  getSuspendedCommitReason() { return "THROTTLED"; },

  // Form/transition support (not used)
  resetFormInstance() {},

  // Visibility (not used — no DOM)
  hideInstance() {},
  hideTextInstance() {},
  unhideInstance() {},
  unhideTextInstance() {},
  resetTextContent() {},

  // Console binding
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bindToConsole(methodName: string, args: any[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (console as any)[methodName].bind(console, ...args);
  },

  scheduleMicrotask: typeof queueMicrotask === "function" ? queueMicrotask : setTimeout,
};

const reconciler = ReactReconciler<Container>(hostConfig);

// --- Public API ---

export interface Root {
  update(children: ReactNode): void;
  getTree(): TuiNode[];
  unmount(): void;
}

export function createRoot(): Root {
  const container: Container = { children: [] };
  const root = reconciler.createContainer(
    container,
    0,     // LegacyRoot (synchronous)
    null,  // hydrationCallbacks
    false, // isStrictMode
    null,  // concurrentUpdatesByDefaultOverride
    "",    // identifierPrefix
    console.error,
    console.error,
    console.error,
  );

  return {
    update(children) {
      reconciler.updateContainerSync(children, root, null, null);
      reconciler.flushSyncWork();
    },
    getTree() {
      return container.children;
    },
    unmount() {
      reconciler.updateContainerSync(null, root, null, null);
      reconciler.flushSyncWork();
    },
  };
}

/** Test utility: render children through the reconciler and return the tree. */
export function buildTree(children: ReactNode[]): TuiNode[] {
  const r = createRoot();
  r.update(createElement(Fragment, null, ...children));
  const tree = [...r.getTree()];
  r.unmount();
  return tree;
}
