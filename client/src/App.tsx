import { CharacterCard } from "./components/character-card";

function App() {
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
          />
          
          <CharacterCard
            id={2}
            name="Korrath"
            prefix="Lord"
            type="villain"
            description="The fallen king who seeks to reclaim his throne through dark magic and necromancy. His hatred burns as hot as the fires that consumed his kingdom."
          />
          
          <CharacterCard
            id={3}
            name="Finn"
            type="ally"
            description="A loyal friend and skilled warrior who stands by the protagonist's side through thick and thin. His unwavering courage inspires others to fight."
          />
          
          <CharacterCard
            id={4}
            name="Seraphina"
            suffix="of the Dawn"
            type="love-interest"
            description="A mysterious healer with the power to mend both wounds and broken hearts. Her gentle nature hides secrets that could change everything."
          />
          
          <CharacterCard
            id={5}
            name="Marcus"
            prefix="Sir"
            type="supporting"
            description="A grizzled veteran knight who serves as mentor and guide. His experience in battle is matched only by his wisdom in matters of the heart."
          />
          
          <CharacterCard
            id={6}
            name="Zara"
            type="neutral"
            description="A cunning merchant who plays all sides for profit. Her allegiances shift like the winds, but her information is always valuable and accurate."
          />
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
    </div>
  );
}

export default App;