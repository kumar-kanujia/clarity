import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./main.css";
import { ThemeProvider } from "./components/providers/theme-provider";
import { Toaster } from "./components/ui/sonner";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="clarity-theme">
      <Toaster position="bottom-right" />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
