import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

export default function SupabaseInput() {
  const [, setLocation] = useLocation();
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [currentKey, setCurrentKey] = useState('');

  useEffect(() => {
    // Load current values
    const storedUrl = localStorage.getItem('VITE_SUPABASE_URL') || import.meta.env.VITE_SUPABASE_URL || '';
    const storedKey = localStorage.getItem('VITE_SUPABASE_ANON_KEY') || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    
    setCurrentUrl(storedUrl);
    setCurrentKey(storedKey);
    setUrl(storedUrl);
    setAnonKey(storedKey);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Save to localStorage
    localStorage.setItem('VITE_SUPABASE_URL', url);
    localStorage.setItem('VITE_SUPABASE_ANON_KEY', anonKey);
    
    // Reload the page to reinitialize Supabase client
    window.location.href = '/';
  };

  const handleClear = () => {
    if (confirm('This will clear your Supabase configuration and reload the page. Continue?')) {
      localStorage.removeItem('VITE_SUPABASE_URL');
      localStorage.removeItem('VITE_SUPABASE_ANON_KEY');
      // Reload to reset the Supabase client
      window.location.reload();
    }
  };

  const isConfigured = currentUrl && currentUrl !== 'https://placeholder.supabase.co' && 
                       currentKey && currentKey !== 'placeholder-key';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 p-4">
      <div className="max-w-2xl w-full mx-auto p-8 bg-white rounded-lg shadow-lg">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-brand-900 mb-2">Supabase Configuration</h1>
          <p className="text-brand-600">Configure your Supabase connection settings</p>
        </div>

        {isConfigured && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">✓ Supabase is currently configured</p>
            <p className="text-sm text-green-600 mt-1">You can update the credentials below or clear them to start fresh.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="supabase-url" className="block text-sm font-medium text-brand-900 mb-2">
              Supabase URL
            </label>
            <input
              id="supabase-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              className="w-full px-4 py-3 border border-brand-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono text-sm"
              required
              data-testid="input-supabase-url"
            />
            <p className="mt-1 text-xs text-brand-500">Find this in Supabase Dashboard → Settings → API</p>
          </div>
          
          <div>
            <label htmlFor="supabase-anon-key" className="block text-sm font-medium text-brand-900 mb-2">
              Supabase Anon Key
            </label>
            <textarea
              id="supabase-anon-key"
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-4 py-3 border border-brand-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono text-sm"
              rows={3}
              required
              data-testid="input-supabase-anon-key"
            />
            <p className="mt-1 text-xs text-brand-500">Find this in Supabase Dashboard → Settings → API (anon/public key)</p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              data-testid="button-submit-config"
            >
              {isSubmitting ? 'Saving...' : 'Save & Reload'}
            </button>
            
            {isConfigured && (
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-3 border border-brand-300 text-brand-700 rounded-lg hover:bg-brand-50 transition-colors font-medium"
                data-testid="button-clear-config"
              >
                Clear
              </button>
            )}
          </div>
        </form>
        
        <div className="mt-8 pt-6 border-t border-brand-200">
          <h3 className="font-semibold text-brand-900 mb-3">Quick Setup Guide:</h3>
          <ol className="text-sm text-brand-700 space-y-2">
            <li className="flex gap-2">
              <span className="font-bold">1.</span>
              <span>Create a free Supabase project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-brand-600 underline">supabase.com</a></span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">2.</span>
              <span>Go to Settings → API in your Supabase dashboard</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">3.</span>
              <span>Copy the Project URL and paste it above</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">4.</span>
              <span>Copy the anon/public key and paste it above</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">5.</span>
              <span>Click "Save & Reload" to apply your configuration</span>
            </li>
          </ol>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => setLocation('/')}
            className="text-brand-600 hover:text-brand-700 text-sm underline"
            data-testid="link-back-home"
          >
            ← Back to App
          </button>
        </div>
      </div>
    </div>
  );
}
