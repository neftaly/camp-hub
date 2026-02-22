import { useCharCols } from "../hooks";

interface StatusBarProps {
  state: "disconnected" | "connecting" | "connected";
}

export function StatusBar({ state }: StatusBarProps) {
  const [ref, cols] = useCharCols();
  const dotClass =
    state === "connected"
      ? "status-dot--connected"
      : "status-dot--disconnected";

  const left = "Camp Hub";
  const right = " BLE"; // "● BLE" = 5 chars
  const pad = Math.max(1, cols - left.length - 1 - right.length);

  return (
    <div ref={ref}>
      <pre className="tui-pre">
        <span className="c-accent">{left}</span>
        {" ".repeat(pad)}
        <span className={dotClass}>{"●"}</span>
        <span className="c-label">{" BLE"}</span>
        {"\n\n"}
      </pre>
    </div>
  );
}
