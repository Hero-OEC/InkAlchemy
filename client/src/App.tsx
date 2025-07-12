import { CharacterCard } from "./components/character-card";
import { ButtonShowcase } from "./components/button-variations";
import { DeleteConfirmationDemo } from "./components/delete-confirmation";
import { NavbarDemo } from "./components/navbar";
import { FontShowcase } from "./components/font-showcase";
import { ContentCardDemo } from "./components/content-card";
import { FormInputsDemo } from "./components/form-inputs";
import SerpentineTimeline from "./components/serpentine-timeline";
import { useQuery } from "@tanstack/react-query";
import type { Event, Character, Location, Relationship } from "@shared/schema";

function App() {
  // Fetch data for the timeline demo
  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ["/api/projects", "1", "events"]
  });

  const { data: characters = [] } = useQuery<Character[]>({
    queryKey: ["/api/projects", "1", "characters"]
  });

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ["/api/projects", "1", "locations"]
  });

  const { data: relationships = [] } = useQuery<Relationship[]>({
    queryKey: ["/api/projects", "1", "relationships"]
  });

  // Process events with relationships to add character and location data
  const processedEvents = events.map(event => {
    const eventRelationships = relationships.filter(rel => 
      rel.fromElementType === 'event' && rel.fromElementId === event.id
    );
    
    const eventCharacters = eventRelationships
      .filter(rel => rel.toElementType === 'character')
      .map(rel => characters.find(char => char.id === rel.toElementId))
      .filter(Boolean) as Character[];
    
    const eventLocation = event.locationId 
      ? locations.find(loc => loc.id === event.locationId)
      : undefined;

    return {
      ...event,
      characters: eventCharacters,
      location: eventLocation
    };
  });

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-4xl font-bold text-brand-950 mb-8">InkAlchemy Components</h1>
      
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
          
          <CharacterCard
            id={5}
            name="Marcus"
            prefix="Sir"
            type="supporting"
            description="A grizzled veteran knight who serves as mentor and guide. His experience in battle is matched only by his wisdom in matters of the heart."
            createdAt={new Date('2024-01-05')}
            lastEditedAt={new Date('2024-01-19')}
          />
          
          <CharacterCard
            id={6}
            name="Zara"
            type="neutral"
            description="A cunning merchant who plays all sides for profit. Her allegiances shift like the winds, but her information is always valuable and accurate."
            createdAt={new Date('2024-01-14')}
            lastEditedAt={new Date('2024-01-21')}
          />
        </div>
      </section>

      {/* Button Variations Demo */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-brand-900 mb-6">Button Components</h2>
        <div className="bg-brand-100 border border-brand-200 rounded-xl p-6">
          <ButtonShowcase />
        </div>
      </section>

      {/* Delete Confirmation Demo */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-brand-900 mb-6">Delete Confirmation Modal</h2>
        <div className="bg-brand-100 border border-brand-200 rounded-xl p-6">
          <DeleteConfirmationDemo />
        </div>
      </section>

      {/* Navbar Demo */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-brand-900 mb-6">Navigation Bar</h2>
        <div className="bg-white border border-brand-200 rounded-xl p-6">
          <NavbarDemo />
        </div>
      </section>

      {/* Font Showcase */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-brand-900 mb-6">Cairo Typography</h2>
        <div className="bg-white border border-brand-200 rounded-xl p-6">
          <FontShowcase />
        </div>
      </section>

      {/* Content Cards */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-brand-900 mb-6">Universal Content Cards</h2>
        <div className="bg-white border border-brand-200 rounded-xl p-6">
          <ContentCardDemo />
        </div>
      </section>

      {/* Form Inputs */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-brand-900 mb-6">Form Inputs & Dropdowns</h2>
        <div className="bg-white border border-brand-200 rounded-xl p-6">
          <FormInputsDemo />
        </div>
      </section>

      {/* Color Palette Reference */}
      <section>
        <h2 className="text-2xl font-bold text-brand-900 mb-6">Color System Reference</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Color 50 */}
        <div className="bg-brand-50 p-6 rounded-lg border border-brand-200">
          <div className="text-brand-950 font-semibold">Color 50</div>
          <div className="text-brand-700 text-sm">#FAF9EC</div>
          <div className="text-brand-600 text-xs mt-1">Light backgrounds, main app surface</div>
        </div>
        
        {/* Color 100 */}
        <div className="bg-brand-100 p-6 rounded-lg border border-brand-200">
          <div className="text-brand-950 font-semibold">Color 100</div>
          <div className="text-brand-700 text-sm">#F4F0CD</div>
          <div className="text-brand-600 text-xs mt-1">Secondary backgrounds, light containers</div>
        </div>
        
        {/* Color 200 */}
        <div className="bg-brand-200 p-6 rounded-lg border border-brand-300">
          <div className="text-brand-950 font-semibold">Color 200</div>
          <div className="text-brand-700 text-sm">#EBDF9D</div>
          <div className="text-brand-600 text-xs mt-1">Hover backgrounds, soft accents</div>
        </div>
        
        {/* Color 300 */}
        <div className="bg-brand-300 p-6 rounded-lg border border-brand-400">
          <div className="text-brand-950 font-semibold">Color 300</div>
          <div className="text-brand-800 text-sm">#DFC865</div>
          <div className="text-brand-700 text-xs mt-1">Section headers, muted buttons</div>
        </div>
        
        {/* Color 400 - Primary Brand */}
        <div className="bg-brand-400 p-6 rounded-lg border border-brand-500">
          <div className="text-white font-semibold">Color 400 - Primary</div>
          <div className="text-brand-50 text-sm">#D4B13B</div>
          <div className="text-brand-100 text-xs mt-1">Primary brand color</div>
        </div>
        
        {/* Color 500 */}
        <div className="bg-brand-500 p-6 rounded-lg border border-brand-600">
          <div className="text-white font-semibold">Color 500</div>
          <div className="text-brand-50 text-sm">#BF972C</div>
          <div className="text-brand-100 text-xs mt-1">Button highlights, emphasis</div>
        </div>
        
        {/* Color 600 */}
        <div className="bg-brand-600 p-6 rounded-lg border border-brand-700">
          <div className="text-white font-semibold">Color 600</div>
          <div className="text-brand-50 text-sm">#A97A25</div>
          <div className="text-brand-100 text-xs mt-1">Accent color, contrast</div>
        </div>
        
        {/* Color 700 */}
        <div className="bg-brand-700 p-6 rounded-lg border border-brand-800">
          <div className="text-white font-semibold">Color 700</div>
          <div className="text-brand-50 text-sm">#885A20</div>
          <div className="text-brand-100 text-xs mt-1">Secondary roles, darker accents</div>
        </div>
        
        {/* Color 800 */}
        <div className="bg-brand-800 p-6 rounded-lg border border-brand-900">
          <div className="text-white font-semibold">Color 800</div>
          <div className="text-brand-50 text-sm">#714A22</div>
          <div className="text-brand-100 text-xs mt-1">Cards, containers with depth</div>
        </div>
        
        {/* Color 900 */}
        <div className="bg-brand-900 p-6 rounded-lg border border-brand-950">
          <div className="text-white font-semibold">Color 900</div>
          <div className="text-brand-50 text-sm">#613E22</div>
          <div className="text-brand-100 text-xs mt-1">Primary text in light mode</div>
        </div>
        
        {/* Color 950 */}
        <div className="bg-brand-950 p-6 rounded-lg">
          <div className="text-white font-semibold">Color 950</div>
          <div className="text-brand-50 text-sm">#382010</div>
          <div className="text-brand-100 text-xs mt-1">Strong text, maximum contrast</div>
        </div>
      </div>
      
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-brand-900 mb-4">Usage Examples</h2>
        <div className="space-y-4">
          <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-brand-500 transition-colors">
            Primary Button
          </button>
          <div className="bg-card border border-border p-6 rounded-lg">
            <h3 className="text-card-foreground font-semibold mb-2">Card Component</h3>
            <p className="text-muted-foreground">This shows how the color system works with semantic UI tokens.</p>
          </div>
        </div>
      </div>
      </section>

      {/* Serpentine Timeline Demo */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-color-900 mb-6">Serpentine Timeline</h2>
        <p className="text-color-700 mb-4 text-sm">
          Responsive timeline that automatically adapts: Mobile &lt;768px (2 per row), Tablet &lt;1200px (3 per row), Desktop (4 per row)
        </p>
        <SerpentineTimeline
          events={[
            {
              id: 1,
              projectId: 1,
              title: "The Great Discovery",
              description: "The main character discovers their hidden power that will change everything",
              year: 1,
              month: 2,
              day: 15,
              type: "discovery",
              stage: "editing",
              importance: "high",
              locationId: null,
              order: 1,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              id: 2,
              projectId: 1,
              title: "First Battle",
              description: "The character's first real test in combat against dark forces",
              year: 1,
              month: 5,
              day: 3,
              type: "battle",
              stage: "writing",
              importance: "medium",
              locationId: null,
              order: 2,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              id: 3,
              projectId: 1,
              title: "Meeting the Mentor",
              description: "The protagonist meets their guide and teacher who reveals ancient secrets",
              year: 1,
              month: 1,
              day: 20,
              type: "meeting",
              stage: "complete",
              importance: "high",
              locationId: null,
              order: 0,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              id: 4,
              projectId: 1,
              title: "Dark Revelation",
              description: "A shocking truth about the world is revealed that changes everything",
              year: 2,
              month: 3,
              day: 10,
              type: "discovery",
              stage: "planning",
              importance: "critical",
              locationId: null,
              order: 3,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              id: 5,
              projectId: 1,
              title: "The Final Confrontation",
              description: "The climactic battle between good and evil that determines the fate of all",
              year: 3,
              month: 12,
              day: 25,
              type: "battle",
              stage: "first-draft",
              importance: "critical",
              locationId: null,
              order: 4,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              id: 6,
              projectId: 1,
              title: "Love's First Kiss",
              description: "A tender moment between the protagonist and their love interest",
              year: 2,
              month: 3,
              day: 10,
              type: "personal",
              stage: "writing",
              importance: "medium",
              locationId: null,
              order: 5,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ]}
          characters={[
            {
              id: 1,
              projectId: 1,
              name: "Aeliana",
              role: "protagonist",
              description: "A brilliant mage",
              appearance: null,
              personality: null,
              background: null,
              goals: null,
              status: null,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ]}
          locations={[
            {
              id: 1,
              projectId: 1,
              name: "Crystal Tower",
              type: "building",
              description: "An ancient magical tower",
              geography: null,
              culture: null,
              politics: null,
              parentLocationId: null,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ]}
          onEventClick={(event) => console.log("Event clicked:", event)}
          onEventEdit={(event) => console.log("Edit event:", event)}
        />
      </section>
    </div>
  );
}



export default App;