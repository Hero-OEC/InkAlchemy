import { Route, Router } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navbar } from "./components/navbar";
import Dashboard from "./pages/dashboard";
import Characters from "./pages/characters";
import Locations from "./pages/locations";
import Timeline from "./pages/timeline";
import MagicSystems from "./pages/magic-systems";
import Lore from "./pages/lore";
import NotFound from "./pages/not-found";

// Demo imports for component showcase
import { CharacterCard } from "./components/character-card";
import { ButtonShowcase } from "./components/button-variations";
import { DeleteConfirmationDemo } from "./components/delete-confirmation";
import { NavbarDemo } from "./components/navbar";
import { FontShowcase } from "./components/font-showcase";
import { ContentCardDemo } from "./components/content-card";

const queryClient = new QueryClient();

function App() {
  // Check if we're in demo mode (for component showcase)
  const isDemoMode = window.location.pathname === '/demo' || window.location.search.includes('demo=true');

  if (isDemoMode) {
    return <ComponentDemo />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-brand-50">
          <Navbar 
            hasActiveProject={true}
            projectName="The Shattered Realm"
            currentPage={window.location.pathname}
          />
          
          <main>
            <Route path="/" component={Dashboard} />
            <Route path="/characters" component={Characters} />
            <Route path="/locations" component={Locations} />
            <Route path="/timeline" component={Timeline} />
            <Route path="/magic-systems" component={MagicSystems} />
            <Route path="/lore" component={Lore} />
            <Route component={NotFound} />
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

function ComponentDemo() {
  return (
    <div className="min-h-screen bg-brand-50">
      {/* Navigation Demo */}
      <section className="mb-12">
        <NavbarDemo />
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-brand-950 mb-4">
            InkAlchemy Component Library
          </h1>
          <p className="text-lg text-brand-700 max-w-2xl mx-auto">
            A comprehensive collection of reusable components for your creative writing companion, 
            built with Cairo typography and a consistent brand color palette.
          </p>
        </div>

        {/* Character Cards Demo */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-brand-900 mb-6">Character Cards</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            <CharacterCard
              id={1}
              name="Aeliana"
              prefix="Lady"
              suffix="the Wise"
              type="protagonist"
              description="A brilliant mage and scholar who discovers an ancient prophecy that threatens to unravel the very fabric of reality. Her quest for knowledge leads her down dangerous paths."
              createdAt={new Date('2024-01-15')}
              lastEditedAt={new Date('2024-01-20')}
            />
            
            <CharacterCard
              id={2}
              name="Korrath"
              prefix="Lord"
              type="villain"
              description="The fallen king who seeks to reclaim his throne through dark magic and necromancy. His hatred burns as hot as the fires that consumed his kingdom."
              createdAt={new Date('2024-01-10')}
              lastEditedAt={new Date('2024-01-18')}
            />
            
            <CharacterCard
              id={3}
              name="Finn"
              type="ally"
              description="A loyal friend and skilled warrior who stands by the protagonist's side through thick and thin. His unwavering courage inspires others to fight."
              createdAt={new Date('2024-01-12')}
              lastEditedAt={new Date('2024-01-22')}
            />
            
            <CharacterCard
              id={4}
              name="Seraphina"
              suffix="of the Dawn"
              type="love-interest"
              description="A mysterious healer with the power to mend both wounds and broken hearts. Her gentle nature hides secrets that could change everything."
              createdAt={new Date('2024-01-08')}
              lastEditedAt={new Date('2024-01-25')}
            />
          </div>
        </section>

        {/* Content Cards Demo */}
        <section className="mb-12">
          <ContentCardDemo />
        </section>

        {/* Button Demo */}
        <section className="mb-12">
          <ButtonShowcase />
        </section>

        {/* Delete Confirmation Demo */}
        <section className="mb-12">
          <DeleteConfirmationDemo />
        </section>

        {/* Font Demo */}
        <section className="mb-12">
          <FontShowcase />
        </section>
      </div>
    </div>
  );
}

export default App;