import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Image,
  Undo2,
  Redo2,
  Type,
  Palette,
  Settings,
  Upload
} from "lucide-react";

interface WordProcessorProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
  className?: string;
}

interface DocumentSettings {
  fontSize: number;
  lineHeight: number;
  maxWidth: 'narrow' | 'standard' | 'wide' | 'full';
  fontFamily: string;
}

export function WordProcessor({ 
  initialContent = "", 
  onContentChange,
  className = "" 
}: WordProcessorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [wordCount, setWordCount] = useState(0);
  const [settings, setSettings] = useState<DocumentSettings>({
    fontSize: 16,
    lineHeight: 1.6,
    maxWidth: 'standard',
    fontFamily: 'Cairo'
  });

  // Initialize content
  useEffect(() => {
    if (editorRef.current && initialContent) {
      editorRef.current.innerHTML = initialContent;
    }
  }, [initialContent]);

  // Update word count and notify parent of changes
  const handleContentChange = () => {
    if (!editorRef.current) return;
    
    const content = editorRef.current.innerHTML;
    const text = editorRef.current.textContent || '';
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    
    onContentChange?.(content);
  };

  // Formatting commands
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
  };

  // Image upload handling
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.src = e.target?.result as string;
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.margin = '16px 0';
      img.style.borderRadius = '8px';
      
      // Insert image at cursor position
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(img);
        range.collapse(false);
      }
      
      handleContentChange();
    };
    reader.readAsDataURL(file);
    
    // Reset input
    event.target.value = '';
  };

  // Get width class based on setting
  const getMaxWidthClass = () => {
    switch (settings.maxWidth) {
      case 'narrow': return 'max-w-2xl';
      case 'standard': return 'max-w-4xl';
      case 'wide': return 'max-w-6xl';
      case 'full': return 'max-w-full';
      default: return 'max-w-4xl';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-white border-b border-brand-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          {/* Text Formatting */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => execCommand('bold')}
              className="w-8 h-8 p-0"
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => execCommand('italic')}
              className="w-8 h-8 p-0"
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => execCommand('underline')}
              className="w-8 h-8 p-0"
            >
              <Underline className="w-4 h-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Alignment */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => execCommand('justifyLeft')}
              className="w-8 h-8 p-0"
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => execCommand('justifyCenter')}
              className="w-8 h-8 p-0"
            >
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => execCommand('justifyRight')}
              className="w-8 h-8 p-0"
            >
              <AlignRight className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => execCommand('justifyFull')}
              className="w-8 h-8 p-0"
            >
              <AlignJustify className="w-4 h-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Font Size */}
          <Select
            value={settings.fontSize.toString()}
            onValueChange={(value) => setSettings(prev => ({ ...prev, fontSize: parseInt(value) }))}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12">12px</SelectItem>
              <SelectItem value="14">14px</SelectItem>
              <SelectItem value="16">16px</SelectItem>
              <SelectItem value="18">18px</SelectItem>
              <SelectItem value="20">20px</SelectItem>
              <SelectItem value="24">24px</SelectItem>
              <SelectItem value="28">28px</SelectItem>
              <SelectItem value="32">32px</SelectItem>
            </SelectContent>
          </Select>

          {/* Text Color */}
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="ghost" className="w-8 h-8 p-0">
                <Palette className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Text Color</label>
                  <div className="flex gap-2 mt-2">
                    {['#000000', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'].map(color => (
                      <button
                        key={color}
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: color }}
                        onClick={() => execCommand('foreColor', color)}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Highlight</label>
                  <div className="flex gap-2 mt-2">
                    {['transparent', '#fef3c7', '#dbeafe', '#d1fae5', '#fce7f3', '#e0e7ff'].map(color => (
                      <button
                        key={color}
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: color }}
                        onClick={() => execCommand('hiliteColor', color)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Separator orientation="vertical" className="h-6" />

          {/* Image Upload */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            className="w-8 h-8 p-0"
          >
            <Image className="w-4 h-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Undo/Redo */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => execCommand('undo')}
            className="w-8 h-8 p-0"
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => execCommand('redo')}
            className="w-8 h-8 p-0"
          >
            <Redo2 className="w-4 h-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Document Settings */}
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="ghost" className="w-8 h-8 p-0">
                <Settings className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Document Width</label>
                  <Select
                    value={settings.maxWidth}
                    onValueChange={(value: 'narrow' | 'standard' | 'wide' | 'full') => 
                      setSettings(prev => ({ ...prev, maxWidth: value }))
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="narrow">Narrow (672px)</SelectItem>
                      <SelectItem value="standard">Standard (896px)</SelectItem>
                      <SelectItem value="wide">Wide (1152px)</SelectItem>
                      <SelectItem value="full">Full Width</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Line Height</label>
                  <div className="mt-2">
                    <Slider
                      value={[settings.lineHeight]}
                      onValueChange={([value]) => setSettings(prev => ({ ...prev, lineHeight: value }))}
                      min={1.2}
                      max={2.5}
                      step={0.1}
                    />
                    <div className="text-xs text-brand-600 mt-1">{settings.lineHeight}</div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Word Count */}
          <div className="ml-auto text-sm text-brand-600">
            {wordCount} words
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Editor Container */}
      <div className="w-full flex justify-center">
        <div className={`${getMaxWidthClass()} w-full`}>
          {/* Document Canvas */}
          <div
            ref={editorRef}
            contentEditable
            onInput={handleContentChange}
            className="min-h-[600px] p-8 bg-white rounded-lg border border-brand-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent prose prose-brand max-w-none"
            style={{
              fontSize: `${settings.fontSize}px`,
              lineHeight: settings.lineHeight,
              fontFamily: settings.fontFamily,
            }}
            suppressContentEditableWarning={true}
            placeholder="Start writing your article..."
          />
        </div>
      </div>
    </div>
  );
}

// Demo component for showcase
export function WordProcessorDemo() {
  const [content, setContent] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-brand-900 mb-2">Article-Style Word Processor</h3>
        <p className="text-brand-600 text-sm mb-6">
          A full-featured, pageless word processor similar to Google Docs. Features rich text formatting, 
          image uploads, customizable document width, and real-time word counting.
        </p>
      </div>
      
      <WordProcessor
        initialContent="<h1>Welcome to the Word Processor</h1><p>Start typing to create your article. Use the toolbar above to format your text, add images, and customize the document layout.</p>"
        onContentChange={setContent}
      />
      
      {content && (
        <details className="mt-6">
          <summary className="text-sm font-medium text-brand-900 cursor-pointer">
            View HTML Output
          </summary>
          <pre className="mt-2 p-4 bg-brand-50 border border-brand-200 rounded text-xs overflow-auto">
            {content}
          </pre>
        </details>
      )}
    </div>
  );
}