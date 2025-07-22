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

interface WordProcessorProps {
  data?: any;
  onChange?: (data: any) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}

export const WordProcessor: React.FC<WordProcessorProps> = ({
  data,
  onChange,
  placeholder = "Start writing...",
  readOnly = false,
  className = ""
}) => {
  const holderRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorJS | null>(null);

  useEffect(() => {
    if (!holderRef.current) return;

    const editor = new EditorJS({
      holder: holderRef.current,
      tools: {
        header: Header,
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
          inlineToolbar: true
        },
        delimiter: Delimiter,
        table: {
          class: Table,
          inlineToolbar: true
        },
        code: CodeTool,
        linkTool: LinkTool,
        marker: Marker,
        inlineCode: InlineCode,
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
      data: data || { blocks: [] },
      readOnly,
      placeholder,
      onChange: async () => {
        if (onChange && editorRef.current) {
          try {
            const outputData = await editorRef.current.save();
            onChange(outputData);
          } catch (error) {
            console.error('Error saving editor data:', error);
          }
        }
      }
    });

    editorRef.current = editor;

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`word-processor w-full ${className}`}>
      <style jsx>{`
        .word-processor :global(.codex-editor) {
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .word-processor :global(.codex-editor__redactor) {
          padding: 0 !important;
          margin: 0 !important;
          padding-bottom: 200px !important;
          max-width: none !important;
        }
        .word-processor :global(.ce-block__content) {
          max-width: none !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .word-processor :global(.ce-block__content),
        .word-processor :global(.ce-block__content *) {
          max-width: none !important;
        }
        .word-processor :global(.ce-block) {
          margin: 0.5em 0 !important;
          padding: 0 !important;
        }
        .word-processor :global(.ce-toolbar) {
          margin-left: -35px !important;
          z-index: 10 !important;
        }
        .word-processor :global(.ce-paragraph),
        .word-processor :global(.ce-header),
        .word-processor :global(.ce-list),
        .word-processor :global(.ce-quote),
        .word-processor :global(.ce-code),
        .word-processor :global(.ce-delimiter) {
          margin: 0 !important;
          padding: 0 !important;
          max-width: none !important;
          width: 100% !important;
        }
        
        /* Remove default Editor.js margins that cause the side spacing */
        .word-processor :global(.codex-editor__redactor) {
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
        
        /* Header styling to make them visually distinct */
        .word-processor :global(.ce-header) {
          font-weight: bold !important;
          line-height: 1.2 !important;
          margin: 1em 0 0.5em 0 !important;
        }
        .word-processor :global(.ce-header[data-level="1"]) {
          font-size: 2em !important;
        }
        .word-processor :global(.ce-header[data-level="2"]) {
          font-size: 1.5em !important;
        }
        .word-processor :global(.ce-header[data-level="3"]) {
          font-size: 1.3em !important;
        }
        .word-processor :global(.ce-header[data-level="4"]) {
          font-size: 1.1em !important;
        }
        .word-processor :global(.ce-header[data-level="5"]) {
          font-size: 1em !important;
          font-weight: 600 !important;
        }
        .word-processor :global(.ce-header[data-level="6"]) {
          font-size: 1em !important;
          font-weight: 500 !important;
        }
        
        /* List styling improvements */
        .word-processor :global(.ce-list) {
          margin: 0.5em 0 !important;
        }
        
        /* Quote styling improvements */
        .word-processor :global(.ce-quote) {
          border-left: 4px solid #ddd !important;
          padding-left: 1em !important;
          margin: 1em 0 !important;
          font-style: italic !important;
        }
        
        /* Code block styling improvements */
        .word-processor :global(.ce-code) {
          background-color: #f5f5f5 !important;
          border: 1px solid #ddd !important;
          border-radius: 4px !important;
          padding: 1em !important;
          margin: 1em 0 !important;
        }
        
        /* Responsive toolbar positioning */
        @media (max-width: 768px) {
          .word-processor :global(.ce-toolbar) {
            margin-left: -25px !important;
          }
        }
        @media (max-width: 480px) {
          .word-processor :global(.ce-toolbar) {
            margin-left: -20px !important;
          }
        }
      `}</style>
      <div 
        ref={holderRef}
        className="min-h-[300px] w-full"
      />
    </div>
  );
};