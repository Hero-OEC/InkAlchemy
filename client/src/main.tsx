import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { queryClient } from "./lib/queryClient";
import "./index.css";

// Disable Eruda if it exists to prevent development tool conflicts
if (typeof window !== 'undefined' && (window as any).eruda) {
  try {
    (window as any).eruda.destroy();
  } catch (e) {
    console.log('Eruda cleanup skipped');
  }
}

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
