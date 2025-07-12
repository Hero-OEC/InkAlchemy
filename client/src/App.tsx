function App() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-4xl font-bold text-brand-950 mb-8">Custom Color Palette</h1>
      
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
    </div>
  );
}

export default App;