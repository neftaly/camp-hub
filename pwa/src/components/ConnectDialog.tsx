import { useCharCols } from "../hooks";

interface ConnectDialogProps {
  state: "disconnected" | "connecting";
  error: string | null;
  onConnect: () => void;
}

export function ConnectDialog({ state, error, onConnect }: ConnectDialogProps) {
  const [ref, cols] = useCharCols();
  const inner = Math.max(1, cols - 4);
  const botFill = Math.max(1, cols - 2);

  const titleText = "Camp Hub";
  const buttonText = state === "connecting" ? " Connecting... " : " Connect ";

  const padLR = (text: string) => {
    const pad = Math.max(0, inner - text.length);
    const l = Math.floor(pad / 2);
    return [" ".repeat(l), " ".repeat(pad - l)] as const;
  };

  const emptyLine = " ".repeat(inner);

  // Count lines to position button overlay
  let buttonLineIndex = 3; // empty, title, empty, button
  if (error) buttonLineIndex = 4; // empty, title, error, empty, button

  return (
    <div className="dialog-overlay">
      <div className="dialog" ref={ref}>
        <pre className="tui-pre">
          <span className="c-border-bright">{"┌" + "─".repeat(botFill) + "┐"}</span>
          {"\n"}
          <span className="c-border-bright">{"│ "}</span>{emptyLine}<span className="c-border-bright">{" │"}</span>
          {"\n"}
          <span className="c-border-bright">{"│ "}</span>
          {padLR(titleText)[0]}<span className="c-text">{titleText}</span>{padLR(titleText)[1]}
          <span className="c-border-bright">{" │"}</span>
          {"\n"}
          {error && (
            <>
              <span className="c-border-bright">{"│ "}</span>
              {padLR(error)[0]}<span className="c-red">{error.substring(0, inner)}</span>{padLR(error)[1]}
              <span className="c-border-bright">{" │"}</span>
              {"\n"}
            </>
          )}
          <span className="c-border-bright">{"│ "}</span>{emptyLine}<span className="c-border-bright">{" │"}</span>
          {"\n"}
          <span className="c-border-bright">{"│ "}</span>
          {padLR(buttonText)[0]}<span className="c-thumb">{buttonText}</span>{padLR(buttonText)[1]}
          <span className="c-border-bright">{" │"}</span>
          {"\n"}
          <span className="c-border-bright">{"│ "}</span>{emptyLine}<span className="c-border-bright">{" │"}</span>
          {"\n"}
          <span className="c-border-bright">{"└" + "─".repeat(botFill) + "┘"}</span>
        </pre>
        <div
          className="tui-overlay tui-overlay--thumb"
          style={{
            top: `${buttonLineIndex + 1}em`,
            left: "2ch",
            width: `${inner}ch`,
            cursor: state === "connecting" ? "wait" : "pointer",
          }}
          onClick={state !== "connecting" ? onConnect : undefined}
        />
      </div>
    </div>
  );
}
