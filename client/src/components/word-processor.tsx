import React, { useEffect, useRef, useState } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import Quote from '@editorjs/quote';
import Delimiter from '@editorjs/delimiter';
import Table from '@editorjs/table';
import CodeTool from '@editorjs/code';
import LinkTool from '@editorjs/link';
import Marker from '@editorjs/marker';
import InlineCode from '@editorjs/inline-code';


interface WordProcessorProps {
  data?: any;
  onChange?: (data: any) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}

const EDITOR_TOOLS = {
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
  inlineCode: InlineCode
};

export function WordProcessor({ 
  data, 
  onChange, 
  placeholder = "Write your story...",
  readOnly = false,
  className = ""
}: WordProcessorProps) {
  const editorRef = useRef<EditorJS | null>(null);
  const holderRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!holderRef.current) return;

    const editor = new EditorJS({
      holder: holderRef.current,
      tools: EDITOR_TOOLS,
      data: data || {
        blocks: [
          {
            type: 'paragraph',
            data: {
              text: ''
            }
          }
        ]
      },
      placeholder: placeholder,
      readOnly: readOnly,
      onChange: async () => {
        if (onChange && editorRef.current) {
          try {
            const outputData = await editorRef.current.save();
            onChange(outputData);
          } catch (error) {
            console.error('Saving failed:', error);
          }
        }
      },
      onReady: () => {
        setIsReady(true);
      }
    });

    editorRef.current = editor;

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [data, onChange, placeholder, readOnly]);

  const saveData = async () => {
    if (editorRef.current) {
      try {
        const outputData = await editorRef.current.save();
        return outputData;
      } catch (error) {
        console.error('Saving failed:', error);
        return null;
      }
    }
    return null;
  };

  const clearEditor = () => {
    if (editorRef.current) {
      editorRef.current.clear();
    }
  };

  return (
    <div className={`word-processor relative ${className}`}>
      <div 
        ref={holderRef}
        className="editor-container bg-white rounded-xl p-6 min-h-[300px] font-[Cairo] overflow-hidden"
      />
    </div>
  );
}

export default WordProcessor;