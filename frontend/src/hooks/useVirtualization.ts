// frontend/src/hooks/useVirtualization.ts
import { useState, useEffect, useRef } from 'react';
import type { RefObject } from 'react';

interface VirtualizationOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

interface VirtualizationResult<T> {
  virtualItems: Array<{
    index: number;
    data: T;
    offsetTop: number;
    height: number;
  }>;
  totalHeight: number;
  containerRef: RefObject<HTMLDivElement | null>;
}

export function useVirtualization<T>(
  items: T[],
  options: VirtualizationOptions
): VirtualizationResult<T> {
  const { itemHeight, containerHeight, overscan = 3 } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', (e) => {
        setScrollTop((e.target as HTMLDivElement).scrollTop);
      });
    }
  }, []);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const virtualItems = items
    .slice(startIndex, endIndex + 1)
    .map((item, index) => ({
      index: startIndex + index,
      data: item,
      offsetTop: (startIndex + index) * itemHeight,
      height: itemHeight,
    }));

  const totalHeight = items.length * itemHeight;

  return {
    virtualItems,
    totalHeight,
    containerRef,
  };
}
