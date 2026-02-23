import { createElement, type ReactElement, type ReactNode } from "react";
import type { Color } from "./types";

export interface BoxProps {
  border?: boolean;
  borderColor?: Color;
  title?: string;
  headerValue?: string;
  centered?: boolean;
  children?: ReactNode;
}

export interface TextProps {
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

export interface SliderProps {
  value: number | null;
  min: number;
  max: number;
  unit: string;
  onChange: (value: number) => void;
  onDrag?: (value: number | null) => void;
}

export interface RadioProps {
  label: string;
  options: string[];
  value: string | null;
  onChange: (value: string) => void;
}

export function Box({ children, ...props }: BoxProps): ReactElement {
  return createElement("tui-box", props, children);
}

export function Text(props: TextProps): ReactElement {
  return createElement("tui-text", props);
}

export function Slider(props: SliderProps): ReactElement {
  return createElement("tui-slider", props);
}

export function Radio(props: RadioProps): ReactElement {
  return createElement("tui-radio", props);
}

// Host element type declarations for the custom reconciler
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "tui-box": BoxProps & { children?: ReactNode };
      "tui-text": TextProps;
      "tui-slider": SliderProps;
      "tui-radio": RadioProps;
    }
  }
}
