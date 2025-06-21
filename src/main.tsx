import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";

import App from "./App.tsx";
import "./index.css";
import { UserProvider } from "./context/UserContext.tsx";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <UserProvider>
      <StrictMode>
        <App />
        <Toaster richColors position="top-center" />
        <Analytics />
      </StrictMode>
    </UserProvider>
  </ThemeProvider>,
);
