import type { Grid } from "./grid";
import { RADIO_LABEL_WIDTH } from "./layout";
import type {
  LayoutNode,
  LayoutBox,
  BoxChildLayout,
  TextNode,
  SliderNode,
  RadioNode,
  Color,
} from "./types";

export function paint(grid: Grid, layouts: LayoutNode[]): void {
  for (const layout of layouts) {
    if (layout.type === "box") {
      paintBox(grid, layout);
    } else {
      paintTextLine(grid, layout.node, layout.left, layout.top, layout.width);
    }
  }
}

function paintBox(grid: Grid, box: LayoutBox): void {
  const { node, left, top, width, innerWidth } = box;
  const borderColor: Color = node.borderColor ?? "border";

  // Top border
  if (node.title) {
    const titlePart = `[ ${node.title} ]`;
    const valuePart = node.headerValue != null ? ` ${node.headerValue} ` : "";
    const fillLen = Math.max(1, width - 4 - titlePart.length - valuePart.length);

    grid.writeString(left, top, "┌─", borderColor);
    grid.writeString(left + 2, top, titlePart, "accent");
    grid.writeString(left + 2 + titlePart.length, top, "─".repeat(fillLen), borderColor);
    if (valuePart) {
      grid.writeString(left + 2 + titlePart.length + fillLen, top, valuePart, "text");
    }
    grid.writeString(left + width - 2, top, "─┐", borderColor);
  } else {
    // Plain top border
    grid.writeString(left, top, "┌" + "─".repeat(width - 2) + "┐", borderColor);
  }

  // Content rows
  for (const child of box.children) {
    const row = child.top;
    grid.writeString(left, row, "│ ", borderColor);
    paintChild(grid, child, innerWidth);
    grid.writeString(left + width - 2, row, " │", borderColor);
  }

  // Bottom border
  const bottomRow = top + box.height - 1;
  grid.writeString(left, bottomRow, "└" + "─".repeat(width - 2) + "┘", borderColor);
}

function paintChild(grid: Grid, child: BoxChildLayout, innerWidth: number): void {
  const { node, left, top } = child;

  switch (node.type) {
    case "text":
      paintTextLine(grid, node, left, top, innerWidth);
      break;
    case "slider":
      paintSliderLine(grid, node, left, top, innerWidth);
      break;
    case "radio":
      paintRadioLine(grid, node, left, top, innerWidth);
      break;
  }
}

function paintTextLine(grid: Grid, node: TextNode, left: number, row: number, innerWidth: number): void {
  if (node.centered) {
    const text = node.value ?? "";
    const pad = Math.max(0, innerWidth - text.length);
    const padLeft = Math.floor(pad / 2);
    grid.writeString(left + padLeft, row, text, node.valueColor ?? "text");
    return;
  }

  if (node.left != null || node.right != null) {
    const leftText = node.left ?? "";
    const prefix = node.rightPrefix ?? "";
    const rightText = node.right ?? "";
    const totalRight = prefix.length + rightText.length;
    const pad = Math.max(1, innerWidth - leftText.length - totalRight);
    grid.writeString(left, row, leftText, node.leftColor ?? "text");
    let col = left + leftText.length + pad;
    if (prefix) {
      grid.writeString(col, row, prefix, node.rightPrefixColor ?? "text");
      col += prefix.length;
    }
    grid.writeString(col, row, rightText, node.rightColor ?? "text");
    return;
  }

  const label = node.label ?? "";
  const value = node.value ?? "";
  const pad = Math.max(1, innerWidth - label.length - value.length);
  const valueColor: Color = node.valueColor ?? "text";

  grid.writeString(left, row, label, "label");
  grid.writeString(left + label.length + pad, row, value, valueColor);
}

function paintSliderLine(grid: Grid, node: SliderNode, left: number, row: number, innerWidth: number): void {
  const digitWidth = Math.max(
    `${Math.abs(node.min)}`.length,
    `${Math.abs(node.max)}`.length,
  );
  const hasNeg = node.min < 0;

  let numStr: string;
  if (node.value === null) {
    numStr = "-".repeat(digitWidth + (hasNeg ? 1 : 0));
  } else {
    const digits = `${Math.abs(node.value)}`.padStart(digitWidth);
    numStr = node.value < 0 ? `-${digits}` : `+${digits}`;
  }
  const thumbText = `${numStr}${node.unit}`;
  const trackLen = Math.max(0, innerWidth - thumbText.length);

  const ratio =
    node.value !== null
      ? Math.max(0, Math.min(1, (node.value - node.min) / (node.max - node.min)))
      : 0.5;
  const thumbLeft = Math.round(ratio * trackLen);
  const rightTrack = trackLen - thumbLeft;

  grid.writeString(left, row, "━".repeat(thumbLeft), "dim");
  grid.writeString(left + thumbLeft, row, thumbText, "thumb");
  grid.writeString(left + thumbLeft + thumbText.length, row, "━".repeat(rightTrack), "dim");
}

function paintRadioLine(grid: Grid, node: RadioNode, left: number, row: number, innerWidth: number): void {
  const paddedLabel = node.label.padEnd(RADIO_LABEL_WIDTH);
  let col = left;
  grid.writeString(col, row, paddedLabel, "label");
  col += paddedLabel.length;

  for (const opt of node.options) {
    const active = opt === node.value;
    const dot = active ? "●" : "○";
    const text = ` ${dot} ${opt}`;
    grid.writeString(col, row, text, active ? "green" : "label");
    col += text.length;
  }

  const used = col - left;
  const remaining = Math.max(0, innerWidth - used);
  if (remaining > 0) {
    grid.writeString(col, row, " ".repeat(remaining));
  }
}
