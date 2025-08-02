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
  onChange?: (data: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}

export const WordProcessor: React.FC<WordProcessorProps> = ({
  value,
  onChange,
  placeholder = "Start writing...",
  readOnly = false,
  className = ""
}) => {
  const holderRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorJS | null>(null);
  const [previousContent, setPreviousContent] = useState<string>(value || '');
  const { deleteUnusedImages } = useImageCleanup();
  const changeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const initializingRef = useRef(false);

  useEffect(() => {
    if (!holderRef.current || isInitialized || initializingRef.current) return;

    initializingRef.current = true;

    let initialData;
    try {
      initialData = value ? JSON.parse(value) : { blocks: [] };
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
          if (!onChange || !editorRef.current || !isInitialized) return;

          // Clear previous timeout
          if (changeTimeoutRef.current) {
            clearTimeout(changeTimeoutRef.current);
          }

          // Debounce the change to avoid too many calls
          changeTimeoutRef.current = setTimeout(async () => {
            try {
              if (!editorRef.current) return;

              const outputData = await editorRef.current.save();
              const newContent = JSON.stringify(outputData);

              console.log('Word processor attempting to save...', {
                previousLength: previousContent.length,
                newLength: newContent.length,
                hasBlocks: outputData.blocks?.length || 0,
                contentChanged: newContent !== previousContent
              });

              // Always call onChange to ensure parent components receive updates
              setPreviousContent(newContent);
              onChange(newContent);
              console.log('Content change transmitted to parent component');

              // Clean up unused images (but don't block saving if this fails)
              try {
                await deleteUnusedImages(previousContent, newContent);
              } catch (cleanupError) {
                console.warn('Image cleanup failed (but content was saved):', cleanupError);
              }
            } catch (error) {
              // Suppress SecurityError - these are harmless browser restrictions
              if (error instanceof Error && error.name !== 'SecurityError') {
                console.error('Error saving editor data:', error);
              }
            }
          }, 1000); // Reduced debounce for more responsive saving
        },
        onReady: () => {
          console.log('Editor.js is ready to work!');
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
    const newValue = value || '';
    setPreviousContent(newValue);

    // If editor is initialized and value changed externally, update editor content
    if (editorRef.current && isInitialized && newValue !== previousContent) {
      try {
        const data = newValue ? JSON.parse(newValue) : { blocks: [] };
        editorRef.current.render(data);
        console.log('Editor content updated from external value change');
      } catch (error) {
        console.warn('Could not update editor with new value:', error);
      }
    }
  }, [value, isInitialized, previousContent]);



  return (
    <div className={`word-processor w-full ${className}`}>
      <div 
        ref={holderRef}
        className="min-h-[300px] w-full"
      />
    </div>
  );
};