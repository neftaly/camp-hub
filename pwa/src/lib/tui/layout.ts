import YogaDefault, { FlexDirection, Edge, Direction } from "yoga-layout";
import type {
  TuiNode,
  BoxChild,
  LayoutNode,
  LayoutBox,
  LayoutText,
  Overlay,
} from "./types";

export type YogaInstance = typeof YogaDefault;

export const RADIO_LABEL_WIDTH = 7;

// --- computeLayout: descriptor tree + yoga → positioned layout nodes ---

const BORDER_LR = 2; // "│ " and " │" = 2 chars each side
const BORDER_TB = 1; // top border row + bottom border row = 1 each
const GAP = 1;

export function computeLayout(yoga: YogaInstance, nodes: TuiNode[], cols: number): LayoutNode[] {
  const root = yoga.Node.create();
  root.setFlexDirection(FlexDirection.Column);
  root.setWidth(cols);

  const yogaChildren: { yogaNode: ReturnType<typeof yoga.Node.create>; tuiNode: TuiNode }[] = [];

  for (const node of nodes) {
    const yogaNode = yoga.Node.create();
    yogaNode.setWidth(cols);
    yogaNode.setMargin(Edge.Bottom, GAP);
    yogaNode.setHeight(
      node.type === "box" && node.border ? node.children.length + BORDER_TB * 2 : 1,
    );

    root.insertChild(yogaNode, root.getChildCount());
    yogaChildren.push({ yogaNode, tuiNode: node });
  }

  root.calculateLayout(cols, undefined, Direction.LTR);

  const layouts: LayoutNode[] = [];
  for (const { yogaNode, tuiNode } of yogaChildren) {
    const layout = yogaNode.getComputedLayout();

    if (tuiNode.type === "box") {
      const innerLeft = layout.left + BORDER_LR;
      const innerTop = layout.top + BORDER_TB;
      const innerWidth = Math.max(1, layout.width - BORDER_LR * 2);

      layouts.push({
        type: "box",
        node: tuiNode,
        left: layout.left,
        top: layout.top,
        width: layout.width,
        height: layout.height,
        innerLeft,
        innerTop,
        innerWidth,
        children: tuiNode.children.map((child: BoxChild, index: number) => ({
          node: child,
          left: innerLeft,
          top: innerTop + index,
          width: innerWidth,
          height: 1,
        })),
      } satisfies LayoutBox);
    } else {
      layouts.push({
        type: "text",
        node: tuiNode,
        left: layout.left,
        top: layout.top,
        width: layout.width,
        height: layout.height,
      } satisfies LayoutText);
    }
  }

  // Free yoga nodes
  for (const { yogaNode } of yogaChildren) yogaNode.free();
  root.free();

  return layouts;
}

// --- computeOverlays: layout nodes → overlay specs for interactive elements ---

export function computeOverlays(layouts: LayoutNode[]): Overlay[] {
  const overlays: Overlay[] = [];

  for (const layout of layouts) {
    if (layout.type !== "box") continue;

    for (const child of layout.children) {
      if (child.node.type === "slider") {
        overlays.push({
          type: "slider",
          top: child.top,
          left: child.left,
          width: child.width,
          min: child.node.min,
          max: child.node.max,
          onChange: child.node.onChange,
          onDrag: child.node.onDrag,
        });
      } else if (child.node.type === "radio") {
        let offset = Math.max(child.node.label.length, RADIO_LABEL_WIDTH);
        for (const opt of child.node.options) {
          const optWidth = 3 + opt.length; // " ● opt"
          overlays.push({
            type: "radio-option",
            top: child.top,
            left: child.left + offset,
            width: optWidth,
            option: opt,
            onChange: child.node.onChange,
          });
          offset += optWidth;
        }
      } else if (child.node.type === "text" && (child.node.onClick || child.node.cursor)) {
        overlays.push({
          type: "button",
          top: child.top,
          left: child.left,
          width: child.width,
          onClick: child.node.onClick,
          cursor: child.node.cursor ?? "pointer",
        });
      }
    }
  }

  return overlays;
}
