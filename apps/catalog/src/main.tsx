import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./catalog.css";
import { applyPreferences, readSchemeChoice, readThemeChoice } from "./theme";

applyPreferences(readThemeChoice(), readSchemeChoice());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
