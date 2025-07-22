import React, { useState } from 'react';
import { WordProcessor } from './word-processor';
import { Button } from '@/components/ui/button';
import { FileText, Save, Trash2 } from 'lucide-react';

export function WordProcessorDemo() {
  const [editorData, setEditorData] = useState<any>(null);

  const handleEditorChange = (data: any) => {
    setEditorData(data);
    console.log('Editor data changed:', data);
  };

  const handleSave = () => {
    if (editorData) {
      console.log('Saving document:', editorData);
      // Here you would typically save to your backend
      alert('Document saved! Check console for data.');
    }
  };

  const handleClear = () => {
    setEditorData({
      blocks: [
        {
          type: 'paragraph',
          data: { text: '' }
        }
      ]
    });
  };

  const sampleData = {
    blocks: [
      {
        type: 'header',
        data: {
          text: 'Welcome to StoryForge Word Processor',
          level: 1
        }
      },
      {
        type: 'paragraph',
        data: {
          text: 'This is a custom word processor built with Editor.js and styled to match the StoryForge brand. You can write stories, create characters, and build your world with this powerful editor.'
        }
      },
      {
        type: 'header',
        data: {
          text: 'Features',
          level: 2
        }
      },
      {
        type: 'list',
        data: {
          style: 'unordered',
          items: [
            'Rich text formatting with brand colors',
            'Headers, lists, quotes, and code blocks',
            'Tables for organizing information',
            'Inline tools like highlighting and inline code',
            'Customized to match StoryForge theme'
          ]
        }
      },
      {
        type: 'quote',
        data: {
          text: 'Every great story begins with a single word.',
          caption: 'Anonymous'
        }
      },
      {
        type: 'delimiter',
        data: {}
      },
      {
        type: 'paragraph',
        data: {
          text: 'Start writing your epic tale below...'
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-brand-500 p-3 rounded-xl">
              <FileText size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-brand-950">Word Processor Demo</h1>
              <p className="text-brand-600 mt-1">
                A custom Editor.js implementation with StoryForge branding
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setEditorData(sampleData)}
              className="flex items-center gap-2"
            >
              <FileText size={16} />
              Load Sample
            </Button>
            <Button 
              variant="outline" 
              onClick={handleClear}
              className="flex items-center gap-2"
            >
              <Trash2 size={16} />
              Clear
            </Button>
            <Button 
              onClick={handleSave}
              className="flex items-center gap-2"
            >
              <Save size={16} />
              Save
            </Button>
          </div>
        </div>

        {/* Word Processor */}
        <div className="bg-brand-50 rounded-lg border border-brand-200 p-8">
          <WordProcessor
            data={editorData}
            onChange={handleEditorChange}
            placeholder="Start writing your story..."
            className="w-full"
          />
        </div>

        {/* Data Preview */}
        {editorData && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Editor Data (JSON):</h3>
            <pre className="text-sm overflow-auto max-h-60">
              {JSON.stringify(editorData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default WordProcessorDemo;