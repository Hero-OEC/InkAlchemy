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
        }
        .word-processor :global(.codex-editor__redactor) {
          padding-bottom: 200px !important;
        }
        .word-processor :global(.ce-block__content) {
          max-width: 100% !important;
          margin: 0 !important;
        }
        .word-processor :global(.ce-toolbar) {
          margin-left: -30px !important;
        }
        .word-processor :global(.ce-block) {
          margin: 0.5em 0 !important;
        }
        @media (max-width: 768px) {
          .word-processor :global(.ce-toolbar) {
            margin-left: -20px !important;
          }
          .word-processor :global(.ce-block__content) {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
        }
        @media (max-width: 480px) {
          .word-processor :global(.ce-toolbar) {
            margin-left: -15px !important;
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