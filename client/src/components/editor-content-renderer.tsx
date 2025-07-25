import React from 'react';

interface EditorContentRendererProps {
  data: any;
  className?: string;
}

export const EditorContentRenderer: React.FC<EditorContentRendererProps> = ({
  data,
  className = ""
}) => {
  if (!data || !data.blocks || data.blocks.length === 0) {
    return <div className="text-brand-500">No content available</div>;
  }

  const renderBlock = (block: any) => {
    switch (block.type) {
      case 'header':
        const HeaderTag = `h${block.data.level}` as keyof JSX.IntrinsicElements;
        const headerClasses = {
          1: "text-4xl font-bold text-brand-950 mb-6",
          2: "text-3xl font-semibold text-brand-950 mb-5",
          3: "text-2xl font-semibold text-brand-950 mb-4",
          4: "text-xl font-medium text-brand-950 mb-3",
          5: "text-lg font-medium text-brand-950 mb-2",
          6: "text-base font-medium text-brand-950 mb-2"
        };
        return (
          <HeaderTag key={block.id} className={headerClasses[block.data.level as keyof typeof headerClasses]}>
            {block.data.text}
          </HeaderTag>
        );

      case 'paragraph':
        return (
          <p key={block.id} className="text-brand-900 mb-4 leading-relaxed" 
             dangerouslySetInnerHTML={{ __html: block.data.text }} />
        );

      case 'list':
        const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
        const listClasses = block.data.style === 'ordered' 
          ? "list-decimal list-inside mb-4 text-brand-900 space-y-1"
          : "list-disc list-inside mb-4 text-brand-900 space-y-1";
        return (
          <ListTag key={block.id} className={listClasses}>
            {block.data.items.map((item: string, index: number) => (
              <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ListTag>
        );

      case 'quote':
        return (
          <blockquote key={block.id} className="border-l-4 border-brand-300 pl-6 py-2 my-6 bg-brand-50 rounded-r">
            <p className="text-brand-900 italic text-lg mb-2" 
               dangerouslySetInnerHTML={{ __html: block.data.text }} />
            {block.data.caption && (
              <cite className="text-brand-600 text-sm font-medium">
                — {block.data.caption}
              </cite>
            )}
          </blockquote>
        );

      case 'delimiter':
        return (
          <div key={block.id} className="flex justify-center my-8">
            <div className="flex space-x-2">
              <div className="w-1 h-1 bg-brand-400 rounded-full"></div>
              <div className="w-1 h-1 bg-brand-400 rounded-full"></div>
              <div className="w-1 h-1 bg-brand-400 rounded-full"></div>
            </div>
          </div>
        );

      case 'code':
        return (
          <pre key={block.id} className="bg-gray-900 text-green-400 p-4 rounded-lg mb-4 overflow-x-auto">
            <code>{block.data.code}</code>
          </pre>
        );

      case 'table':
        return (
          <div key={block.id} className="overflow-x-auto mb-4">
            <table className="min-w-full border border-brand-200 rounded-lg">
              <tbody>
                {block.data.content.map((row: string[], rowIndex: number) => (
                  <tr key={rowIndex} className={rowIndex === 0 ? "bg-brand-100" : "bg-brand-50"}>
                    {row.map((cell: string, cellIndex: number) => (
                      <td key={cellIndex} 
                          className={`border border-brand-200 px-4 py-2 text-brand-900 ${
                            rowIndex === 0 ? "font-semibold" : ""
                          }`}
                          dangerouslySetInnerHTML={{ __html: cell }} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'image':
        return (
          <div key={block.id} className="my-6">
            <img 
              src={block.data.file.url} 
              alt={block.data.caption || "Content image"}
              className={`rounded-lg mx-auto ${
                block.data.stretched ? "w-full" : "max-w-lg"
              } ${block.data.withBorder ? "border border-brand-200" : ""} ${
                block.data.withBackground ? "bg-brand-50 p-4" : ""
              }`}
            />
            {block.data.caption && (
              <p className="text-center text-brand-600 text-sm mt-2 italic">
                {block.data.caption}
              </p>
            )}
          </div>
        );

      default:
        return (
          <div key={block.id} className="text-brand-500 italic mb-4">
            [Unsupported block type: {block.type}]
          </div>
        );
    }
  };

  return (
    <div className={`prose prose-brand max-w-none ${className}`}>
      {data.blocks.map(renderBlock)}
    </div>
  );
};