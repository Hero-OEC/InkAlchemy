import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Navigation } from "@/components/navigation";
import Dashboard from "@/pages/dashboard";
import Characters from "@/pages/characters";
import Locations from "@/pages/locations";
import Timeline from "@/pages/timeline";
import MagicSystems from "@/pages/magic-systems";
import Lore from "@/pages/lore";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <div className="pt-16">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/characters" component={Characters} />
          <Route path="/locations" component={Locations} />
          <Route path="/timeline" component={Timeline} />
          <Route path="/magic-systems" component={MagicSystems} />
          <Route path="/lore" component={Lore} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="storyforge-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
