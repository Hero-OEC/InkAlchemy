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

  useEffect(() => {
    if (!holderRef.current) return;

    let initialData;
    try {
      initialData = value ? JSON.parse(value) : { blocks: [] };
    } catch {
      initialData = { blocks: [] };
    }

    let editor: EditorJS;
    
    // Get initial auth headers for image uploads
    const getInitialAuthHeaders = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {
        'Accept': 'application/json'
      };
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      return headers;
    };
    
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
              byUrl: '/api/upload-image-by-url',
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
      autofocus: true,
      minHeight: 300,
      onChange: async () => {
        if (onChange && editorRef.current) {
          // Clear previous timeout
          if (changeTimeoutRef.current) {
            clearTimeout(changeTimeoutRef.current);
          }
          
          // Debounce the change to avoid too many calls
          changeTimeoutRef.current = setTimeout(async () => {
            try {
              const outputData = await editorRef.current!.save();
              console.log('Word processor saving data:', outputData);
              const newContent = JSON.stringify(outputData);
              
              // Clean up unused images (this will log what's happening)
              await deleteUnusedImages(previousContent, newContent);
              
              // Update the content immediately
              setPreviousContent(newContent);
              onChange(newContent);
            } catch (error) {
              console.error('Error saving editor data:', error);
            }
          }, 300); // Reduced debounce for faster response
        }
      },
      onReady: () => {
        console.log('Editor.js is ready to work!');
      }
      });

      editorRef.current = editor;
    } catch (error) {
      console.error('Error initializing Editor.js:', error);
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
          console.error('Error destroying editor:', error);
        }
        editorRef.current = null;
      }
    };
  }, [deleteUnusedImages, onChange]);
  
  // Update previous content when value prop changes
  useEffect(() => {
    setPreviousContent(value || '');
  }, [value]);



  return (
    <div className={`word-processor w-full ${className}`}>
      <div 
        ref={holderRef}
        className="min-h-[300px] w-full"
      />
    </div>
  );
};