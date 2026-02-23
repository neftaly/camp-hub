import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { ConnectDialog } from "./components/ConnectDialog";
import { useStore } from "./store";
import "./global.css";

function Root() {
  const connected = useStore((s) => s.connected);
  const connect = useStore((s) => s.connect);

  if (!connected) {
    return <ConnectDialog onConnect={connect} />;
  }

  return <App />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
