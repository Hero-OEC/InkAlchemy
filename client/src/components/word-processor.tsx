import React, { useEffect, useRef } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';
import Delimiter from '@editorjs/delimiter';
import Table from '@editorjs/table';
import CodeTool from '@editorjs/code';
import InlineCode from '@editorjs/inline-code';
import LinkTool from '@editorjs/link';
import Marker from '@editorjs/marker';
import Paragraph from '@editorjs/paragraph';
import ImageTool from '@editorjs/image';
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
        header: {
          class: Header,
          config: {
            placeholder: 'Enter a header',
            levels: [1, 2, 3, 4, 5, 6],
            defaultLevel: 1
          }
        },
        paragraph: {
          class: Paragraph,
          inlineToolbar: true
        },
        list: {
          class: List,
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
        delimiter: {
          class: Delimiter
        },
        table: {
          class: Table,
          inlineToolbar: true,
          config: {
            rows: 2,
            cols: 3
          }
        },
        code: {
          class: CodeTool
        },
        linkTool: {
          class: LinkTool,
          config: {
            endpoint: '/api/fetch-url'
          }
        },
        marker: {
          class: Marker
        },
        inlineCode: {
          class: InlineCode
        },
        image: {
          class: ImageTool,
          config: {
            endpoints: {
              byFile: '/api/upload-image',
              byUrl: '/api/upload-image-by-url',
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
            onChange(JSON.stringify(outputData));
          } catch (error) {
            console.error('Error saving editor data:', error);
          }
        }
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
  }, []);



  return (
    <div className={`word-processor w-full ${className}`}>
      <div 
        ref={holderRef}
        className="min-h-[300px] w-full"
      />
    </div>
  );
};