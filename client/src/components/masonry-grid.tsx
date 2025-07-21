import { useEffect, useRef, ReactNode } from 'react';
import Masonry from 'masonry-layout';

interface MasonryGridProps {
  children: ReactNode;
  className?: string;
  itemSelector?: string;
  columnWidth?: number | string;
  gutter?: number;
  horizontalOrder?: boolean;
}

export function MasonryGrid({
  children,
  className = "",
  itemSelector = ".masonry-item",
  columnWidth = ".masonry-sizer",
  gutter = 24, // 6 * 4px (gap-6 equivalent)
  horizontalOrder = true
}: MasonryGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const masonryRef = useRef<Masonry | null>(null);

  useEffect(() => {
    if (!gridRef.current) return;

    // Initialize Masonry
    masonryRef.current = new Masonry(gridRef.current, {
      itemSelector,
      columnWidth,
      gutter,
      horizontalOrder,
      fitWidth: false,
      resize: true,
    });

    // Layout items on load
    const layoutMasonry = () => {
      if (masonryRef.current) {
        masonryRef.current.reloadItems();
        masonryRef.current.layout();
      }
    };

    // Handle images loading
    const images = gridRef.current.querySelectorAll('img');
    let loadedImages = 0;
    const totalImages = images.length;

    if (totalImages === 0) {
      layoutMasonry();
    } else {
      images.forEach(img => {
        if (img.complete) {
          loadedImages++;
          if (loadedImages === totalImages) {
            layoutMasonry();
          }
        } else {
          img.addEventListener('load', () => {
            loadedImages++;
            if (loadedImages === totalImages) {
              layoutMasonry();
            }
          });
        }
      });
    }

    // Layout after a short delay to ensure all content is rendered
    const timeoutId = setTimeout(layoutMasonry, 100);

    return () => {
      clearTimeout(timeoutId);
      if (masonryRef.current) {
        masonryRef.current.destroy();
        masonryRef.current = null;
      }
    };
  }, [children, itemSelector, columnWidth, gutter, horizontalOrder]);

  // Re-layout when children change
  useEffect(() => {
    if (masonryRef.current) {
      const timeoutId = setTimeout(() => {
        masonryRef.current?.reloadItems();
        masonryRef.current?.layout();
      }, 50);

      return () => clearTimeout(timeoutId);
    }
  }, [children]);

  return (
    <div
      ref={gridRef}
      className={`masonry-container ${className}`}
      style={{
        margin: '0 auto', // Center the container
      }}
    >
      {/* Column sizer for responsive columns */}
      <div className="masonry-sizer w-full sm:w-1/2 lg:w-1/3"></div>
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
    <div className={`masonry-item w-full sm:w-1/2 lg:w-1/3 mb-6 ${className}`}>
      <div className="px-3">
        {children}
      </div>
    </div>
  );
}