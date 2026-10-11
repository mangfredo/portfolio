"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface UseTouchDragOptions {
  onReorder: (fromIndex: number, toIndex: number) => void;
  items: { id: string }[];
}

interface DragState {
  isDragging: boolean;
  dragId: string | null;
  dragOverId: string | null;
  dragIndex: number;
  startY: number;
  currentY: number;
}

/**
 * Hook to enable touch-based drag and drop for reordering lists on mobile.
 * Uses long-press to initiate drag on touch devices.
 */
export function useTouchDrag({ onReorder, items }: UseTouchDragOptions) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragId: null,
    dragOverId: null,
    dragIndex: -1,
    startY: 0,
    currentY: 0,
  });

  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Register an item's DOM element
  const registerItem = useCallback((id: string, element: HTMLElement | null) => {
    if (element) {
      itemRefs.current.set(id, element);
    } else {
      itemRefs.current.delete(id);
    }
  }, []);

  // Get drag handle props for an item
  const getDragHandleProps = useCallback((id: string, index: number) => {
    return {
      onTouchStart: (e: React.TouchEvent) => {
        // Start long press timer - 200ms to initiate drag
        const touch = e.touches[0];
        longPressTimer.current = setTimeout(() => {
          setDragState({
            isDragging: true,
            dragId: id,
            dragOverId: null,
            dragIndex: index,
            startY: touch.clientY,
            currentY: touch.clientY,
          });
          // Haptic feedback if available
          if (navigator.vibrate) {
            navigator.vibrate(50);
          }
        }, 200);
      },
      onTouchMove: (e: React.TouchEvent) => {
        if (!dragState.isDragging || dragState.dragId !== id) {
          // Cancel long press if moved before timer
          if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
          }
          return;
        }

        const touch = e.touches[0];
        setDragState(prev => ({ ...prev, currentY: touch.clientY }));

        // Find which item we're over
        let foundOverId: string | null = null;
        itemRefs.current.forEach((element, itemId) => {
          if (itemId === id) return;
          const rect = element.getBoundingClientRect();
          if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
            foundOverId = itemId;
          }
        });

        if (foundOverId !== dragState.dragOverId) {
          setDragState(prev => ({ ...prev, dragOverId: foundOverId }));
        }
      },
      onTouchEnd: () => {
        // Clear long press timer
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }

        if (dragState.isDragging && dragState.dragId === id && dragState.dragOverId) {
          // Find indices
          const fromIndex = items.findIndex(item => item.id === dragState.dragId);
          const toIndex = items.findIndex(item => item.id === dragState.dragOverId);
          if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
            onReorder(fromIndex, toIndex);
          }
        }

        setDragState({
          isDragging: false,
          dragId: null,
          dragOverId: null,
          dragIndex: -1,
          startY: 0,
          currentY: 0,
        });
      },
      onTouchCancel: () => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
        setDragState({
          isDragging: false,
          dragId: null,
          dragOverId: null,
          dragIndex: -1,
          startY: 0,
          currentY: 0,
        });
      },
    };
  }, [dragState.isDragging, dragState.dragId, dragState.dragOverId, items, onReorder]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  return {
    dragState,
    registerItem,
    getDragHandleProps,
    isDragging: dragState.isDragging,
    dragId: dragState.dragId,
    dragOverId: dragState.dragOverId,
  };
}

/**
 * Simpler approach: Add touch event handlers directly to draggable elements.
 * This function returns props to spread on draggable items for touch support.
 */
export function getTouchDragProps(
  id: string,
  onDragStart: () => void,
  onDragOver: (e: { preventDefault: () => void }) => void,
  onDrop: () => void,
) {
  let longPressTimer: NodeJS.Timeout | null = null;
  let isDragging = false;

  return {
    onTouchStart: (e: React.TouchEvent) => {
      longPressTimer = setTimeout(() => {
        isDragging = true;
        onDragStart();
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }, 200);
    },
    onTouchMove: (e: React.TouchEvent) => {
      if (!isDragging) {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }
        return;
      }
      onDragOver({ preventDefault: () => {} });
    },
    onTouchEnd: () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      if (isDragging) {
        onDrop();
        isDragging = false;
      }
    },
    onTouchCancel: () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      isDragging = false;
    },
  };
}
