import { Fragment, useCallback, useRef, type ReactNode } from "react";
import { useDrag } from "@use-gesture/react";
import { useCharCols } from "../hooks";

export interface TextLine {
  type: "text";
  label: string;
  value: string;
  valueColor?: string;
}

export interface SliderLine {
  type: "slider";
  value: number | null;
  min: number;
  max: number;
  unit: string;
  onChange: (value: number) => void;
}

export interface RadioLine {
  type: "radio";
  label: string;
  options: string[];
  value: string | null;
  onChange: (value: string) => void;
}

export type PanelLine = TextLine | SliderLine | RadioLine;

interface PanelProps {
  title: string;
  headerValue?: string;
  lines: PanelLine[];
}

export function Panel({ title, headerValue, lines }: PanelProps) {
  const [ref, cols] = useCharCols();
  const inner = Math.max(1, cols - 4);

  const titlePart = `[ ${title} ]`;
  const valuePart = headerValue != null ? ` ${headerValue} ` : "";
  const topFill = Math.max(1, cols - 4 - titlePart.length - valuePart.length);
  const botFill = Math.max(1, cols - 2);

  return (
    <>
    <div className="panel" ref={ref}>
      <pre className="tui-pre">
        <span className="c-border">{"┌─"}</span>
        <span className="c-accent">{titlePart}</span>
        <span className="c-border">{"─".repeat(topFill)}</span>
        {headerValue != null && <span className="c-text">{valuePart}</span>}
        <span className="c-border">{"─┐"}</span>
        {"\n"}
        {lines.map((line, i) => (
          <Fragment key={i}>
            <span className="c-border">{"│ "}</span>
            {renderLine(line, inner)}
            <span className="c-border">{" │"}</span>
            {"\n"}
          </Fragment>
        ))}
        <span className="c-border">{"└" + "─".repeat(botFill) + "┘"}</span>
      </pre>
      {lines.map((line, i) => (
        <Fragment key={`o${i}`}>
          {line.type === "slider" && (
            <SliderOverlay lineIndex={i} line={line} inner={inner} />
          )}
          {line.type === "radio" && (
            <RadioOverlay lineIndex={i} line={line} />
          )}
        </Fragment>
      ))}
    </div>
    <pre className="tui-pre">{"\n"}</pre>
    </>
  );
}

function renderLine(line: PanelLine, inner: number): ReactNode {
  switch (line.type) {
    case "text": return renderTextLine(line, inner);
    case "slider": return renderSliderLine(line, inner);
    case "radio": return renderRadioLine(line, inner);
  }
}

function renderTextLine(line: TextLine, inner: number): ReactNode {
  const pad = Math.max(1, inner - line.label.length - line.value.length);
  const cls = line.valueColor ? `c-${line.valueColor}` : "c-text";
  return (
    <>
      <span className="c-label">{line.label}</span>
      {" ".repeat(pad)}
      <span className={cls}>{line.value}</span>
    </>
  );
}

function renderSliderLine(line: SliderLine, inner: number): ReactNode {
  const digitWidth = Math.max(`${Math.abs(line.min)}`.length, `${Math.abs(line.max)}`.length);
  const hasNeg = line.min < 0;
  let numStr: string;
  if (line.value === null) {
    numStr = "-".repeat(digitWidth + (hasNeg ? 1 : 0));
  } else {
    const digits = `${Math.abs(line.value)}`.padStart(digitWidth);
    numStr = line.value < 0 ? `-${digits}` : `+${digits}`;
  }
  const thumbText = `${numStr}${line.unit}`;
  const trackLen = Math.max(0, inner - thumbText.length);

  const ratio = line.value !== null
    ? Math.max(0, Math.min(1, (line.value - line.min) / (line.max - line.min)))
    : 0.5;
  const left = Math.round(ratio * trackLen);
  const right = trackLen - left;
  return (
    <>
      <span className="c-dim">{"━".repeat(left)}</span>
      <span className="c-thumb">{thumbText}</span>
      <span className="c-dim">{"━".repeat(right)}</span>
    </>
  );
}

function renderRadioLine(line: RadioLine, inner: number): ReactNode {
  const paddedLabel = line.label.padEnd(7);
  const parts: ReactNode[] = [];
  let used = paddedLabel.length;
  parts.push(<span key="l" className="c-label">{paddedLabel}</span>);

  for (const opt of line.options) {
    const active = opt === line.value;
    const dot = active ? "●" : "○";
    const text = ` ${dot} ${opt}`;
    used += text.length;
    parts.push(
      <span key={opt} className={active ? "c-green" : "c-label"}>{text}</span>
    );
  }

  const pad = Math.max(0, inner - used);
  if (pad > 0) parts.push(" ".repeat(pad));
  return <>{parts}</>;
}

function SliderOverlay({ lineIndex, line, inner }: { lineIndex: number; line: SliderLine; inner: number }) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const getValueFromX = useCallback(
    (x: number) => {
      const el = overlayRef.current;
      if (!el) return line.min;
      const r = el.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (x - r.left) / r.width));
      return Math.round(line.min + ratio * (line.max - line.min));
    },
    [line.min, line.max],
  );

  const bind = useDrag(
    ({ xy: [x] }) => {
      line.onChange(getValueFromX(x));
    },
    { pointer: { touch: true } },
  );

  return (
    <div
      ref={overlayRef}
      {...bind()}
      className="tui-overlay tui-overlay--thumb"
      style={{
        top: `${lineIndex + 1}em`,
        left: "2ch",
        width: `${inner}ch`,
        cursor: "grab",
      }}
    />
  );
}

function RadioOverlay({ lineIndex, line }: { lineIndex: number; line: RadioLine }) {
  let offset = 7; // padded label width
  const options = line.options.map((opt) => {
    const left = offset;
    const width = 3 + opt.length; // " ● opt"
    offset += width;
    return { opt, left, width };
  });

  return (
    <>
      {options.map(({ opt, left, width }) => (
        <div
          key={opt}
          className="tui-overlay tui-overlay--radio"
          style={{
            top: `${lineIndex + 1}em`,
            left: `${2 + left}ch`,
            width: `${width}ch`,
            cursor: "pointer",
          }}
          onClick={() => line.onChange(opt)}
        />
      ))}
    </>
  );
}
