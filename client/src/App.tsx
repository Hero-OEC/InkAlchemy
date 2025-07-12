import { Route, Router } from "wouter";
import Dashboard from "./pages/dashboard";
import Characters from "./pages/characters";
import Locations from "./pages/locations";
import Timeline from "./pages/timeline";
import MagicSystems from "./pages/magic-systems";
import Lore from "./pages/lore";
import ComponentsShowcase from "./pages/components-showcase";
import NotFound from "./pages/not-found";

function App() {
  return (
    <Router>
      <Route path="/" component={Dashboard} />
      <Route path="/characters" component={Characters} />
      <Route path="/locations" component={Locations} />
      <Route path="/timeline" component={Timeline} />
      <Route path="/magic-systems" component={MagicSystems} />
      <Route path="/lore" component={Lore} />
      <Route path="/components" component={ComponentsShowcase} />
      <Route component={NotFound} />
    </Router>
  );
}

export default App;