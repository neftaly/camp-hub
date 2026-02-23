export type Color =
  | "border"
  | "border-bright"
  | "accent"
  | "text"
  | "label"
  | "dim"
  | "green"
  | "red"
  | "thumb";

export interface Cell {
  char: string;
  color: Color;
}

// Instance nodes managed by the reconciler

export interface TextNode {
  type: "text";
  label?: string;
  value?: string;
  valueColor?: Color;
  left?: string;
  leftColor?: Color;
  right?: string;
  rightColor?: Color;
  rightPrefix?: string;
  rightPrefixColor?: Color;
  centered?: boolean;
  onClick?: () => void;
  cursor?: string;
}

export interface SliderNode {
  type: "slider";
  value: number | null;
  min: number;
  max: number;
  unit: string;
  onChange: (value: number) => void;
}

export interface RadioNode {
  type: "radio";
  label: string;
  options: string[];
  value: string | null;
  onChange: (value: string) => void;
}

export type BoxChild = TextNode | SliderNode | RadioNode;

export interface BoxNode {
  type: "box";
  border: boolean;
  borderColor?: Color;
  title?: string;
  headerValue?: string;
  centered?: boolean;
  children: BoxChild[];
}

export type TuiNode = BoxNode | TextNode;

// Layout nodes with computed positions

export interface BoxChildLayout {
  node: BoxChild;
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface LayoutBox {
  type: "box";
  node: BoxNode;
  left: number;
  top: number;
  width: number;
  height: number;
  innerLeft: number;
  innerTop: number;
  innerWidth: number;
  children: BoxChildLayout[];
}

export interface LayoutText {
  type: "text";
  node: TextNode;
  left: number;
  top: number;
  width: number;
  height: number;
}

export type LayoutNode = LayoutBox | LayoutText;

// Overlay specs for interactive elements

export interface SliderOverlay {
  type: "slider";
  top: number;
  left: number;
  width: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

export interface RadioOverlay {
  type: "radio-option";
  top: number;
  left: number;
  width: number;
  option: string;
  onChange: (value: string) => void;
}

export interface ButtonOverlay {
  type: "button";
  top: number;
  left: number;
  width: number;
  onClick?: () => void;
  cursor: string;
}

export type Overlay = SliderOverlay | RadioOverlay | ButtonOverlay;

// Color runs for React rendering

export interface ColorRun {
  text: string;
  color: Color;
}
