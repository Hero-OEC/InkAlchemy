import { useState, useRef, useEffect } from "react";
import "./word-processor.css";
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
  Upload,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  FileText
} from "lucide-react";

interface WordProcessorProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
  className?: string;
  maxWidth?: string; // Allow parent to control max width
}

interface DocumentSettings {
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  headingStyles: {
    h1: { size: number; weight: string; spacing: number };
    h2: { size: number; weight: string; spacing: number };
    h3: { size: number; weight: string; spacing: number };
    h4: { size: number; weight: string; spacing: number };
    subtitle: { size: number; weight: string; spacing: number; color: string };
    paragraph: { size: number; weight: string; spacing: number };
  };
}

export function WordProcessor({ 
  initialContent = "", 
  onContentChange,
  className = "",
  maxWidth = "w-full"
}: WordProcessorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [wordCount, setWordCount] = useState(0);
  const [settings, setSettings] = useState<DocumentSettings>({
    fontSize: 16,
    lineHeight: 1.6,
    fontFamily: 'Cairo',
    headingStyles: {
      h1: { size: 32, weight: 'bold', spacing: 6 },
      h2: { size: 24, weight: 'semibold', spacing: 5 },
      h3: { size: 20, weight: 'medium', spacing: 4 },
      h4: { size: 18, weight: 'medium', spacing: 3 },
      subtitle: { size: 16, weight: 'normal', spacing: 2, color: '#64748b' },
      paragraph: { size: 16, weight: 'normal', spacing: 3 }
    }
  });

  // Initialize content
  useEffect(() => {
    if (editorRef.current && initialContent) {
      editorRef.current.innerHTML = initialContent;
    }
  }, [initialContent]);

  // Click outside to deselect images
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(e.target as Node)) {
        const allImages = editorRef.current.querySelectorAll('.image-container');
        allImages.forEach(img => {
          img.classList.remove('selected');
          (img as HTMLElement).style.border = '2px transparent solid';
          const controls = img.querySelector('.image-controls') as HTMLElement;
          const handle = img.querySelector('.resize-handle') as HTMLElement;
          if (controls) controls.style.display = 'none';
          if (handle) handle.style.display = 'none';
        });
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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

  // Format block commands for headings
  const formatBlock = (tag: string) => {
    document.execCommand('formatBlock', false, tag);
    editorRef.current?.focus();
    handleContentChange();
  };

  // Image upload handling with enhanced features
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageId = `img-${Date.now()}`;
      
      // Create container div for the image
      const imageContainer = document.createElement('div');
      imageContainer.className = 'image-container';
      imageContainer.contentEditable = 'false';
      imageContainer.style.cssText = `
        position: relative;
        display: inline-block;
        margin: 8px;
        border: 2px transparent solid;
        border-radius: 8px;
        cursor: move;
        max-width: 300px;
        float: left;
      `;
      
      // Create the image element
      const img = document.createElement('img');
      img.id = imageId;
      img.src = e.target?.result as string;
      img.style.cssText = `
        width: 100%;
        height: auto;
        display: block;
        border-radius: 6px;
      `;
      
      // Create resize handles
      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'resize-handle';
      resizeHandle.style.cssText = `
        position: absolute;
        bottom: -5px;
        right: -5px;
        width: 12px;
        height: 12px;
        background: #3b82f6;
        border: 2px solid white;
        border-radius: 50%;
        cursor: se-resize;
        display: none;
      `;
      
      // Create positioning controls
      const controls = document.createElement('div');
      controls.className = 'image-controls';
      controls.style.cssText = `
        position: absolute;
        top: -35px;
        left: 0;
        display: none;
        gap: 4px;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      `;
      
      // Position buttons
      const positions = [
        { label: 'L', value: 'left', title: 'Float Left' },
        { label: 'C', value: 'center', title: 'Center' },
        { label: 'R', value: 'right', title: 'Float Right' }
      ];
      
      positions.forEach(pos => {
        const btn = document.createElement('button');
        btn.textContent = pos.label;
        btn.title = pos.title;
        btn.style.cssText = `
          width: 24px;
          height: 24px;
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 500;
        `;
        btn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          setImagePosition(imageContainer, pos.value);
        };
        controls.appendChild(btn);
      });
      
      // Size controls
      const sizeLabel = document.createElement('span');
      sizeLabel.textContent = '|';
      sizeLabel.style.cssText = 'color: #d1d5db; margin: 0 4px;';
      controls.appendChild(sizeLabel);
      
      const sizes = [
        { label: 'S', width: '150px' },
        { label: 'M', width: '250px' },
        { label: 'L', width: '400px' }
      ];
      
      sizes.forEach(size => {
        const btn = document.createElement('button');
        btn.textContent = size.label;
        btn.style.cssText = `
          width: 24px;
          height: 24px;
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 500;
        `;
        btn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          imageContainer.style.maxWidth = size.width;
        };
        controls.appendChild(btn);
      });
      
      // Delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '×';
      deleteBtn.title = 'Delete Image';
      deleteBtn.style.cssText = `
        width: 24px;
        height: 24px;
        border: 1px solid #ef4444;
        background: #fef2f2;
        color: #ef4444;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
        margin-left: 4px;
      `;
      deleteBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        imageContainer.remove();
        handleContentChange();
      };
      controls.appendChild(deleteBtn);
      
      // Assemble the image container
      imageContainer.appendChild(img);
      imageContainer.appendChild(resizeHandle);
      imageContainer.appendChild(controls);
      
      // Add event listeners
      imageContainer.addEventListener('click', (e) => {
        e.preventDefault();
        selectImage(imageContainer);
      });
      
      imageContainer.addEventListener('mouseenter', () => {
        imageContainer.style.border = '2px solid #3b82f6';
        controls.style.display = 'flex';
        resizeHandle.style.display = 'block';
      });
      
      imageContainer.addEventListener('mouseleave', () => {
        if (!imageContainer.classList.contains('selected')) {
          imageContainer.style.border = '2px transparent solid';
          controls.style.display = 'none';
          resizeHandle.style.display = 'none';
        }
      });
      
      // Resize functionality
      let isResizing = false;
      resizeHandle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        isResizing = true;
        
        const startX = e.clientX;
        const startWidth = imageContainer.offsetWidth;
        
        const handleMouseMove = (e: MouseEvent) => {
          const newWidth = startWidth + (e.clientX - startX);
          imageContainer.style.maxWidth = Math.max(100, Math.min(600, newWidth)) + 'px';
        };
        
        const handleMouseUp = () => {
          isResizing = false;
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
          handleContentChange();
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      });
      
      // Insert image at cursor position
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(imageContainer);
        range.collapse(false);
      }
      
      handleContentChange();
    };
    reader.readAsDataURL(file);
    
    // Reset input
    event.target.value = '';
  };

  // Helper functions for image manipulation
  const selectImage = (container: HTMLElement) => {
    // Remove selection from other images
    const allImages = editorRef.current?.querySelectorAll('.image-container');
    allImages?.forEach(img => {
      img.classList.remove('selected');
      (img as HTMLElement).style.border = '2px transparent solid';
      const controls = img.querySelector('.image-controls') as HTMLElement;
      const handle = img.querySelector('.resize-handle') as HTMLElement;
      if (controls) controls.style.display = 'none';
      if (handle) handle.style.display = 'none';
    });
    
    // Select current image
    container.classList.add('selected');
    container.style.border = '2px solid #3b82f6';
    const controls = container.querySelector('.image-controls') as HTMLElement;
    const handle = container.querySelector('.resize-handle') as HTMLElement;
    if (controls) controls.style.display = 'flex';
    if (handle) handle.style.display = 'block';
  };

  const setImagePosition = (container: HTMLElement, position: string) => {
    switch (position) {
      case 'left':
        container.style.float = 'left';
        container.style.display = 'block';
        container.style.margin = '8px 16px 8px 0';
        break;
      case 'right':
        container.style.float = 'right';
        container.style.display = 'block';
        container.style.margin = '8px 0 8px 16px';
        break;
      case 'center':
        container.style.float = 'none';
        container.style.display = 'block';
        container.style.margin = '16px auto';
        break;
    }
    handleContentChange();
  };



  return (
    <div className={`w-full ${className}`}>
      {/* Container with responsive width */}
      <div className={`${maxWidth}`}>
        {/* Toolbar */}
        <div className="sticky top-0 z-10 bg-brand-50 border border-brand-200 rounded-t-lg p-4">
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

          {/* Text Style Dropdown */}
          <Select
            onValueChange={(value) => {
              if (value === 'subtitle') {
                formatBlock('h5');
              } else if (value === 'paragraph') {
                formatBlock('p');
              } else {
                formatBlock(value);
              }
            }}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="h1">Heading 1</SelectItem>
              <SelectItem value="h2">Heading 2</SelectItem>
              <SelectItem value="h3">Heading 3</SelectItem>
              <SelectItem value="h4">Heading 4</SelectItem>
              <SelectItem value="subtitle">Subtitle</SelectItem>
              <SelectItem value="paragraph">Paragraph</SelectItem>
            </SelectContent>
          </Select>

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
            <PopoverContent className="w-96 max-h-80 overflow-y-auto">
              <div className="space-y-4">
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

                {/* Heading Styles Customization */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-3">Text Style Settings</h4>
                  
                  {Object.entries(settings.headingStyles).map(([key, style]) => (
                    <div key={key} className="mb-4 p-3 bg-brand-25 rounded border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium capitalize">
                          {key === 'subtitle' ? 'Subtitle' : key.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block mb-1">Size (px)</label>
                          <Input
                            type="number"
                            value={style.size}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              headingStyles: {
                                ...prev.headingStyles,
                                [key]: { ...style, size: parseInt(e.target.value) || 16 }
                              }
                            }))}
                            className="h-7"
                          />
                        </div>
                        
                        <div>
                          <label className="block mb-1">Weight</label>
                          <Select
                            value={style.weight}
                            onValueChange={(value) => setSettings(prev => ({
                              ...prev,
                              headingStyles: {
                                ...prev.headingStyles,
                                [key]: { ...style, weight: value }
                              }
                            }))}
                          >
                            <SelectTrigger className="h-7">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="semibold">Semibold</SelectItem>
                              <SelectItem value="bold">Bold</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="block mb-1">Spacing</label>
                          <Input
                            type="number"
                            value={style.spacing}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              headingStyles: {
                                ...prev.headingStyles,
                                [key]: { ...style, spacing: parseInt(e.target.value) || 1 }
                              }
                            }))}
                            className="h-7"
                          />
                        </div>
                        
                        {key === 'subtitle' && (
                          <div>
                            <label className="block mb-1">Color</label>
                            <Input
                              type="color"
                              value={(style as any).color}
                              onChange={(e) => setSettings(prev => ({
                                ...prev,
                                headingStyles: {
                                  ...prev.headingStyles,
                                  [key]: { ...style, color: e.target.value }
                                }
                              }))}
                              className="h-7 w-full"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
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

        {/* Document Canvas */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleContentChange}
          className="word-processor-content min-h-[600px] p-8 bg-white rounded-b-lg border-l border-r border-b border-brand-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent prose prose-brand max-w-none"
          style={{
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineHeight,
            fontFamily: settings.fontFamily,
            // Apply custom heading styles
            '--h1-size': `${settings.headingStyles.h1.size}px`,
            '--h1-weight': settings.headingStyles.h1.weight,
            '--h1-spacing': `${settings.headingStyles.h1.spacing * 4}px`,
            '--h2-size': `${settings.headingStyles.h2.size}px`,
            '--h2-weight': settings.headingStyles.h2.weight,
            '--h2-spacing': `${settings.headingStyles.h2.spacing * 4}px`,
            '--h3-size': `${settings.headingStyles.h3.size}px`,
            '--h3-weight': settings.headingStyles.h3.weight,
            '--h3-spacing': `${settings.headingStyles.h3.spacing * 4}px`,
            '--h4-size': `${settings.headingStyles.h4.size}px`,
            '--h4-weight': settings.headingStyles.h4.weight,
            '--h4-spacing': `${settings.headingStyles.h4.spacing * 4}px`,
            '--subtitle-size': `${settings.headingStyles.subtitle.size}px`,
            '--subtitle-weight': settings.headingStyles.subtitle.weight,
            '--subtitle-spacing': `${settings.headingStyles.subtitle.spacing * 4}px`,
            '--subtitle-color': settings.headingStyles.subtitle.color,
            '--p-size': `${settings.headingStyles.paragraph.size}px`,
            '--p-weight': settings.headingStyles.paragraph.weight,
            '--p-spacing': `${settings.headingStyles.paragraph.spacing * 4}px`,
          } as React.CSSProperties}
          suppressContentEditableWarning={true}
          placeholder="Start writing your article..."
        />
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
        initialContent="<h1>Welcome to the Word Processor</h1><h2>Rich Text Formatting</h2><p>Start typing to create your article. Use the toolbar above to format your text with headings, styles, colors, and more. Try uploading an image and see how you can resize it, reposition it, and let text wrap around it naturally.</p><h3>Image Features</h3><p>Upload an image using the image button in the toolbar. Once uploaded, you can click on the image to see positioning controls (Left, Center, Right), size controls (Small, Medium, Large), and a delete option. You can also drag the blue handle in the bottom-right corner to resize the image manually.</p><h4>Sample Heading 4</h4><h5>This is a subtitle style</h5><p>Regular paragraph text with proper line spacing and formatting. Text will flow naturally around images when they are positioned to the left or right, creating professional document layouts.</p>"
        onContentChange={setContent}
        maxWidth="max-w-4xl mx-auto"
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