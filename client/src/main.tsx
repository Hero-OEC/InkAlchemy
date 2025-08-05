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

// Global error handlers to prevent unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.warn('Unhandled promise rejection:', event.reason);
  
  // Prevent the default browser behavior (logging to console)
  event.preventDefault();
  
  // Handle specific known errors gracefully
  if (event.reason?.message?.includes('Failed to fetch') || 
      event.reason?.message?.includes('NetworkError') ||
      event.reason?.message?.includes('ERR_BLOCKED_BY_CLIENT')) {
    console.log('Network error caught and handled gracefully');
    return;
  }
});

window.addEventListener('error', (event) => {
  console.warn('Global error caught:', event.error);
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
