import { Route, Router } from "wouter";
import Welcome from "./pages/welcome";
import Dashboard from "./pages/dashboard";
import Characters from "./pages/characters";
import Locations from "./pages/locations";
import Timeline from "./pages/timeline";
import MagicSystems from "./pages/magic-systems";
import Lore from "./pages/lore";
import Notes from "./pages/notes";
import ComponentsShowcase from "./pages/components-showcase";
import NotFound from "./pages/not-found";

function App() {
  return (
    <Router>
      <Route path="/" component={Welcome} />
      <Route path="/projects/:projectId/dashboard" component={Dashboard} />
      <Route path="/projects/:projectId/characters" component={Characters} />
      <Route path="/projects/:projectId/locations" component={Locations} />
      <Route path="/projects/:projectId/timeline" component={Timeline} />
      <Route path="/projects/:projectId/magic-systems" component={MagicSystems} />
      <Route path="/projects/:projectId/lore" component={Lore} />
      <Route path="/projects/:projectId/notes" component={Notes} />
      <Route path="/components" component={ComponentsShowcase} />

    </Router>
  );
}

export default App;