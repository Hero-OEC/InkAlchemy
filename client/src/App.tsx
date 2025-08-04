import { Route, Router } from "wouter";
import { AuthProvider, useAuth } from "./contexts/auth-context";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";
import ForgotPassword from "./pages/forgot-password";
import ResetPassword from "./pages/reset-password";
import Welcome from "./pages/welcome";
import Dashboard from "./pages/dashboard";
import Characters from "./pages/characters";
import CharacterDetails from "./pages/character-details";
import EditCharacter from "./pages/edit-character";
import CreateCharacter from "./pages/create-character";
import Locations from "./pages/locations";
import LocationDetails from "./pages/location-details";
import CreateLocation from "./pages/create-location";
import EditLocation from "./pages/edit-location";
import Timeline from "./pages/timeline";
import EventDetails from "./pages/event-details";
import EventForm from "./pages/event-form";
import MagicSystems from "./pages/magic-systems";
import MagicSystemDetails from "./pages/magic-system-details";
import CreateMagicSystem from "./pages/create-magic-system";
import EditMagicSystem from "./pages/edit-magic-system";
import SpellDetails from "./pages/spell-details";
import SpellEdit from "./pages/spell-edit";
import SpellCreate from "./pages/spell-create";
import Lore from "./pages/lore";
import LoreDetails from "./pages/lore-details";
import CreateLore from "./pages/create-lore";
import EditLore from "./pages/edit-lore";
import Notes from "./pages/notes";
import NoteDetails from "./pages/note-details";
import CreateNote from "./pages/create-note";
import EditNote from "./pages/edit-note";
import ComponentsShowcase from "./pages/components-showcase";
import RaceDetails from "./pages/race-details";
import CreateRace from "./pages/create-race";
import EditRace from "./pages/edit-race";
import EmailPreview from "./pages/email-preview";
import UserProfile from "./pages/user-profile";
import EditProfile from "./pages/edit-profile";
import NotFound from "./pages/not-found";

// Protected Route wrapper
function ProtectedRoute({ component: Component }: { component: React.ComponentType<any> }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <Component />;
}

function AppRoutes() {
  return (
    <Router>
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/" component={() => <ProtectedRoute component={Welcome} />} />
      <Route path="/projects/:projectId/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/projects/:projectId/characters" component={() => <ProtectedRoute component={Characters} />} />
      <Route path="/projects/:projectId/characters/new" component={() => <ProtectedRoute component={CreateCharacter} />} />
      <Route path="/projects/:projectId/characters/:characterId/edit" component={() => <ProtectedRoute component={EditCharacter} />} />
      <Route path="/projects/:projectId/characters/:characterId" component={() => <ProtectedRoute component={CharacterDetails} />} />
      <Route path="/projects/:projectId/locations" component={() => <ProtectedRoute component={Locations} />} />
      <Route path="/projects/:projectId/locations/new" component={() => <ProtectedRoute component={CreateLocation} />} />
      <Route path="/projects/:projectId/locations/:locationId/edit" component={() => <ProtectedRoute component={EditLocation} />} />
      <Route path="/projects/:projectId/locations/:locationId" component={() => <ProtectedRoute component={LocationDetails} />} />
      <Route path="/projects/:projectId/timeline" component={() => <ProtectedRoute component={Timeline} />} />
      <Route path="/projects/:projectId/events/:eventId" component={() => <ProtectedRoute component={EventDetails} />} />
      <Route path="/projects/:projectId/events/:eventId/edit" component={() => <ProtectedRoute component={EventForm} />} />
      <Route path="/projects/:projectId/timeline/new-event" component={() => <ProtectedRoute component={EventForm} />} />
      <Route path="/projects/:projectId/magic-systems" component={() => <ProtectedRoute component={MagicSystems} />} />
      <Route path="/projects/:projectId/magic-systems/new" component={() => <ProtectedRoute component={CreateMagicSystem} />} />
      <Route path="/projects/:projectId/magic-systems/:systemId" component={() => <ProtectedRoute component={MagicSystemDetails} />} />
      <Route path="/projects/:projectId/magic-systems/:systemId/edit" component={() => <ProtectedRoute component={EditMagicSystem} />} />
      <Route path="/projects/:projectId/spells/:spellId" component={() => <ProtectedRoute component={SpellDetails} />} />
      <Route path="/projects/:projectId/spells/:spellId/edit" component={() => <ProtectedRoute component={SpellEdit} />} />
      <Route path="/projects/:projectId/magic-systems/:systemId/spells/new" component={() => <ProtectedRoute component={SpellCreate} />} />
      <Route path="/projects/:projectId/abilities/:spellId" component={() => <ProtectedRoute component={SpellDetails} />} />
      <Route path="/projects/:projectId/abilities/:spellId/edit" component={() => <ProtectedRoute component={SpellEdit} />} />
      <Route path="/projects/:projectId/magic-systems/:systemId/abilities/new" component={() => <ProtectedRoute component={SpellCreate} />} />
      <Route path="/projects/:projectId/lore/new" component={() => <ProtectedRoute component={CreateLore} />} />
      <Route path="/projects/:projectId/lore/:loreId/edit" component={() => <ProtectedRoute component={EditLore} />} />
      <Route path="/projects/:projectId/lore/:loreId" component={() => <ProtectedRoute component={LoreDetails} />} />
      <Route path="/projects/:projectId/lore" component={() => <ProtectedRoute component={Lore} />} />
      <Route path="/projects/:projectId/notes" component={() => <ProtectedRoute component={Notes} />} />
      <Route path="/projects/:projectId/notes/new" component={() => <ProtectedRoute component={CreateNote} />} />
      <Route path="/projects/:projectId/notes/:noteId/edit" component={() => <ProtectedRoute component={EditNote} />} />
      <Route path="/projects/:projectId/notes/:noteId" component={() => <ProtectedRoute component={NoteDetails} />} />
      <Route path="/projects/:projectId/races" component={() => <ProtectedRoute component={Characters} />} />
      <Route path="/projects/:projectId/races/new" component={() => <ProtectedRoute component={CreateRace} />} />
      <Route path="/projects/:projectId/races/:raceId/edit" component={() => <ProtectedRoute component={EditRace} />} />
      <Route path="/projects/:projectId/races/:raceId" component={() => <ProtectedRoute component={RaceDetails} />} />
      <Route path="/components" component={() => <ProtectedRoute component={ComponentsShowcase} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={UserProfile} />} />
      <Route path="/profile/edit" component={() => <ProtectedRoute component={EditProfile} />} />
      <Route path="/email-preview" component={() => <ProtectedRoute component={EmailPreview} />} />
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;