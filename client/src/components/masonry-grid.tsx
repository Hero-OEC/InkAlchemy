import { useEffect, useRef, ReactNode, useState } from 'react';
import Masonry from 'masonry-layout';

interface MasonryGridProps {
  children: ReactNode;
  className?: string;
}

export function MasonryGrid({
  children,
  className = ""
}: MasonryGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const masonryRef = useRef<Masonry | null>(null);
  const [columnWidth, setColumnWidth] = useState<number>(0);

  // Calculate column width based on screen size
  useEffect(() => {
    const calculateColumnWidth = () => {
      if (!gridRef.current) return;
      
      const containerWidth = gridRef.current.offsetWidth;
      const gap = 24; // 6 * 4px (gap-6 equivalent)
      
      let columns = 1;
      if (window.innerWidth >= 1024) { // lg breakpoint
        columns = 3;
      } else if (window.innerWidth >= 768) { // md breakpoint
        columns = 2;
      }
      
      const totalGaps = (columns - 1) * gap;
      const availableWidth = containerWidth - totalGaps;
      const itemWidth = Math.floor(availableWidth / columns);
      
      setColumnWidth(itemWidth);
    };

    calculateColumnWidth();
    
    const resizeHandler = () => {
      calculateColumnWidth();
    };
    
    window.addEventListener('resize', resizeHandler);
    return () => window.removeEventListener('resize', resizeHandler);
  }, []);

  useEffect(() => {
    if (!gridRef.current || !columnWidth) return;

    // Destroy existing instance
    if (masonryRef.current) {
      masonryRef.current.destroy();
    }

    // Initialize Masonry with calculated column width
    masonryRef.current = new Masonry(gridRef.current, {
      itemSelector: '.masonry-item',
      columnWidth: columnWidth,
      gutter: 24,
      fitWidth: false,
      resize: true,
    });

    // Layout items
    const layoutMasonry = () => {
      if (masonryRef.current) {
        masonryRef.current.reloadItems();
        masonryRef.current.layout();
      }
    };

    const timeoutId = setTimeout(layoutMasonry, 50);

    return () => {
      clearTimeout(timeoutId);
      if (masonryRef.current) {
        masonryRef.current.destroy();
        masonryRef.current = null;
      }
    };
  }, [columnWidth, children]);

  return (
    <div
      ref={gridRef}
      className={`masonry-container ${className}`}
    >
      {children}
    </div>
  );
}

// Wrapper component for ContentCard items in Masonry
interface MasonryItemProps {
  children: ReactNode;
  className?: string;
}

export function MasonryItem({ children, className = "" }: MasonryItemProps) {
  return (
    <div className={`masonry-item ${className}`} style={{ marginBottom: '24px' }}>
      {children}
    </div>
  );
}