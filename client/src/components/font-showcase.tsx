export function FontShowcase() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-brand-900 mb-6">Plus Jakarta Sans Font Weights</h3>
        
        <div className="space-y-4">
          {/* Font Weight Demonstrations */}
          <div className="space-y-3">
            <div className="font-extralight text-brand-800">
              <span className="text-sm text-brand-600 font-medium">ExtraLight (200):</span> 
              <span className="ml-2">Perfect for subtle watermarks and very light text</span>
            </div>
            
            <div className="font-light text-brand-800">
              <span className="text-sm text-brand-600 font-medium">Light (300):</span> 
              <span className="ml-2">Great for captions, timestamps, and secondary information</span>
            </div>
            
            <div className="font-normal text-brand-800">
              <span className="text-sm text-brand-600 font-medium">Regular (400):</span> 
              <span className="ml-2">Primary body text, descriptions, and readable content</span>
            </div>
            
            <div className="font-medium text-brand-800">
              <span className="text-sm text-brand-600 font-medium">Medium (500):</span> 
              <span className="ml-2">Labels, form fields, and slightly emphasized text</span>
            </div>
            
            <div className="font-semibold text-brand-800">
              <span className="text-sm text-brand-600 font-medium">SemiBold (600):</span> 
              <span className="ml-2">Headings, titles, and important information</span>
            </div>
            
            <div className="font-bold text-brand-800">
              <span className="text-sm text-brand-600 font-medium">Bold (700):</span> 
              <span className="ml-2">Strong emphasis, major headings, and call-to-action text</span>
            </div>
            
            <div className="font-extrabold text-brand-800">
              <span className="text-sm text-brand-600 font-medium">ExtraBold (800):</span> 
              <span className="ml-2">Hero headings, brand names, and maximum impact text</span>
            </div>
          </div>
        </div>
      </div>

      {/* Typography Hierarchy Example */}
      <div className="bg-brand-100 border border-brand-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-brand-900 mb-4">Typography Hierarchy in Use</h3>
        
        <div className="space-y-4">
          <h1 className="text-3xl font-extrabold text-brand-950">
            Hero Heading (ExtraBold)
          </h1>
          
          <h2 className="text-2xl font-bold text-brand-900">
            Section Heading (Bold)
          </h2>
          
          <h3 className="text-xl font-semibold text-brand-800">
            Subsection Heading (SemiBold)
          </h3>
          
          <h4 className="text-lg font-medium text-brand-700">
            Component Title (Medium)
          </h4>
          
          <p className="text-base font-normal text-brand-800 leading-relaxed">
            This is regular body text using the normal weight (400). It's perfect for 
            character descriptions, story notes, and any readable content in your 
            world-building application.
          </p>
          
          <p className="text-sm font-light text-brand-600">
            Secondary information or captions use light weight (300) for 
            a subtle appearance without competing with main content.
          </p>
          
          <div className="flex gap-3 mt-6">
            <button className="bg-brand-400 text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-500 transition-colors">
              Primary Action (SemiBold)
            </button>
            <button className="bg-brand-200 text-brand-800 px-4 py-2 rounded-lg font-medium hover:bg-brand-300 transition-colors">
              Secondary Action (Medium)
            </button>
          </div>
        </div>
      </div>

      {/* Character Card Example with Proper Typography */}
      <div className="bg-brand-100 border border-brand-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-brand-900 mb-4">Character Card Typography</h3>
        
        <div className="bg-brand-50 border border-brand-200 rounded-lg p-4 max-w-sm">
          <div className="aspect-square w-full bg-brand-200 rounded-lg mb-3 flex items-center justify-center">
            <span className="text-brand-600 font-light">Character Image</span>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-brand-400 rounded flex items-center justify-center">
              <span className="text-white text-xs">★</span>
            </div>
            <h3 className="text-lg font-semibold text-brand-950">
              <span className="text-sm font-light text-brand-600">Lady </span>
              Aeliana
              <span className="text-sm font-light text-brand-600"> the Wise</span>
            </h3>
          </div>
          
          <div className="mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-400 text-white">
              Protagonist
            </span>
          </div>
          
          <p className="text-sm font-normal text-brand-700 leading-relaxed mb-3">
            A brilliant mage and scholar who discovers an ancient prophecy...
          </p>
          
          <div className="border-t border-brand-200 pt-3">
            <div className="flex justify-between text-xs font-light text-brand-600">
              <span><span className="font-medium">Created:</span> 1/15/2024</span>
              <span><span className="font-medium">Edited:</span> 1/20/2024</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}