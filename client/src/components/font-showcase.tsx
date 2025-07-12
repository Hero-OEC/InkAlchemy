export function FontShowcase() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-brand-900 mb-6">Cairo Font Weights</h3>
        
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
            
            <div className="font-black text-brand-800">
              <span className="text-sm text-brand-600 font-medium">Black (900):</span> 
              <span className="ml-2">Ultra-bold for maximum visual impact and emphasis</span>
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


    </div>
  );
}