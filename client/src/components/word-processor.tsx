import React, { useEffect, useRef, useState } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';
import Delimiter from '@editorjs/delimiter';
import Table from '@editorjs/table';
import CodeTool from '@editorjs/code';
import InlineCode from '@editorjs/inline-code';
// @ts-ignore
import LinkTool from '@editorjs/link';
// @ts-ignore
import Marker from '@editorjs/marker';
import Paragraph from '@editorjs/paragraph';
import ImageTool from '@editorjs/image';
import { useImageCleanup } from '@/hooks/useImageCleanup';
import { supabase } from '@/lib/supabase';
import './editor-styles.css';


interface WordProcessorProps {
  value?: string;
  data?: string; // Support both prop names for backward compatibility
  onChange?: (data: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}

export const WordProcessor: React.FC<WordProcessorProps> = ({
  value,
  data, // Support both prop names
  onChange,
  placeholder = "Start writing...",
  readOnly = false,
  className = ""
}) => {
  const holderRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorJS | null>(null);
  const actualValue = value || data || '';
  const [previousContent, setPreviousContent] = useState<string>(actualValue);
  const { deleteUnusedImages } = useImageCleanup();
  const changeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const isInternalUpdateRef = useRef(false); // Track if update is from our onChange
  const initializingRef = useRef(false);
  
  // Add debugging for reset issues (after isInitialized is declared)
  console.log('WordProcessor render:', {
    hasValue: !!value,
    hasData: !!data,
    actualValueLength: actualValue.length,
    previousContentLength: previousContent.length,
    isInitialized
  });

  useEffect(() => {
    if (!holderRef.current || isInitialized || initializingRef.current) return;

    initializingRef.current = true;

    let initialData;
    try {
      initialData = actualValue ? JSON.parse(actualValue) : { blocks: [] };
    } catch {
      initialData = { blocks: [] };
    }

    let editor: EditorJS;

    try {
      editor = new EditorJS({
        holder: holderRef.current,
        tools: {
          header: Header,
          paragraph: {
            class: Paragraph as any,
            inlineToolbar: true
          },
          list: {
            class: List as any,
            inlineToolbar: true
          },
          quote: {
            class: Quote,
            inlineToolbar: true,
            config: {
              quotePlaceholder: 'Enter a quote',
              captionPlaceholder: "Quote's author"
            }
          },
          delimiter: Delimiter,
          table: {
            class: Table as any,
            inlineToolbar: true,
            config: {
              rows: 2,
              cols: 3
            }
          },
          code: CodeTool,
          linkTool: {
            class: LinkTool as any,
            config: {
              endpoint: '/api/fetch-url'
            }
          },
          marker: Marker as any,
          inlineCode: InlineCode,
          image: {
            class: ImageTool,
            config: {
              endpoints: {
                byFile: '/api/upload-image',
                byUrl: '/api/upload-image-by-url'
              },
              captionPlaceholder: 'Enter image caption...',
              withBorder: false,
              withBackground: false,
              stretched: false,
              withCaption: true,
              field: 'image'
            }
          }
        },
        data: initialData,
        readOnly,
        placeholder,
        autofocus: false, // Disable autofocus to avoid security issues
        minHeight: 300,
        onChange: async () => {
          if (!onChange || !editorRef.current) return;

          // Clear previous timeout
          if (changeTimeoutRef.current) {
            clearTimeout(changeTimeoutRef.current);
          }

          // Reduced debounce for more responsive saving
          changeTimeoutRef.current = setTimeout(async () => {
            try {
              if (!editorRef.current) return;

              const outputData = await editorRef.current.save();
              const newContent = JSON.stringify(outputData);

              console.log('Word processor saving content:', {
                previousLength: previousContent.length,
                newLength: newContent.length,
                hasBlocks: outputData.blocks?.length || 0,
                contentChanged: newContent !== previousContent,
                isInitialized,
                outputData: outputData.blocks?.length > 0 ? 'HAS_CONTENT' : 'EMPTY'
              });

              // Only call onChange if content actually changed
              if (newContent !== previousContent) {
                isInternalUpdateRef.current = true; // Mark as internal update
                setPreviousContent(newContent);
                onChange(newContent);
                console.log('✅ Content saved successfully');
                // Reset flag after a brief delay
                setTimeout(() => {
                  isInternalUpdateRef.current = false;
                }, 100);

                // Clean up unused images (but don't block saving if this fails)
                try {
                  await deleteUnusedImages(previousContent, newContent);
                } catch (cleanupError) {
                  console.warn('Image cleanup failed (but content was saved):', cleanupError);
                }
              }
            } catch (error) {
              // Suppress SecurityError - these are harmless browser restrictions
              if (error instanceof Error && error.name !== 'SecurityError') {
                console.error('Error saving editor data:', error);
              }
            }
          }, 500); // Faster response time
        },
        onReady: () => {
          console.log('✅ Editor.js is ready to work!');
          setIsInitialized(true);
          initializingRef.current = false;
        }
      });

      editorRef.current = editor;
    } catch (error) {
      initializingRef.current = false;
      // Suppress SecurityError from getLayoutMap() which is a browser permission issue
      if (error instanceof Error && error.name === 'SecurityError') {
        console.warn('Browser security restriction detected during initialization, but Editor.js will work normally');
        setIsInitialized(true); // Still consider it initialized
      } else {
        console.error('Error initializing Editor.js:', error);
      }
    }

    return () => {
      // Clear any pending timeouts
      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current);
      }

      if (editorRef.current) {
        try {
          editorRef.current.destroy();
        } catch (error) {
          // Suppress destroy errors
          if (error instanceof Error && error.name !== 'SecurityError') {
            console.error('Error destroying editor:', error);
          }
        }
        editorRef.current = null;
      }
      setIsInitialized(false);
      initializingRef.current = false;
    };
  }, []);

  // Update previous content when value prop changes and reinitialize if needed
  useEffect(() => {
    const newValue = actualValue;
    
    // If editor is initialized and value changed externally, update editor content
    // But avoid updates that might be from our own onChange handler
    if (editorRef.current && isInitialized && newValue !== previousContent && !isInternalUpdateRef.current) {
      try {
        const data = newValue ? JSON.parse(newValue) : { blocks: [] };
        
        // Additional check: don't render if the content is the same (this prevents loops)
        if (JSON.stringify(data) !== previousContent) {
          console.log('Editor content updated from external value change', {
            newValueLength: newValue.length,
            previousContentLength: previousContent.length,
            hasBlocks: data.blocks?.length || 0
          });
          
          editorRef.current.render(data);
          setPreviousContent(newValue);
        }
      } catch (error) {
        console.warn('Could not update editor with new value:', error);
        // Don't reset content if parsing fails
      }
    }
  }, [actualValue, isInitialized, previousContent]);



  return (
    <div className={`word-processor w-full ${className}`}>
      <div 
        ref={holderRef}
        className="min-h-[300px] w-full"
      />
    </div>
  );
};