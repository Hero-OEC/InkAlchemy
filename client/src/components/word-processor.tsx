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

  useEffect(() => {
    if (!holderRef.current) return;

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
              byUrl: '/api/upload-image-by-url',
            },
            captionPlaceholder: 'Enter image caption...',
            withBorder: false,
            withBackground: false,
            stretched: false,
            withCaption: true,
            additionalRequestHeaders: {
              'Accept': 'application/json'
            }
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
          try {
            const outputData = await editorRef.current.save();
            const newContent = JSON.stringify(outputData);
            
            // Clean up unused images
            await deleteUnusedImages(previousContent, newContent);
            setPreviousContent(newContent);
            
            onChange(newContent);
          } catch (error) {
            console.error('Error saving editor data:', error);
          }
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
      if (editorRef.current) {
        try {
          editorRef.current.destroy();
        } catch (error) {
          console.error('Error destroying editor:', error);
        }
        editorRef.current = null;
      }
    };
  }, [deleteUnusedImages, previousContent]);



  return (
    <div className={`word-processor w-full ${className}`}>
      <div 
        ref={holderRef}
        className="min-h-[300px] w-full"
      />
    </div>
  );
};