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
        header: {
          class: Header,
          config: {
            placeholder: 'Enter a header',
            levels: [1, 2, 3, 4, 5, 6],
            defaultLevel: 1
          },
          shortcut: 'CMD+SHIFT+H'
        },
        paragraph: {
          class: Paragraph,
          inlineToolbar: true
        },
        list: {
          class: List,
          inlineToolbar: true,
          shortcut: 'CMD+SHIFT+L'
        },
        quote: {
          class: Quote,
          inlineToolbar: true,
          config: {
            quotePlaceholder: 'Enter a quote',
            captionPlaceholder: "Quote's author"
          },
          shortcut: 'CMD+SHIFT+O'
        },
        delimiter: {
          class: Delimiter,
          shortcut: 'CMD+SHIFT+D'
        },
        table: {
          class: Table,
          inlineToolbar: true,
          config: {
            rows: 2,
            cols: 3
          },
          shortcut: 'CMD+ALT+T'
        },
        code: {
          class: CodeTool,
          shortcut: 'CMD+SHIFT+C'
        },
        linkTool: {
          class: LinkTool,
          config: {
            endpoint: '/api/fetch-url'
          }
        },
        marker: {
          class: Marker,
          shortcut: 'CMD+SHIFT+M'
        },
        inlineCode: {
          class: InlineCode,
          shortcut: 'CMD+SHIFT+I'
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
      <style dangerouslySetInnerHTML={{
        __html: `
          .word-processor .codex-editor {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .word-processor .codex-editor__redactor {
            padding: 0 !important;
            margin: 0 !important;
            padding-bottom: 200px !important;
            max-width: none !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          .word-processor .ce-block__content {
            max-width: none !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .word-processor .ce-block {
            margin: 0.5em 0 !important;
            padding: 0 !important;
          }
          .word-processor .ce-toolbar {
            margin-left: -35px !important;
            z-index: 10 !important;
          }
          .word-processor .ce-paragraph,
          .word-processor .ce-header,
          .word-processor .ce-list,
          .word-processor .ce-quote,
          .word-processor .ce-code,
          .word-processor .ce-delimiter {
            margin: 0 !important;
            padding: 0 !important;
            max-width: none !important;
            width: 100% !important;
          }
          
          /* Header styling that works */
          .word-processor h1, .word-processor h2, .word-processor h3, 
          .word-processor h4, .word-processor h5, .word-processor h6 {
            font-size: 2em !important;
            font-weight: bold !important;
            line-height: 1.2 !important;
            margin: 0.5em 0 !important;
          }
          
          /* Quote styling */
          .word-processor .ce-quote {
            border-left: 4px solid #ddd !important;
            padding-left: 1em !important;
            margin: 1em 0 !important;
            font-style: italic !important;
          }
          
          /* Code block styling */
          .word-processor .ce-code {
            background-color: #f5f5f5 !important;
            border: 1px solid #ddd !important;
            border-radius: 4px !important;
            padding: 1em !important;
            margin: 1em 0 !important;
          }
          
          @media (max-width: 768px) {
            .word-processor .ce-toolbar {
              margin-left: -25px !important;
            }
          }
          @media (max-width: 480px) {
            .word-processor .ce-toolbar {
              margin-left: -20px !important;
            }
          }
        `
      }} />
      <div 
        ref={holderRef}
        className="min-h-[300px] w-full"
      />
    </div>
  );
};