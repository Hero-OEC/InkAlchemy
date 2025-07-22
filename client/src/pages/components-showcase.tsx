import { CharacterCard } from "@/components/character-card";
import { ButtonShowcase } from "@/components/button-variations";
import { DeleteConfirmationDemo } from "@/components/delete-confirmation";
import { NavbarDemo } from "@/components/navbar";
import { FontShowcase } from "@/components/font-showcase";
import { ContentCardDemo } from "@/components/content-card";
import { FormInputsDemo } from "@/components/form-inputs";
import { MiniCardDemo } from "@/components/mini-card";
import { CharacterMagicCardShowcase } from "@/components/character-magic-card-showcase";
import { CharacterMagicSelectorShowcase } from "@/components/character-magic-selector-showcase";
import SerpentineTimeline from "@/components/serpentine-timeline";
import { WordProcessor } from "@/components/word-processor";
import { EditorContentRenderer } from "@/components/editor-content-renderer";
import { useQuery } from "@tanstack/react-query";
import type { Event, Character, Location, Relationship } from "@shared/schema";
import { useState } from "react";

function ComponentsShowcase() {
  const [editorData, setEditorData] = useState<any>(null);

  // Sample Editor.js data to show how content would look when rendered
  const sampleEditorContent = {
    time: 1753213500000,
    blocks: [
      {
        id: "header1",
        type: "header",
        data: {
          text: "Character Background: Aria Stormwind",
          level: 1
        }
      },
      {
        id: "para1",
        type: "paragraph",
        data: {
          text: "Aria Stormwind was born during the <b>Great Storm of Aethermoor</b>, a supernatural tempest that raged for seven days and nights. The storm's raw magical energy infused her very being, granting her unprecedented control over wind and lightning."
        }
      },
      {
        id: "header2",
        type: "header",
        data: {
          text: "Early Life and Training",
          level: 2
        }
      },
      {
        id: "list1",
        type: "list",
        data: {
          style: "unordered",
          items: [
            "Trained under <i>Master Theron Windcaller</i> at the Storm Academy",
            "Mastered basic weather manipulation by age 16",
            "First to successfully summon a <b>controlled lightning strike</b> in academy history",
            "Graduated with highest honors in Storm Magic and Combat Theory"
          ]
        }
      },
      {
        id: "quote1",
        type: "quote",
        data: {
          text: "The storm does not rage against the mountain because it hates the stone. It simply knows no other way to be.",
          caption: "Aria's personal philosophy"
        }
      },
      {
        id: "header3",
        type: "header",
        data: {
          text: "Current Mission",
          level: 3
        }
      },
      {
        id: "para2",
        type: "paragraph",
        data: {
          text: "Now <mark>Lady Aria Stormwind the Brave</mark> seeks to restore the ancient balance between the elemental forces that have been disrupted by dark magic. Her quest will take her through treacherous lands and face-to-face with enemies who seek to harness the storm's power for their own ends."
        }
      },
      {
        id: "delimiter1",
        type: "delimiter",
        data: {}
      },
      {
        id: "abilities",
        type: "header",
        data: {
          text: "Storm Powers & Abilities",
          level: 2
        }
      },
      {
        id: "abilities-list",
        type: "list",
        data: {
          style: "ordered",
          items: [
            "<b>Lightning Strike</b> - Can call down precise bolts of lightning",
            "<b>Wind Manipulation</b> - Controls air currents and wind speeds", 
            "<b>Storm Sight</b> - Can see through any weather conditions",
            "<b>Thunder Voice</b> - Her voice can carry across vast distances during storms"
          ]
        }
      },
      {
        id: "image1",
        type: "image",
        data: {
          file: {
            url: "/uploads/1753210377400-814214746.png"
          },
          caption: "Aria Stormwind in battle stance, channeling lightning magic",
          withBorder: true,
          withBackground: false,
          stretched: false
        }
      },
      {
        id: "code1",
        type: "code",
        data: {
          code: "// Storm Magic Incantation\nfunction summonLightning(target, intensity) {\n  const stormEnergy = channelElementalForce('lightning');\n  const strike = focusEnergy(stormEnergy, target);\n  return castSpell(strike, intensity);\n}"
        }
      }
    ],
    version: "2.30.6"
  };

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CharacterCard
            id={1}
            name="Aria Stormwind"
            prefix="Lady"
            suffix="the Brave"
            type="protagonist"
            description="A fierce warrior with the power to control storms, seeking to restore balance to the realm."
            imageUrl="https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=400&h=400&fit=crop&crop=face"
            createdAt={new Date('2024-01-15')}
            lastEditedAt={new Date('2024-01-20')}
          />
          <CharacterCard
            id={2}
            name="Marcus Shadowbane"
            type="antagonist"
            description="A dark sorcerer who commands the shadows and seeks to plunge the world into eternal darkness."
            createdAt={new Date('2024-01-12')}
            lastEditedAt={new Date('2024-01-18')}
          />
          <CharacterCard
            id={3}
            name="Elena Brightleaf"
            type="ally"
            description="A wise healer from the forest realm who aids heroes with her knowledge of ancient magic."
            imageUrl="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face"
            createdAt={new Date('2024-01-10')}
            lastEditedAt={new Date('2024-01-16')}
          />
        </div>
      </section>

      {/* Button Variations Demo */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-brand-900 mb-6">Button Variations</h2>
        <ButtonShowcase />
      </section>

      {/* Delete Confirmation Demo */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-brand-900 mb-6">Delete Confirmation Modal</h2>
        <DeleteConfirmationDemo />
      </section>

      {/* Navigation Demo */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-brand-900 mb-6">Navigation Bar</h2>
        <NavbarDemo />
      </section>

      {/* Content Cards Demo */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-brand-900 mb-6">Content Cards</h2>
        <ContentCardDemo />
      </section>

      {/* Form Inputs Demo */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-brand-900 mb-6">Form Components</h2>
        <FormInputsDemo />
      </section>

      {/* Mini Cards Demo */}
      <section className="mb-12">
        <MiniCardDemo />
      </section>

      {/* Character Magic Cards Demo */}
      <section className="mb-12">
        <CharacterMagicCardShowcase />
      </section>

      {/* Character Magic Selector Demo */}
      <section className="mb-12">
        <CharacterMagicSelectorShowcase />
      </section>

      {/* Font Demo */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-brand-900 mb-6">Typography - Cairo Font</h2>
        <FontShowcase />
      </section>

      {/* Brand Color Palette */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-brand-900 mb-6">Brand Color Palette</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4 mb-8">
          {/* Color 50 */}
          <div className="bg-brand-50 p-6 rounded-lg border border-brand-100">
            <div className="text-brand-900 font-semibold">Color 50</div>
            <div className="text-brand-800 text-sm">#FAF9EC</div>
            <div className="text-brand-700 text-xs mt-1">Light backgrounds, main surface</div>
          </div>
          
          {/* Color 100 */}
          <div className="bg-brand-100 p-6 rounded-lg border border-brand-200">
            <div className="text-brand-900 font-semibold">Color 100</div>
            <div className="text-brand-800 text-sm">#F4F0CD</div>
            <div className="text-brand-700 text-xs mt-1">Secondary backgrounds</div>
          </div>
          
          {/* Color 200 */}
          <div className="bg-brand-200 p-6 rounded-lg border border-brand-300">
            <div className="text-brand-900 font-semibold">Color 200</div>
            <div className="text-brand-800 text-sm">#EBDF9D</div>
            <div className="text-brand-700 text-xs mt-1">Hover backgrounds, soft accents</div>
          </div>
          
          {/* Color 300 */}
          <div className="bg-brand-300 p-6 rounded-lg border border-brand-400">
            <div className="text-brand-900 font-semibold">Color 300</div>
            <div className="text-brand-800 text-sm">#DFC865</div>
            <div className="text-brand-700 text-xs mt-1">Subtle headers, muted buttons</div>
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

      {/* Editor.js Content Rendering Demo */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-brand-900 mb-6">How Editor.js Content Looks on Details Pages</h2>
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-8">
          <div className="mb-4 p-4 bg-brand-50 rounded-lg">
            <h3 className="text-lg font-semibold text-brand-800 mb-2">Preview: Character Details Page Content</h3>
            <p className="text-brand-700 text-sm">
              This shows how rich content created with Editor.js would appear on character detail pages after saving. 
              The content maintains professional styling while being fully responsive.
            </p>
          </div>
          <EditorContentRenderer data={sampleEditorContent} />
        </div>
      </section>

      {/* Word Processor Demo */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-brand-900 mb-6">Word Processor Editor (Create/Edit Pages)</h2>
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-blue-800 font-semibold mb-2">✅ Image Upload Ready!</h4>
            <p className="text-blue-700 text-sm">
              Image upload is fully functional! Use the Image tool in the toolbar to upload files or add images by URL. 
              Uploaded images are stored in <code>/public/uploads/</code> and served automatically.
            </p>
          </div>
          <p className="text-brand-700 mb-4 text-sm">
            Clean Editor.js component with no custom styling - just the base functionality. Fully responsive to container width.
          </p>
          <WordProcessor
            data={editorData}
            onChange={setEditorData}
            placeholder="Start writing your story..."
          />
        </div>
        
        {/* Show responsive demo with different container sizes */}
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold text-brand-800">Responsive Demo - Different Container Sizes</h3>
          
          {/* Small container */}
          <div className="bg-brand-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-brand-700 mb-2">Small Container (300px width)</h4>
            <div className="w-[300px] bg-brand-50 border border-brand-200 rounded p-3">
              <WordProcessor
                placeholder="Small container test..."
                className="text-sm"
              />
            </div>
          </div>
          
          {/* Medium container */}
          <div className="bg-brand-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-brand-700 mb-2">Medium Container (500px width)</h4>
            <div className="w-[500px] bg-brand-50 border border-brand-200 rounded p-4">
              <WordProcessor
                placeholder="Medium container test..."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Serpentine Timeline Demo */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-brand-900 mb-6">Interactive Timeline</h2>
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
          <p className="text-brand-700 mb-6 text-sm">
            This timeline shows events from your project with interactive bubbles. Hover over events to see details, 
            and notice how multiple events on the same date are grouped together.
          </p>
          <SerpentineTimeline
            events={processedEvents}
            characters={characters}
            locations={locations}
            onEventClick={(event) => console.log("Event clicked:", event)}
            onEventEdit={(event) => console.log("Edit event:", event)}
          />
        </div>
      </section>
    </div>
  );
}

export default ComponentsShowcase;