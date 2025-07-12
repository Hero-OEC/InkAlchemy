import { Route, Router } from "wouter";
import Welcome from "./pages/welcome";
import Dashboard from "./pages/dashboard";
import Characters from "./pages/characters";
import CharacterDetails from "./pages/character-details";
import EditCharacter from "./pages/edit-character";
import CreateCharacter from "./pages/create-character";
import Locations from "./pages/locations";
import Timeline from "./pages/timeline";
import EventDetails from "./pages/event-details";
import EventForm from "./pages/event-form";
import MagicSystems from "./pages/magic-systems";
import Lore from "./pages/lore";
import Notes from "./pages/notes";
import NoteDetails from "./pages/note-details";
import CreateNote from "./pages/create-note";
import EditNote from "./pages/edit-note";
import ComponentsShowcase from "./pages/components-showcase";
import NotFound from "./pages/not-found";

function App() {
  return (
    <Router>
      <Route path="/" component={Welcome} />
      <Route path="/projects/:projectId/dashboard" component={Dashboard} />
      <Route path="/projects/:projectId/characters" component={Characters} />
      <Route path="/projects/:projectId/characters/new" component={CreateCharacter} />
      <Route path="/projects/:projectId/characters/:characterId" component={CharacterDetails} />
      <Route path="/projects/:projectId/characters/:characterId/edit" component={EditCharacter} />
      <Route path="/projects/:projectId/locations" component={Locations} />
      <Route path="/projects/:projectId/timeline" component={Timeline} />
      <Route path="/projects/:projectId/events/:eventId" component={EventDetails} />
      <Route path="/projects/:projectId/events/:eventId/edit" component={EventForm} />
      <Route path="/projects/:projectId/timeline/new-event" component={EventForm} />
      <Route path="/projects/:projectId/magic-systems" component={MagicSystems} />
      <Route path="/projects/:projectId/lore" component={Lore} />
      <Route path="/projects/:projectId/notes" component={Notes} />
      <Route path="/projects/:projectId/notes/new" component={CreateNote} />
      <Route path="/projects/:projectId/notes/:noteId/edit" component={EditNote} />
      <Route path="/projects/:projectId/notes/:noteId" component={NoteDetails} />
      <Route path="/components" component={ComponentsShowcase} />

    </Router>
  );
}

export default App;